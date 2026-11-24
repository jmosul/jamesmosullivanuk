/**
 * The site's themes. A theme is only a set of CSS custom properties (see
 * src/styles/tokens.css), chosen by `data-theme` on <html>; components never
 * branch on the theme in TypeScript.
 */
export const THEMES = ['scifi', 'fantasy'] as const

export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'scifi'

/** Also read by the inline script in index.html, which applies it before first paint. */
export const THEME_STORAGE_KEY = 'theme'

export const THEME_LABELS: Record<Theme, string> = {
  scifi: 'Sci-fi',
  fantasy: 'Fantasy',
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

/** The stored theme, or the default when nothing valid is stored or storage is blocked. */
export function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)

    return isTheme(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/** Remembers the theme; a blocked storage only means it won't persist. */
export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Private mode or blocked site data: the theme still applies for this visit.
  }
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme
}
