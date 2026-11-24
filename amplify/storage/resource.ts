import { defineStorage } from '@aws-amplify/backend'

export const PERSONA_IMAGES_PREFIX = 'persona-images/'

type StorageProps = Parameters<typeof defineStorage>[0]

// Anyone can fetch an image by its path, but not list the folder, so images
// no persona points at (drafts, orphans) can't be discovered. `read` would be
// `get` plus `list`. SuperAdmins' write access is granted to the website's
// SuperAdmin role in backend.ts, because the shared group carries no role for
// referenceAuth to resolve.
export const storageProps = {
  name: 'websiteMedia',
  // Production keeps the bucket and its images if this resource is removed.
  // Amplify also skips the auto-delete-objects custom resource when this is
  // set, so nothing empties the bucket first. Sandboxes always delete.
  keepOnDelete: process.env.AWS_BRANCH === 'main',
  access: (allow) => ({
    [`${PERSONA_IMAGES_PREFIX}*`]: [allow.guest.to(['get']), allow.authenticated.to(['get'])],
  }),
} satisfies StorageProps

export const storage = defineStorage(storageProps)
