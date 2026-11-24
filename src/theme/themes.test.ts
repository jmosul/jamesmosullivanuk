import { afterEach, describe, expect, test, vi } from 'vitest'
import { applyTheme, DEFAULT_THEME, readStoredTheme, storeTheme, THEME_STORAGE_KEY } from './themes'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('readStoredTheme', () => {
  test('defaults to sci-fi when nothing is stored', () => {
    expect(DEFAULT_THEME).toBe('scifi')
    expect(readStoredTheme()).toBe('scifi')
  })

  test('returns a stored theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'fantasy')
    expect(readStoredTheme()).toBe('fantasy')
  })

  test('ignores an unknown stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'steampunk')
    expect(readStoredTheme()).toBe('scifi')
  })

  test('falls back to the default when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    expect(readStoredTheme()).toBe('scifi')
  })
})

test('storeTheme survives blocked storage', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('blocked', 'SecurityError')
  })
  expect(() => storeTheme('fantasy')).not.toThrow()
})

test('applyTheme sets data-theme on the root element', () => {
  const root = document.createElement('html')
  applyTheme('fantasy', root)
  expect(root.dataset.theme).toBe('fantasy')
})
