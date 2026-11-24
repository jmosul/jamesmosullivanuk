import type { ThemeTraits } from '../../theme'
import type { Persona, PersonaRecord } from '../personas'

/** The persona as the editor holds it: every field but the ids and timestamps. */
export type PersonaDraft = PersonaRecord
export type Panel = PersonaDraft['panels'][number]
export type PersonaLink = PersonaDraft['links'][number]

/** The fields edited one at a time; links and panels have their own actions. */
export type DraftFields = Omit<PersonaDraft, 'links' | 'panels'>

export type DraftAction =
  | { type: 'set'; fields: Partial<DraftFields> }
  | { type: 'addLink' }
  | { type: 'setLink'; index: number; fields: Partial<PersonaLink> }
  | { type: 'removeLink'; index: number }
  | { type: 'addPanel'; panel: Panel }
  | { type: 'setPanel'; index: number; fields: Partial<Panel> }
  | { type: 'movePanel'; index: number; by: -1 | 1 }
  | { type: 'removePanel'; index: number }

export function toDraft(persona: Persona): PersonaDraft {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...draft } = persona

  return draft
}

const replaceAt = <T>(list: readonly T[], index: number, fields: Partial<T>): T[] =>
  list.map((item, i) => (i === index ? { ...item, ...fields } : item))

const removeAt = <T>(list: readonly T[], index: number): T[] => list.filter((_, i) => i !== index)

function moveBy<T>(list: readonly T[], index: number, by: number): T[] {
  const target = index + by

  if (target < 0 || target >= list.length) {
    return [...list]
  }

  const moved = [...list]
  ;[moved[index], moved[target]] = [moved[target], moved[index]]

  return moved
}

export function draftReducer(draft: PersonaDraft, action: DraftAction): PersonaDraft {
  switch (action.type) {
    case 'set':
      return { ...draft, ...action.fields }
    case 'addLink':
      return { ...draft, links: [...draft.links, { label: '', href: '', external: true }] }
    case 'setLink':
      return { ...draft, links: replaceAt(draft.links, action.index, action.fields) }
    case 'removeLink':
      return { ...draft, links: removeAt(draft.links, action.index) }
    case 'addPanel':
      return { ...draft, panels: [...draft.panels, action.panel] }
    case 'setPanel':
      return { ...draft, panels: replaceAt(draft.panels, action.index, action.fields) }
    case 'movePanel':
      return { ...draft, panels: moveBy(draft.panels, action.index, action.by) }
    case 'removePanel':
      return { ...draft, panels: removeAt(draft.panels, action.index) }
  }
}

/** A blank panel, with the theme's first accent when it has accents. */
export const newPanel = (traits: ThemeTraits, id: string = crypto.randomUUID()): Panel => ({
  id,
  title: 'New panel',
  subtitle: null,
  image: null,
  symbol: null,
  accent: traits.panelAccents[0]?.color ?? null,
})

/** Panels the homepage leaves out in this theme. */
export const hiddenPanels = (draft: PersonaDraft, traits: ThemeTraits): Panel[] =>
  traits.panelNeedsImage ? draft.panels.filter((panel) => !panel.image) : []

/**
 * What stops the persona being published, in the order the editor shows the
 * fields. Empty when it's ready. Only the editor enforces this; the API
 * accepts any status.
 */
export function publishBlockers(draft: PersonaDraft, traits: ThemeTraits): string[] {
  const blockers: string[] = []

  if (!draft.label.trim()) {
    blockers.push('Add a toggle label.')
  }

  if (!draft.content.trim()) {
    blockers.push('Add an introduction.')
  }

  if (draft.links.some((link) => !link.label.trim())) {
    blockers.push('Give every link a label.')
  }

  if (draft.panels.some((panel) => !panel.title.trim())) {
    blockers.push('Give every panel a title.')
  }

  if (draft.panels.length === hiddenPanels(draft, traits).length) {
    blockers.push(traits.panelNeedsImage ? 'Add a panel with an image.' : 'Add a panel.')
  }

  return blockers
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Full addresses with a scheme: the API stores links as AWSURL. */
function isFullAddress(href: string): boolean {
  try {
    const { protocol } = new URL(href)

    return ['https:', 'http:', 'mailto:'].includes(protocol)
  } catch {
    return false
  }
}

/** What stops the draft being saved at all, whatever its status. */
export function saveProblems(draft: PersonaDraft, takenSlugs: readonly string[]): string[] {
  const problems: string[] = []

  if (!SLUG.test(draft.slug)) {
    problems.push('The slug can only use lowercase letters, numbers and single hyphens.')
  } else if (takenSlugs.includes(draft.slug)) {
    problems.push(`Another persona already uses the slug “${draft.slug}”.`)
  }

  draft.links.forEach((link, index) => {
    if (!isFullAddress(link.href.trim())) {
      problems.push(`Link ${index + 1} needs a full address, such as https://…`)
    }
  })

  return problems
}
