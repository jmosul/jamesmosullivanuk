import type { Theme } from './themes'

/** A colour a sci-fi panel tile can be drawn in. */
export interface PanelAccent {
  name: string
  /** Hex, stored on the panel as `accent`. */
  color: string
}

/**
 * One depth position on the homepage stage. Shares of the viewport: `cx` is
 * the panel's centre across, `lift` how far its foot sits above the bottom.
 * `scale` and `opacity` are applied as they read.
 */
export interface PanelSlot {
  cx: number
  lift: number
  scale: number
  opacity: number
}

/**
 * Six slots, front to back: leaving (off to the right), the front panel,
 * three behind it, and arriving (back left, faded out). Panels glide between
 * neighbouring slots as the stage turns.
 */
export interface PanelSlots {
  wide: readonly PanelSlot[]
  /** Phones and portrait windows. */
  narrow: readonly PanelSlot[]
}

/**
 * What differs between themes beyond looks: rules, wording and numbers.
 * Looks belong in tokens.css. Components read a theme's traits, never its
 * name, so adding a theme means filling in a record here rather than finding
 * every branch.
 */
export interface ThemeTraits {
  /** Panels are drawn from an image; until one is added the homepage shows a placeholder. */
  panelNeedsImage: boolean
  /** Colours a panel can pick for its tile; empty when panels have no symbol or accent. */
  panelAccents: readonly PanelAccent[]
  /** How this theme draws panels, for the editor. */
  panelDescription: string
  /** Shown in place of an empty panel subtitle. */
  panelSubtitleFallback: string
  /** Where panels stand on the homepage stage. */
  panelSlots: PanelSlots
}

const slot = (cx: number, lift: number, scale: number, opacity: number): PanelSlot => ({ cx, lift, scale, opacity })

export const THEME_TRAITS: Record<Theme, ThemeTraits> = {
  scifi: {
    panelNeedsImage: false,
    panelAccents: [
      { name: 'Cyan', color: '#5EE6FF' },
      { name: 'Amber', color: '#FFB547' },
      { name: 'Violet', color: '#B79CFF' },
      { name: 'Mint', color: '#7CFFB2' },
    ],
    panelDescription: 'Drawn as tiles. An image, such as a logo, is optional; without one the symbol is shown.',
    panelSubtitleFallback: 'No category',
    panelSlots: {
      wide: [
        slot(1.05, -0.05, 1.25, 0),
        slot(0.85, 0.12, 1, 1),
        slot(0.665, 0.22, 0.78, 0.85),
        slot(0.515, 0.31, 0.62, 0.5),
        slot(0.4, 0.38, 0.5, 0.22),
        slot(0.32, 0.43, 0.42, 0),
      ],
      narrow: [
        slot(1.05, 0.06, 0.72, 0),
        slot(0.7, 0.11, 0.62, 1),
        slot(0.36, 0.17, 0.5, 0.75),
        slot(0.12, 0.23, 0.4, 0.38),
        slot(-0.02, 0.28, 0.33, 0.15),
        slot(-0.1, 0.32, 0.28, 0),
      ],
    },
  },
  fantasy: {
    panelNeedsImage: true,
    panelAccents: [],
    panelDescription:
      'Drawn as watercolour portraits fanning out from the corner. A panel without an image shows a placeholder.',
    panelSubtitleFallback: 'No subtitle',
    panelSlots: {
      wide: [
        slot(1.04, -0.12, 1.1, 0),
        slot(0.855, -0.03, 0.96, 1),
        slot(0.67, 0.04, 0.74, 0.88),
        slot(0.52, 0.1, 0.58, 0.55),
        slot(0.4, 0.16, 0.46, 0.26),
        slot(0.32, 0.2, 0.38, 0),
      ],
      narrow: [
        slot(1.05, -0.06, 0.69, 0),
        slot(0.7, -0.02, 0.6, 1),
        slot(0.36, 0.03, 0.48, 0.75),
        slot(0.12, 0.09, 0.39, 0.4),
        slot(-0.02, 0.14, 0.32, 0.18),
        slot(-0.1, 0.18, 0.28, 0),
      ],
    },
  },
}
