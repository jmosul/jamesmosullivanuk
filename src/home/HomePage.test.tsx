import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { THEME_STORAGE_KEY, ThemeProvider } from '../theme'
import { HomePage } from './HomePage'
import type { HomePanel, HomePersona, HomePersonaSource } from './personas'

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

const panel = (id: string, overrides: Partial<HomePanel> = {}): HomePanel => ({
  id,
  title: id.toUpperCase(),
  subtitle: null,
  image: null,
  symbol: id.slice(0, 2),
  accent: null,
  ...overrides,
})

const persona = (overrides: Partial<HomePersona>): HomePersona => ({
  id: 'engineer',
  label: 'Software Engineer',
  theme: 'scifi',
  name: null,
  title: 'Principal Software Engineer',
  content: 'I build software.',
  panelLabel: 'In the stack',
  panelHint: null,
  rotation: 'ordered',
  links: [{ label: 'LinkedIn profile', href: 'https://example.test/me', external: true }],
  panels: [panel('php', { subtitle: 'Language' }), panel('node'), panel('aws')],
  ...overrides,
})

const PERSONAS = [
  persona({}),
  persona({
    id: 'worldbuilder',
    label: 'Worldbuilder',
    theme: 'fantasy',
    title: null,
    content: 'I build worlds.',
    links: [],
    panels: [
      panel('riemar'),
      panel('maeve', {
        image: {
          src: '/maeve-960.webp',
          srcSet: '/maeve-480.webp 480w, /maeve-960.webp 960w',
          alt: 'Maeve',
          width: 2,
          height: 3,
        },
      }),
    ],
  }),
]

const source = (personas: HomePersona[] = PERSONAS): HomePersonaSource => ({
  listPublished: () => Promise.resolve(personas),
})

const renderHome = (personas?: HomePersona[]) =>
  render(
    <ThemeProvider>
      <HomePage source={source(personas)} />
    </ThemeProvider>,
  )

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed')

test('shows the site name and the first persona', async () => {
  renderHome()

  expect(await screen.findByText('I build software.')).toBeTruthy()
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('James O’Sullivan')
  expect(pressed('Software Engineer')).toBe('true')
  expect(screen.getByRole('link', { name: /LinkedIn profile/ }).getAttribute('target')).toBe('_blank')
  expect(document.documentElement.dataset.theme).toBe('scifi')
})

test('choosing a persona switches and remembers its theme', async () => {
  renderHome()

  fireEvent.click(await screen.findByRole('button', { name: 'Worldbuilder' }))

  expect(screen.getByText('I build worlds.')).toBeTruthy()
  expect(pressed('Worldbuilder')).toBe('true')
  expect(document.documentElement.dataset.theme).toBe('fantasy')
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('fantasy')
})

test('starts on a persona in the visitor’s remembered theme', async () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'fantasy')
  renderHome()

  expect(await screen.findByText('I build worlds.')).toBeTruthy()
})

test('each persona layer carries its own theme', async () => {
  const { container } = renderHome()
  await screen.findByText('I build software.')

  const layers = [...container.querySelectorAll<HTMLElement>('.persona-layer')]

  expect(layers.map((layer) => [layer.dataset.theme, layer.dataset.active])).toEqual([
    ['scifi', 'true'],
    ['fantasy', 'false'],
  ])
})

test('the caption names the front panel and follows next and previous', async () => {
  renderHome()
  const caption = () => within(screen.getByRole('status'))

  expect(await screen.findByRole('status')).toBeTruthy()
  expect(caption().getByText('PHP')).toBeTruthy()
  expect(caption().getByText('Language')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(caption().getByText('NODE')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
  fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
  expect(caption().getByText('AWS')).toBeTruthy()
})

test('fantasy panels without an image are drawn as a placeholder', async () => {
  const { container } = renderHome()
  await screen.findByText('I build software.')

  const fantasy = container.querySelector('.persona-layer[data-theme="fantasy"]')

  expect(fantasy?.querySelectorAll('[data-placeholder="portrait"]')).toHaveLength(1)
  expect(fantasy?.querySelector('img.portrait')?.getAttribute('src')).toBe('/maeve-960.webp')
})

test('panel images offer every rendition, sized as drawn at the front', async () => {
  const { container } = renderHome()
  await screen.findByText('I build software.')

  const portrait = container.querySelector('.persona-layer[data-theme="fantasy"] img.portrait')

  expect(portrait?.getAttribute('srcset')).toBe('/maeve-480.webp 480w, /maeve-960.webp 960w')
  // jsdom's window is 1024×768, so wide: a 2:3 portrait 768px tall, at the front slot's 0.96.
  expect(portrait?.getAttribute('sizes')).toBe('492px')
})

test('a single persona has no toggles', async () => {
  renderHome([persona({})])
  await screen.findByText('I build software.')

  expect(screen.queryByRole('group', { name: 'Choose a side' })).toBeNull()
})
