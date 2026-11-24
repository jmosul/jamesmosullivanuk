import { defineBackend } from '@aws-amplify/backend'
import { RemovalPolicy, Stack } from 'aws-cdk-lib'
import {
  AccountRecovery,
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  CfnUserPoolGroup,
  UserPool,
} from 'aws-cdk-lib/aws-cognito'
import { FederatedPrincipal, Policy, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam'
import { auth, bindSharedAuth, SUPER_ADMINS_GROUP } from './auth/resource'
import { data } from './data/resource'
import { listPublishedPersonas } from './functions/list-published-personas/resource'
import { PERSONA_IMAGES_PREFIX, storage } from './storage/resource'

const backend = defineBackend({ auth, data, storage, listPublishedPersonas })
const authStack = backend.createStack('SharedAuth')

// ── Shared directory: one list of users for every app ──

const userPool = new UserPool(authStack, 'SharedUserPool', {
  signInAliases: { email: true },
  signInCaseSensitive: false,
  autoVerify: { email: true },
  standardAttributes: { email: { required: true, mutable: true } },
  selfSignUpEnabled: false,
  accountRecovery: AccountRecovery.EMAIL_ONLY,
  deletionProtection: true,
  removalPolicy: RemovalPolicy.RETAIN,
})

new CfnUserPoolGroup(authStack, 'SuperAdmins', {
  groupName: SUPER_ADMINS_GROUP,
  userPoolId: userPool.userPoolId,
})

// ── The website's access to the shared directory ──

const websiteClient = userPool.addClient('WebsiteClient', {
  generateSecret: false,
  authFlows: { userSrp: true },
  preventUserExistenceErrors: true,
})

const websiteIdentityPool = new CfnIdentityPool(authStack, 'WebsiteIdentityPool', {
  allowUnauthenticatedIdentities: true,
  cognitoIdentityProviders: [
    {
      clientId: websiteClient.userPoolClientId,
      providerName: userPool.userPoolProviderName,
    },
  ],
})

const identityPoolRole = (id: string, amr: 'authenticated' | 'unauthenticated') =>
  new Role(authStack, id, {
    assumedBy: new FederatedPrincipal(
      'cognito-identity.amazonaws.com',
      {
        StringEquals: { 'cognito-identity.amazonaws.com:aud': websiteIdentityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': amr },
      },
      'sts:AssumeRoleWithWebIdentity',
    ),
  })

const websiteAuthRole = identityPoolRole('WebsiteAuthRole', 'authenticated')
const websiteGuestRole = identityPoolRole('WebsiteGuestRole', 'unauthenticated')
const websiteSuperAdminRole = identityPoolRole('WebsiteSuperAdminRole', 'authenticated')

// SuperAdmins map to the website's own admin role here, not through a role on
// the shared group, so other apps can map the same group to their own roles.
new CfnIdentityPoolRoleAttachment(authStack, 'WebsiteIdentityPoolRoles', {
  identityPoolId: websiteIdentityPool.ref,
  roles: {
    authenticated: websiteAuthRole.roleArn,
    unauthenticated: websiteGuestRole.roleArn,
  },
  roleMappings: {
    website: {
      type: 'Rules',
      ambiguousRoleResolution: 'AuthenticatedRole',
      identityProvider: `${userPool.userPoolProviderName}:${websiteClient.userPoolClientId}`,
      rulesConfiguration: {
        rules: [
          {
            claim: 'cognito:groups',
            matchType: 'Contains',
            value: SUPER_ADMINS_GROUP,
            roleArn: websiteSuperAdminRole.roleArn,
          },
        ],
      },
    },
  },
})

bindSharedAuth({
  userPoolId: userPool.userPoolId,
  userPoolClientId: websiteClient.userPoolClientId,
  identityPoolId: websiteIdentityPool.ref,
  authRoleArn: websiteAuthRole.roleArn,
  unauthRoleArn: websiteGuestRole.roleArn,
})

// ── Public read of published personas ──

const personaTable = backend.data.resources.tables['Persona']
const publicReader = backend.listPublishedPersonas.resources.lambda
personaTable.grantReadData(publicReader)
backend.listPublishedPersonas.addEnvironment('PERSONA_TABLE_NAME', personaTable.tableName)

// Amplify grants the guest role the query itself, but grants nested types only
// when a model happens to use them, and never PublicPersona. Guests need every
// type in the response. Signed-in users call with authMode: 'userPool'.
const { graphqlApi } = backend.data.resources
new Policy(Stack.of(graphqlApi), 'GuestPublicPersonaTypes', {
  roles: [backend.auth.resources.unauthenticatedUserIamRole],
  statements: [
    new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: ['PublicPersona', 'PersonaLink', 'Panel', 'PanelImage'].map(
        (type) => `${graphqlApi.arn}/types/${type}/*`,
      ),
    }),
  ],
})

// ── SuperAdmins manage persona images ──

// The policy lives in the storage stack so it depends on SharedAuth, not the
// other way round.
const { bucket } = backend.storage.resources
new Policy(Stack.of(bucket), 'SuperAdminPersonaImages', {
  roles: [websiteSuperAdminRole],
  statements: [
    new PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:AbortMultipartUpload'],
      resources: [bucket.arnForObjects(`${PERSONA_IMAGES_PREFIX}*`)],
    }),
    new PolicyStatement({
      actions: ['s3:ListBucket'],
      resources: [bucket.bucketArn],
      conditions: {
        StringLike: { 's3:prefix': [PERSONA_IMAGES_PREFIX, `${PERSONA_IMAGES_PREFIX}*`] },
      },
    }),
  ],
})

backend.addOutput({
  custom: {
    shared_user_pool_id: userPool.userPoolId,
    shared_user_pool_region: Stack.of(userPool).region,
  },
})
