import { defineStorage } from '@aws-amplify/backend'

export const PERSONA_IMAGES_PREFIX = 'persona-images/'

// Anyone can read images. SuperAdmins' write access is granted to the
// website's SuperAdmin role in backend.ts, because the shared group carries
// no role for referenceAuth to resolve.
export const storage = defineStorage({
  name: 'websiteMedia',
  access: (allow) => ({
    [`${PERSONA_IMAGES_PREFIX}*`]: [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
  }),
})
