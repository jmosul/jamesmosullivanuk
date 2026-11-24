import { createContext, use, useLayoutEffect, useState, type ReactNode } from 'react'
import { applyTheme, readStoredTheme, storeTheme, type Theme } from './themes'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
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

  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = (next: Theme) => {
    storeTheme(next)
    setThemeState(next)
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext)

  if (!value) {
    throw new Error('useTheme() must be used inside a ThemeProvider')
  }

  return value
}
