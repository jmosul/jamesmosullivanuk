import { referenceAuth } from '@aws-amplify/backend'
import { Lazy } from 'aws-cdk-lib'

/** The shared directory's group allowed to create and edit website content. */
export const SUPER_ADMINS_GROUP = 'SuperAdmins'

export type SharedAuthReferences = {
  userPoolId: string
  userPoolClientId: string
  identityPoolId: string
  authRoleArn: string
  unauthRoleArn: string
}

let references: SharedAuthReferences | undefined

/**
 * Supplies the IDs of the shared user pool and the website's client, identity
 * pool and roles once backend.ts has created them.
 */
export const bindSharedAuth = (value: SharedAuthReferences) => {
  if (references) {
    throw new Error('Shared auth references are already bound')
  }
  references = value
}

// defineBackend builds Amplify auth before backend.ts can create the shared
// pool's stack, so the IDs are passed lazily and resolved at synthesis.
const reference = (key: keyof SharedAuthReferences) =>
  Lazy.string({
    produce: () => {
      if (!references) {
        throw new Error('bindSharedAuth() must be called in amplify/backend.ts')
      }

      return references[key]
    },
  })

// SuperAdmins is deliberately not passed as a group: referenceAuth requires a
// group role ARN on the shared group, which would apply to every app using the
// directory. Data rules read the cognito:groups claim instead, and backend.ts
// grants the website's SuperAdmin role its storage access.
export const auth = referenceAuth({
  userPoolId: reference('userPoolId'),
  userPoolClientId: reference('userPoolClientId'),
  identityPoolId: reference('identityPoolId'),
  authRoleArn: reference('authRoleArn'),
  unauthRoleArn: reference('unauthRoleArn'),
})
