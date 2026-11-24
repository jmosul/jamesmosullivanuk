import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { THEME_STORAGE_KEY } from './themes'
import { ThemeProvider } from './ThemeProvider'
import { ThemeSwitcher } from './ThemeSwitcher'

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

const renderSwitcher = () =>
  render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>,
  )

const pressed = (name: string) =>
  screen.getByRole('button', { name }).getAttribute('aria-pressed')

test('starts on sci-fi and applies it to <html>', () => {
  renderSwitcher()

  expect(pressed('Sci-fi')).toBe('true')
  expect(pressed('Fantasy')).toBe('false')
  expect(document.documentElement.dataset.theme).toBe('scifi')
})

test('switching applies and remembers the theme', () => {
  renderSwitcher()

  fireEvent.click(screen.getByRole('button', { name: 'Fantasy' }))

  expect(pressed('Fantasy')).toBe('true')
  expect(document.documentElement.dataset.theme).toBe('fantasy')
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('fantasy')
})

test('restores the remembered theme', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'fantasy')
  renderSwitcher()

  expect(pressed('Fantasy')).toBe('true')
  expect(document.documentElement.dataset.theme).toBe('fantasy')
})
