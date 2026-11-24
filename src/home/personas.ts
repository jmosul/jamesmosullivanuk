import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import type { Theme } from '../theme'

type Persona = Schema['Persona']['type']
type Panel = Persona['panels'][number]
type PanelImage = NonNullable<Panel['image']>

export interface HomeLink {
  label: string
  href: string
  external: boolean
}

/** A panel image with its renditions' addresses signed. */
export interface HomeImage {
  /** The largest rendition that could be signed. */
  src: string
  /** Every signed rendition, as `url 960w, …`. */
  srcSet: string
  alt: string
  /** Intrinsic size of the largest rendition, for the panel's aspect. */
  width: number
  height: number
}

/** A panel as the homepage draws it, with its image's address resolved. */
export interface HomePanel {
  id: string
  title: string
  subtitle: string | null
  /** Null when the panel has no image, or none of its renditions could be signed. */
  image: HomeImage | null
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
  return {
    id: panel.id,
    title: panel.title,
    subtitle: panel.subtitle ?? null,
    image: panel.image ? await toHomeImage(panel.image) : null,
    symbol: panel.symbol ?? null,
    accent: panel.accent ?? null,
  }
}

/**
 * Signs every rendition and lists them as a srcset, largest as `src`. A
 * rendition that can't be signed is left out; if none can, the panel goes
 * without an image (a placeholder or symbol) rather than failing the page.
 */
export async function toHomeImage(image: PanelImage): Promise<HomeImage | null> {
  const variants = uniqueByWidth(image.variants)

  if (variants.length === 0) {
    return null
  }

  const signed = await Promise.allSettled(variants.map((variant) => imageUrl(variant.path)))
  const sources: { url: string; width: number }[] = []

  signed.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sources.push({ url: result.value, width: variants[index].width })
    } else {
      console.warn(`Couldn’t sign ${variants[index].path}`, result.reason)
    }
  })

  if (sources.length === 0) {
    return null
  }

  return {
    src: sources[sources.length - 1].url,
    srcSet: sources.map(({ url, width }) => `${url} ${width}w`).join(', '),
    alt: image.alt,
    width: image.width,
    height: image.height,
  }
}

/** Smallest first, one per width, since a srcset can't repeat a descriptor. */
function uniqueByWidth<T extends { width: number }>(variants: readonly T[]): T[] {
  const sorted = [...variants].sort((a, b) => a.width - b.width)

  return sorted.filter((variant, index) => index === 0 || variant.width !== sorted[index - 1].width)
}

// Storage is only loaded once a panel has an image to show.
async function imageUrl(path: string): Promise<string> {
  const { getUrl } = await import('aws-amplify/storage')
  const { url } = await getUrl({ path, options: { expiresIn: 3600 } })

  return url.toString()
}
