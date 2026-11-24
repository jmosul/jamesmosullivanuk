import { expect, test } from 'vitest'
import { THEME_TRAITS } from '../../theme'
import { draftReducer, newPanel, placeholderPanels, publishBlockers, saveProblems, type PersonaDraft } from './draft'

const draft = (fields: Partial<PersonaDraft> = {}): PersonaDraft => ({
  slug: 'engineer',
  status: 'draft',
  sortOrder: 0,
  label: 'Software Engineer',
  theme: 'scifi',
  name: null,
  title: null,
  content: 'Builds things.',
  panelLabel: null,
  panelHint: null,
  rotation: 'ordered',
  links: [],
  panels: [newPanel(THEME_TRAITS.scifi, 'p1')],
  ...fields,
})

const panel = (id: string, fields = {}) => ({ ...newPanel(THEME_TRAITS.scifi, id), ...fields })

test('a new sci-fi panel takes the first accent; a fantasy one has none', () => {
  expect(newPanel(THEME_TRAITS.scifi, 'a').accent).toBe('#5EE6FF')
  expect(newPanel(THEME_TRAITS.fantasy, 'a').accent).toBeNull()
})

test('movePanel swaps neighbours and stops at the ends', () => {
  const start = draft({ panels: [panel('a'), panel('b'), panel('c')] })
  const ids = (d: PersonaDraft) => d.panels.map((p) => p.id)

  expect(ids(draftReducer(start, { type: 'movePanel', index: 0, by: 1 }))).toEqual(['b', 'a', 'c'])
  expect(ids(draftReducer(start, { type: 'movePanel', index: 2, by: -1 }))).toEqual(['a', 'c', 'b'])
  expect(ids(draftReducer(start, { type: 'movePanel', index: 0, by: -1 }))).toEqual(['a', 'b', 'c'])
})

test('setPanelImage finds the panel by id and defaults the alt text to its title', () => {
  const image = { alt: '', width: 1600, height: 1200, variants: [] }
  const start = draft({ panels: [panel('a', { title: 'Alpha' }), panel('b', { title: 'Beta' })] })
  const set = draftReducer(start, { type: 'setPanelImage', id: 'b', image })

  expect(set.panels.map((p) => p.image)).toEqual([null, { ...image, alt: 'Beta' }])
  expect(draftReducer(start, { type: 'setPanelImage', id: 'a', image: { ...image, alt: 'Given' } }).panels[0].image?.alt).toBe(
    'Given',
  )
  expect(draftReducer(start, { type: 'setPanelImage', id: 'gone', image }).panels).toEqual(start.panels)
})

test('link actions add, change and remove', () => {
  let d = draftReducer(draft(), { type: 'addLink' })
  d = draftReducer(d, { type: 'setLink', index: 0, fields: { label: 'LinkedIn' } })

  expect(d.links).toEqual([{ label: 'LinkedIn', href: '', external: true }])
  expect(draftReducer(d, { type: 'removeLink', index: 0 }).links).toEqual([])
})

test('a complete sci-fi persona is ready to publish', () => {
  expect(publishBlockers(draft())).toEqual([])
})

test('lists what a persona is missing before it can be published', () => {
  const blockers = publishBlockers(
    draft({ label: ' ', content: '', links: [{ label: '', href: 'https://x.test', external: true }], panels: [] }),
  )

  expect(blockers).toEqual([
    'Add a toggle label.',
    'Add an introduction.',
    'Give every link a label.',
    'Add a panel.',
  ])
})

test('fantasy panels without an image are placeholders, not blockers', () => {
  const traits = THEME_TRAITS.fantasy
  const image = {
    alt: 'A',
    width: 2,
    height: 3,
    variants: [{ path: 'persona-images/a/480.webp', width: 2, height: 3, contentType: 'image/webp' }],
  }
  const withPanels = draft({ theme: 'fantasy', panels: [panel('a'), panel('b', { image })] })

  expect(publishBlockers(withPanels)).toEqual([])
  expect(placeholderPanels(withPanels, traits).map((p) => p.id)).toEqual(['a'])
})

test('save checks the slug and link addresses', () => {
  expect(saveProblems(draft(), [])).toEqual([])
  expect(saveProblems(draft({ slug: 'Engineer!' }), [])).toHaveLength(1)
  expect(saveProblems(draft(), ['engineer'])).toEqual(['Another persona already uses the slug “engineer”.'])
  expect(
    saveProblems(draft({ links: [{ label: 'LinkedIn', href: 'linkedin.com/in/x', external: true }] }), []),
  ).toEqual(['Link 1 needs a full address, such as https://…'])
})
