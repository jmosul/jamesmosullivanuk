import { THEME_LABELS, THEMES } from './themes'
import { useTheme } from './ThemeProvider'

/** One button per theme; the pressed one is current. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div role="group" aria-label="Theme" className="toggle-group">
      {THEMES.map((name) => (
        <button
          key={name}
          type="button"
          className="toggle"
          aria-pressed={theme === name}
          onClick={() => setTheme(name)}
        >
          {THEME_LABELS[name]}
        </button>
      ))}
    </div>
  )
}
