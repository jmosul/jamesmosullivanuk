import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import { ThemeProvider } from '../../theme'
import type { Persona, PersonaStore } from '../personas'
import { PersonaEditor } from './PersonaEditor'

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

const persona = (fields: Partial<Persona> = {}) =>
  ({
    id: 'p1',
    slug: 'engineer',
    status: 'draft',
    sortOrder: 0,
    label: 'Software Engineer',
    theme: 'scifi',
    name: null,
    title: null,
    content: 'Builds things.',
    panelLabel: null,
    panelHint: null,
    rotation: 'ordered',
    links: [],
    panels: [],
    createdAt: '',
    updatedAt: '',
    ...fields,
  }) as Persona

function fakeStore(personas: Persona[]) {
  return {
    list: async () => personas,
    create: vi.fn(),
    update: vi.fn(async (id: string, record) => ({ ...record, id }) as Persona),
    remove: vi.fn(async () => {}),
  } satisfies PersonaStore
}

const renderEditor = (store: PersonaStore) =>
  render(
    <ThemeProvider initialTheme="scifi">
      <MemoryRouter initialEntries={['/a/personas/p1']}>
        <Routes>
          <Route path="/a/personas/:personaId" element={<PersonaEditor store={store} personaId="p1" />} />
          <Route path="/a/personas" element={<p>Persona list</p>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )

const publishedOption = () => screen.getByRole<HTMLOptionElement>('option', { name: /published/i })

test('wears the persona’s theme and follows the theme toggle', async () => {
  renderEditor(fakeStore([persona({ theme: 'fantasy' })]))

  expect(await screen.findByRole('heading', { level: 1, name: 'Software Engineer' })).toBeTruthy()
  expect(document.documentElement.dataset.theme).toBe('fantasy')

  fireEvent.click(within(screen.getByRole('group', { name: 'Theme' })).getByRole('button', { name: 'Sci-fi' }))

  expect(document.documentElement.dataset.theme).toBe('scifi')
  expect(localStorage.getItem('theme')).toBeNull()
})

test('can’t be published until it has a panel', async () => {
  renderEditor(fakeStore([persona()]))
  await screen.findByRole('heading', { level: 1 })

  expect(publishedOption().disabled).toBe(true)
  expect(screen.getByText('Add a panel.')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Add panel' }))

  expect(publishedOption().disabled).toBe(false)
})

test('fantasy panels without an image are flagged but can be published', async () => {
  renderEditor(fakeStore([persona({ theme: 'fantasy' })]))
  fireEvent.click(await screen.findByRole('button', { name: 'Add panel' }))

  expect(screen.getByText('Needs image')).toBeTruthy()
  expect(screen.getByText(/shows a placeholder on the homepage/)).toBeTruthy()
  expect(publishedOption().disabled).toBe(false)
})

test('saves the edited persona', async () => {
  const store = fakeStore([persona()])
  renderEditor(store)

  fireEvent.change(await screen.findByLabelText('Toggle label'), { target: { value: 'Engineer' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add panel' }))
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'published' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

  await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy())
  expect(store.update).toHaveBeenCalledWith(
    'p1',
    expect.objectContaining({ label: 'Engineer', status: 'published', panels: [expect.objectContaining({ title: 'New panel' })] }),
  )
})

test('won’t save a slug another persona uses', async () => {
  renderEditor(fakeStore([persona(), persona({ id: 'p2', slug: 'writer' })]))

  fireEvent.change(await screen.findByLabelText('Slug'), { target: { value: 'writer' } })

  expect(screen.getByText('Another persona already uses the slug “writer”.')).toBeTruthy()
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save changes' }).disabled).toBe(true)
})

test('deleting asks for a second click, then returns to the list', async () => {
  const store = fakeStore([persona()])
  renderEditor(store)

  fireEvent.click(await screen.findByRole('button', { name: 'Delete persona' }))
  expect(store.remove).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'Click again to delete' }))

  await waitFor(() => expect(screen.getByText('Persona list')).toBeTruthy())
  expect(store.remove).toHaveBeenCalledWith('p1')
})
