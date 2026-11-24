import { a, defineData, type ClientSchema } from '@aws-amplify/backend'
import { SUPER_ADMINS_GROUP } from '../auth/resource'

export const schema = a.schema({
  PersonaStatus: a.enum(['draft', 'published', 'archived']),
  PersonaTheme: a.enum(['scifi', 'fantasy']),
  PanelRotation: a.enum(['random', 'ordered']),

  PersonaLink: a.customType({
    label: a.string().required(),
    href: a.url().required(),
    external: a.boolean().required(),
  }),

  /** One rendition of a panel image, resolved with getUrl from its path. */
  PanelImageFile: a.customType({
    /** Storage path, e.g. persona-images/<imageId>/960.webp. */
    path: a.string().required(),
    /** Intrinsic size in px. */
    width: a.integer().required(),
    height: a.integer().required(),
    /** e.g. image/webp, or image/png where the browser couldn't encode WebP. */
    contentType: a.string().required(),
  }),

  PanelImage: a.customType({
    alt: a.string().required(),
    /** Intrinsic size of the largest variant, used for the panel's aspect. */
    width: a.integer().required(),
    height: a.integer().required(),
    /** The same image at several widths, served as a srcset. */
    variants: a.ref('PanelImageFile').required().array().required(),
  }),

  /** Panels are stored on their persona, in display order. */
  Panel: a.customType({
    id: a.string().required(),
    title: a.string().required(),
    subtitle: a.string(),
    /** Required for fantasy panels to be shown; optional for sci-fi tiles. */
    image: a.ref('PanelImage'),
    /** Letters shown on a sci-fi tile without an image. */
    symbol: a.string(),
    /** Hex colour for a sci-fi tile. */
    accent: a.string(),
  }),

  Persona: a
    .model({
      /** Public identifier used by the homepage toggles; editable, unlike id. */
      slug: a.string().required(),
      status: a.ref('PersonaStatus').required(),
      /** Position among personas; the lowest published persona is shown first. */
      sortOrder: a.integer().required(),
      label: a.string().required(),
      theme: a.ref('PersonaTheme').required(),
      /** Falls back to the site name when empty. */
      name: a.string(),
      title: a.string(),
      content: a.string().required(),
      panelLabel: a.string(),
      panelHint: a.string(),
      rotation: a.ref('PanelRotation').required(),
      links: a.ref('PersonaLink').required().array().required(),
      panels: a.ref('Panel').required().array().required(),
    })
    .secondaryIndexes((index) => [
      index('status').sortKeys(['sortOrder']).name('personasByStatus').queryField('listPersonasByStatus'),
    ])
    // Anyone can read personas, whatever their status; the homepage asks
    // listPersonasByStatus for 'published'. Only SuperAdmins can write.
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups([SUPER_ADMINS_GROUP]),
    ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    // Signed-out visitors read through the identity pool's guest role.
    // Signed-in users, SuperAdmins included, call with authMode: 'userPool'.
    defaultAuthorizationMode: 'identityPool',
  },
})
