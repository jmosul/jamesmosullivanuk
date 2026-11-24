import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router'
import { afterEach, expect, test } from 'vitest'
import { PersonasPage } from './PersonasPage'
import type { Persona, PersonaStore } from './personas'

afterEach(cleanup)

const persona = { id: 'p1', slug: 'engineer', status: 'published', sortOrder: 0, label: 'Software Engineer', theme: 'scifi', content: 'Builds things.', rotation: 'random', links: [], panels: [] } as unknown as Persona

const store = (): PersonaStore => ({
  list: async () => [persona],
  create: async (record) => ({ ...record, id: 'new-id' }) as Persona,
  update: async (id, record) => ({ ...record, id }) as Persona,
  remove: async () => {},
})

const EditorStub = () => <p>Editor for {useParams().personaId}</p>

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/a/personas']}>
      <Routes>
        <Route path="/a/personas" element={<PersonasPage store={store()} />} />
        <Route path="/a/personas/:personaId" element={<EditorStub />} />
      </Routes>
    </MemoryRouter>,
  )

test('lists personas and turns the new tile into a form', async () => {
  renderPage()

  expect(await screen.findByRole('article', { name: 'Software Engineer' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /new persona/i }))

  expect(screen.getByLabelText('Name')).toBeTruthy()
  expect(screen.getByLabelText('Content')).toBeTruthy()
  expect(screen.getByLabelText('Theme')).toBeTruthy()
})

test('creating a draft goes to the new persona’s page', async () => {
  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: /new persona/i }))

  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Writer' } })
  fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Writes.' } })
  fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'fantasy' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

  await waitFor(() => expect(screen.getByText('Editor for new-id')).toBeTruthy())
})

test('each card links to that persona’s editor', async () => {
  renderPage()
  fireEvent.click(await screen.findByRole('link', { name: 'Software Engineer' }))

  await waitFor(() => expect(screen.getByText('Editor for p1')).toBeTruthy())
})
