import { expect, test } from 'vitest'
import {
  createDraftPersona,
  nextSortOrder,
  slugify,
  uniqueSlug,
  type Persona,
  type PersonaStore,
} from './personas'

const existing = (slug: string, sortOrder: number) => ({ slug, sortOrder }) as Persona

function fakeStore(personas: Persona[]): PersonaStore & { created: Persona[] } {
  const created: Persona[] = []

  return {
    created,
    list: async () => personas,
    create: async (record) => {
      const persona = { ...record, id: 'new-id', createdAt: '', updatedAt: '' } as Persona
      created.push(persona)

      return persona
    },
  }
}

test('slugify lowercases, strips accents and collapses punctuation', () => {
  expect(slugify('  Software Engineer! ')).toBe('software-engineer')
  expect(slugify('Séan Ó Súilleabháin')).toBe('sean-o-suilleabhain')
  expect(slugify('???')).toBe('persona')
})

test('uniqueSlug appends the first free number', () => {
  expect(uniqueSlug('Worldbuilder', [])).toBe('worldbuilder')
  expect(uniqueSlug('Worldbuilder', ['worldbuilder'])).toBe('worldbuilder-2')
  expect(uniqueSlug('Worldbuilder', ['worldbuilder', 'worldbuilder-2'])).toBe('worldbuilder-3')
})

test('nextSortOrder starts at 0 and follows the highest', () => {
  expect(nextSortOrder([])).toBe(0)
  expect(nextSortOrder([{ sortOrder: 0 }, { sortOrder: 4 }, { sortOrder: 2 }])).toBe(5)
})

test('createDraftPersona sets the defaults', async () => {
  const store = fakeStore([existing('engineer', 0), existing('worldbuilder', 3)])

  await createDraftPersona(store, { name: ' Engineer ', content: ' Hello ', theme: 'fantasy' })

  expect(store.created[0]).toMatchObject({
    slug: 'engineer-2',
    status: 'draft',
    sortOrder: 4,
    label: 'Engineer',
    name: 'Engineer',
    content: 'Hello',
    theme: 'fantasy',
    rotation: 'ordered',
    links: [],
    panels: [],
  })
})
