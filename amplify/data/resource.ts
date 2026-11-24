import { a, defineData, type ClientSchema } from '@aws-amplify/backend'
import { SUPER_ADMINS_GROUP } from '../auth/resource'
import { listPublishedPersonas } from '../functions/list-published-personas/resource'

export const schema = a.schema({
  PersonaStatus: a.enum(['draft', 'published', 'archived']),
  PersonaTheme: a.enum(['scifi', 'fantasy']),
  PanelRotation: a.enum(['random', 'ordered']),

  PersonaLink: a.customType({
    label: a.string().required(),
    href: a.url().required(),
    external: a.boolean().required(),
  }),

  PanelImage: a.customType({
    /** Storage path, e.g. persona-images/<uuid>.webp. */
    path: a.string().required(),
    alt: a.string().required(),
    width: a.integer().required(),
    height: a.integer().required(),
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
    // Only SuperAdmins can read or write records, including drafts and
    // archived personas. Visitors use listPublishedPersonas.
    .authorization((allow) => [allow.groups([SUPER_ADMINS_GROUP])]),

  /** The published view of a persona: no status, IDs or timestamps. */
  PublicPersona: a.customType({
    slug: a.string().required(),
    label: a.string().required(),
    theme: a.ref('PersonaTheme').required(),
    name: a.string(),
    title: a.string(),
    content: a.string().required(),
    panelLabel: a.string(),
    panelHint: a.string(),
    rotation: a.ref('PanelRotation').required(),
    links: a.ref('PersonaLink').required().array().required(),
    panels: a.ref('Panel').required().array().required(),
  }),

  /** Published personas in display order, readable by anyone. */
  listPublishedPersonas: a
    .query()
    .returns(a.ref('PublicPersona').required().array().required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    // A Lambda rather than a JS resolver: AppSync JS resolvers in Amplify
    // don't support identity pool (guest) access.
    .handler(a.handler.function(listPublishedPersonas)),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    // Signed-out visitors read through the identity pool's guest role.
    // SuperAdmins sign in and call with authMode: 'userPool'.
    defaultAuthorizationMode: 'identityPool',
  },
})
