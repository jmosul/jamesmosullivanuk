import type { Theme } from './themes'

/** A colour a sci-fi panel tile can be drawn in. */
export interface PanelAccent {
  name: string
  /** Hex, stored on the panel as `accent`. */
  color: string
}

/**
 * What differs between themes beyond looks: rules and wording. Looks belong
 * in tokens.css. Components read a theme's traits, never its name, so adding
 * a theme means filling in a record here rather than finding every branch.
 */
export interface ThemeTraits {
  /** Panels without an image are left off the homepage. */
  panelNeedsImage: boolean
  /** Colours a panel can pick for its tile; empty when panels have no symbol or accent. */
  panelAccents: readonly PanelAccent[]
  /** How this theme draws panels, for the editor. */
  panelDescription: string
  /** Shown in place of an empty panel subtitle. */
  panelSubtitleFallback: string
}

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
  },
  fantasy: {
    panelNeedsImage: true,
    panelAccents: [],
    panelDescription: 'Drawn as watercolour portraits fanning out from the corner. Every panel needs an image.',
    panelSubtitleFallback: 'No subtitle',
  },
}
