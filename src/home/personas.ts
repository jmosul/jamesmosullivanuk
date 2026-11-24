import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import type { Theme } from '../theme'

type Persona = Schema['Persona']['type']
type Panel = Persona['panels'][number]

export interface HomeLink {
  label: string
  href: string
  external: boolean
}

/** A panel as the homepage draws it, with its image's address resolved. */
export interface HomePanel {
  id: string
  title: string
  subtitle: string | null
  image: { src: string; alt: string; width: number; height: number } | null
  symbol: string | null
  accent: string | null
}

/** A published persona, as the homepage shows it. */
export interface HomePersona {
  id: string
  label: string
  theme: Theme
  /** Shown as the heading; falls back to the site name. */
  name: string | null
  title: string | null
  content: string
  panelLabel: string | null
  panelHint: string | null
  rotation: 'random' | 'ordered'
  links: HomeLink[]
  panels: HomePanel[]
}

/** Where the homepage gets its personas. */
export interface HomePersonaSource {
  /** Published personas in display order. */
  listPublished(): Promise<HomePersona[]>
}

/** Published personas from the API, read as a guest. */
export function createPublicPersonaSource(): HomePersonaSource {
  const { Persona } = generateClient<Schema>().models

  return {
    async listPublished() {
      const personas: Persona[] = []
      let nextToken: string | null | undefined
      do {
        const page = await Persona.listPersonasByStatus({ status: 'published' }, { nextToken })

        if (page.errors?.length) {
          throw new Error(page.errors[0].message)
        }

        personas.push(...page.data)
        nextToken = page.nextToken
      } while (nextToken)

      return Promise.all(personas.map(toHomePersona))
    },
  }
}

async function toHomePersona(persona: Persona): Promise<HomePersona> {
  return {
    id: persona.slug,
    label: persona.label,
    theme: persona.theme ?? 'scifi',
    name: persona.name ?? null,
    title: persona.title ?? null,
    content: persona.content,
    panelLabel: persona.panelLabel ?? null,
    panelHint: persona.panelHint ?? null,
    rotation: persona.rotation ?? 'ordered',
    links: persona.links.map(({ label, href, external }) => ({ label, href, external })),
    panels: await Promise.all(persona.panels.map(toHomePanel)),
  }
}

async function toHomePanel(panel: Panel): Promise<HomePanel> {
  const { image } = panel

  return {
    id: panel.id,
    title: panel.title,
    subtitle: panel.subtitle ?? null,
    image: image
      ? { src: await imageUrl(image.path), alt: image.alt, width: image.width, height: image.height }
      : null,
    symbol: panel.symbol ?? null,
    accent: panel.accent ?? null,
  }
}

// Storage is only loaded once a panel has an image to show.
async function imageUrl(path: string): Promise<string> {
  const { getUrl } = await import('aws-amplify/storage')
  const { url } = await getUrl({ path, options: { expiresIn: 3600 } })

  return url.toString()
}
