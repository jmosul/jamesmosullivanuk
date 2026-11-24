import { ToggleGroup } from '../components/ToggleGroup'
import { THEME_LABELS, THEMES } from './themes'
import { useTheme } from './ThemeProvider'

/** One button per theme; the pressed one is current. Hidden while a page shows its own theme. */
export function ThemeSwitcher() {
  const { theme, setTheme, override } = useTheme()

  if (override) {
    return null
  }

  return <ToggleGroup label="Theme" options={THEMES} labels={THEME_LABELS} value={theme} onChange={setTheme} />
}
