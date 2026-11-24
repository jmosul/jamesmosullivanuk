import { createContext, use, useLayoutEffect, useState, type ReactNode } from 'react'
import { applyTheme, readStoredTheme, storeTheme, type Theme } from './themes'

interface ThemeContextValue {
  /** The visitor's chosen theme, as remembered. */
  theme: Theme
  setTheme: (theme: Theme) => void
  /** The theme a page is showing instead of the visitor's, if any (see useThemeOverride). */
  override: Theme | null
  setOverride: (theme: Theme | null) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Holds the current theme, mirrors it onto <html data-theme> and remembers it
 * in localStorage. Styling follows from CSS alone.
 */
export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode
  /** Overrides the stored theme; for tests. */
  initialTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(() => initialTheme ?? readStoredTheme())
  const [override, setOverride] = useState<Theme | null>(null)
  const applied = override ?? theme

  useLayoutEffect(() => {
    applyTheme(applied)
  }, [applied])

  const setTheme = (next: Theme) => {
    storeTheme(next)
    setThemeState(next)
  }

  return <ThemeContext value={{ theme, setTheme, override, setOverride }}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext)

  if (!value) {
    throw new Error('useTheme() must be used inside a ThemeProvider')
  }

  return value
}

/**
 * Shows the page in `theme` while the calling component is mounted, without
 * touching the visitor's stored choice. For pages about one persona, which
 * wear that persona's theme.
 */
export function useThemeOverride(theme: Theme): void {
  const { setOverride } = useTheme()

  useLayoutEffect(() => {
    setOverride(theme)

    return () => setOverride(null)
  }, [theme, setOverride])
}
