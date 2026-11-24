import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import type { Theme } from '../theme'

export type Persona = Schema['Persona']['type']

/** What the admin types in when starting a persona. */
export interface NewPersona {
  name: string
  content: string
  theme: Theme
}

/** Every field a new Persona record is created with. */
export type PersonaRecord = Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>

/** The persona table, as the admin screens need it. */
export interface PersonaStore {
  /** Every persona, whatever its status. */
  list(): Promise<Persona[]>
  create(record: PersonaRecord): Promise<Persona>
}

/** Lowercase letters, digits and single hyphens; 'persona' when nothing usable is left. */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'persona'
}

/** The slug for a name; if it's taken, the first free `-2`, `-3`... */
export function uniqueSlug(name: string, taken: Iterable<string>): string {
  const used = new Set(taken)
  const base = slugify(name)
  if (!used.has(base)) return base
  for (let n = 2; ; n++) {
    if (!used.has(`${base}-${n}`)) return `${base}-${n}`
  }
}

/** One more than the highest sortOrder, or 0 when there are no personas. */
export function nextSortOrder(personas: readonly Pick<Persona, 'sortOrder'>[]): number {
  return personas.reduce((next, persona) => Math.max(next, persona.sortOrder + 1), 0)
}

/** Personas in the order they are shown. */
export const bySortOrder = (personas: readonly Persona[]): Persona[] =>
  [...personas].sort((a, b) => a.sortOrder - b.sortOrder)

/**
 * Creates a draft persona. The admin supplies the name, content and theme;
 * everything else is set here: status draft, rotation ordered, no links or
 * panels, the slug from the name, and the sortOrder after the existing ones.
 * The label (the homepage toggle's text) starts as the name.
 */
export async function createDraftPersona(store: PersonaStore, input: NewPersona): Promise<Persona> {
  const existing = await store.list()
  const name = input.name.trim()
  return store.create({
    slug: uniqueSlug(
      name,
      existing.map((persona) => persona.slug),
    ),
    status: 'draft',
    sortOrder: nextSortOrder(existing),
    label: name,
    theme: input.theme,
    name,
    content: input.content.trim(),
    rotation: 'ordered',
    links: [],
    panels: [],
  })
}

/** The live table, called as the signed-in SuperAdmin. */
export function createPersonaStore(): PersonaStore {
  const { Persona } = generateClient<Schema>({ authMode: 'userPool' }).models
  return {
    async list() {
      const personas: Persona[] = []
      let nextToken: string | null | undefined
      do {
        const page = await Persona.list({ nextToken })
        if (page.errors?.length) throw new Error(page.errors[0].message)
        personas.push(...page.data)
        nextToken = page.nextToken
      } while (nextToken)
      return personas
    },
    async create(record) {
      const { data, errors } = await Persona.create(record)
      if (errors?.length || !data) throw new Error(errors?.[0]?.message ?? 'The persona was not saved.')
      return data
    },
  }
}
