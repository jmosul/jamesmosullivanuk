// @vitest-environment node
import { expect, test } from 'vitest'
import type { Schema } from '../../data/resource'
import { toPublicPersona } from './handler'

type Persona = Schema['Persona']['type']

const persona = (overrides: Partial<Persona>): Persona => ({
  id: 'b0c1',
  slug: 'worldbuilder',
  status: 'published',
  sortOrder: 1,
  label: 'Worldbuilder',
  theme: 'fantasy',
  name: null,
  title: null,
  content: 'By day I build software for the web.',
  panelLabel: 'Stepping forward',
  panelHint: null,
  rotation: 'random',
  links: [],
  panels: [
    {
      id: 'thalina',
      title: 'Queen Thalina I',
      subtitle: 'Albriah, World of Eate',
      image: { path: 'persona-images/thalina.webp', alt: 'Watercolour portrait', width: 1024, height: 1536 },
    },
    { id: 'draft-panel', title: 'New panel', image: null },
  ],
  createdAt: '2026-11-24T00:00:00.000Z',
  updatedAt: '2026-11-24T00:00:00.000Z',
  ...overrides,
})

test('strips status, ids and timestamps', () => {
  const result = toPublicPersona(persona({}))
  expect(Object.keys(result).sort()).toEqual(
    ['content', 'label', 'links', 'name', 'panelHint', 'panelLabel', 'panels', 'rotation', 'slug', 'theme', 'title'],
  )
})

test('drops fantasy panels without an image', () => {
  expect(toPublicPersona(persona({})).panels.map((panel) => panel.id)).toEqual(['thalina'])
})

test('keeps sci-fi panels without an image', () => {
  const result = toPublicPersona(
    persona({ theme: 'scifi', panels: [{ id: 'php', title: 'PHP', symbol: 'Ph', accent: '#B79CFF', image: null }] }),
  )
  expect(result.panels.map((panel) => panel.id)).toEqual(['php'])
})
