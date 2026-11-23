import { defineBackend } from '@aws-amplify/backend'
import { RemovalPolicy, Stack } from 'aws-cdk-lib'
import { AccountRecovery, UserPool } from 'aws-cdk-lib/aws-cognito'

const backend = defineBackend({})
const authStack = backend.createStack('SharedAuth')

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

backend.addOutput({
  custom: {
    shared_user_pool_id: userPool.userPoolId,
    shared_user_pool_region: Stack.of(userPool).region,
  },
})
