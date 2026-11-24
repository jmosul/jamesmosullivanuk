import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ImagePipelineError } from '../../media'
import { ThemeProvider } from '../../theme'
import { createMemoryPanelImageStore } from '../memoryPanelImages'
import type { PanelImageStore } from '../panelImages'
import type { Persona, PersonaStore } from '../personas'
import { PersonaEditor } from './PersonaEditor'

// jsdom can't decode or draw images, so the pipeline gives fixed renditions.
const pipeline = vi.hoisted(() => ({ decodeImage: vi.fn(), renderWidths: vi.fn() }))
vi.mock('../../media', async (importOriginal) => ({ ...(await importOriginal<object>()), ...pipeline }))

const rendition = (width: number, bytes: number) => ({
  blob: new Blob([new Uint8Array(bytes)], { type: 'image/webp' }),
  contentType: 'image/webp',
  width,
  height: Math.round((width * 4) / 3),
})

beforeEach(() => {
  pipeline.decodeImage.mockResolvedValue({ width: 2400, height: 3200, close: () => {} })
  pipeline.renderWidths.mockResolvedValue([rendition(480, 20_000), rendition(960, 80_000), rendition(1600, 215_040)])
  let blobs = 0
  URL.createObjectURL = vi.fn(() => `blob:preview-${++blobs}`)
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset.theme
  vi.restoreAllMocks()
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

const renderEditor = (store: PersonaStore, images: PanelImageStore = createMemoryPanelImageStore()) =>
  render(
    <ThemeProvider initialTheme="scifi">
      <MemoryRouter initialEntries={['/a/personas/p1']}>
        <Routes>
          <Route
            path="/a/personas/:personaId"
            element={<PersonaEditor store={store} images={images} personaId="p1" />}
          />
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

const savedImage = (id: string) => ({
  alt: 'A portrait',
  width: 1600,
  height: 2133,
  variants: [480, 1600].map((width) => ({
    path: `persona-images/${id}/${width}.webp`,
    width,
    height: Math.round((width * 4) / 3),
    contentType: 'image/webp',
  })),
})

const panel = (fields: Partial<Persona['panels'][number]> = {}) => ({
  id: 'panel-1',
  title: 'Mage',
  subtitle: null,
  image: null,
  symbol: null,
  accent: null,
  ...fields,
})

const portrait = () => new File([new Uint8Array(8)], 'portrait.png', { type: 'image/png' })

async function openPanel(title = 'Mage') {
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(`^${title}`) }))
}

const pick = (label: string, file: File = portrait()) =>
  fireEvent.change(screen.getByLabelText(label), { target: { files: [file] } })

const saveButton = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Save changes' })

test('uploads a panel image, previews it and saves it on the panel', async () => {
  const store = fakeStore([persona({ theme: 'fantasy', panels: [panel()] })])
  const images = createMemoryPanelImageStore()
  const { container } = renderEditor(store, images)
  await openPanel()

  expect(screen.getByText('Needs image')).toBeTruthy()

  pick('Upload image')

  expect(await screen.findByText('1600 × 2133 · WebP · 210 KB')).toBeTruthy()
  expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Alt text' }).value).toBe('Mage')
  expect(screen.getByRole<HTMLImageElement>('img', { name: 'Mage' }).src).toBe('blob:preview-1')
  expect(container.querySelector<HTMLImageElement>('.panel-thumb-image')?.src).toBe('blob:preview-1')
  expect(screen.queryByText('Needs image')).toBeNull()
  expect(screen.getByLabelText('Replace image')).toBeTruthy()
  expect(images.files.size).toBe(3)

  fireEvent.click(saveButton())

  await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy())
  const saved = store.update.mock.calls[0][1].panels[0].image

  expect(saved).toMatchObject({ alt: 'Mage', width: 1600, height: 2133 })
  expect(saved.variants.map((variant: { path: string }) => variant.path)).toEqual([...images.files.keys()])
  expect(images.removed).toEqual([])
})

test('holds Save while an image uploads, and keeps the panel editable', async () => {
  const images = createMemoryPanelImageStore()
  renderEditor(fakeStore([persona({ panels: [panel()] })]), images)
  await openPanel()
  images.hold()

  pick('Upload image')

  expect(await screen.findByText(/Uploading image… \d+%/)).toBeTruthy()
  expect(screen.getByRole('progressbar')).toBeTruthy()
  expect(screen.getByText('Uploading image…', { selector: '.editor-save-state' })).toBeTruthy()
  expect(saveButton().disabled).toBe(true)

  const fields = within(document.getElementById('panel-panel-1')!)
  fireEvent.change(fields.getByLabelText('Title'), { target: { value: 'Archmage' } })

  expect(saveButton().disabled).toBe(true)

  images.release()

  await screen.findByText(/1600 × 2133/)
  expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Alt text' }).value).toBe('Archmage')
  expect(saveButton().disabled).toBe(false)
})

test('shows the pipeline’s own message for a bad image', async () => {
  pipeline.decodeImage.mockRejectedValueOnce(new ImagePipelineError('That image is too large. The limit is 25 MB.'))
  renderEditor(fakeStore([persona({ panels: [panel()] })]))
  await openPanel()

  pick('Upload image')

  expect((await screen.findByRole('alert')).textContent).toBe('That image is too large. The limit is 25 MB.')
  expect(saveButton().disabled).toBe(true)
})

test('shows a general message when the upload itself fails', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const images = createMemoryPanelImageStore()
  images.failNext('upload', new Error('AccessDenied: s3:PutObject'))
  renderEditor(fakeStore([persona({ panels: [panel()] })]), images)
  await openPanel()

  pick('Upload image')

  expect((await screen.findByRole('alert')).textContent).toBe('Couldn’t upload the image. Try again.')
})

test('shows a saved image from a signed address', async () => {
  const { container } = renderEditor(fakeStore([persona({ panels: [panel({ image: savedImage('old') })] })]))
  await openPanel()

  expect(screen.getByText('1600 × 2133 · WebP')).toBeTruthy()
  await waitFor(() =>
    expect(container.querySelector<HTMLImageElement>('.panel-thumb-image')?.src).toBe(
      'memory://persona-images/old/480.webp',
    ),
  )
})

test('deletes a replaced image’s files once the save has gone through', async () => {
  const store = fakeStore([persona({ panels: [panel({ image: savedImage('old') })] })])
  const images = createMemoryPanelImageStore()
  renderEditor(store, images)
  await openPanel()

  pick('Replace image')
  await screen.findByText(/210 KB/)

  expect(images.removed).toEqual([])

  fireEvent.click(saveButton())

  await waitFor(() =>
    expect(images.removed).toEqual(['persona-images/old/480.webp', 'persona-images/old/1600.webp']),
  )
  expect(images.files.size).toBe(3)
})

test('deletes a removed image’s files after saving, not before', async () => {
  const store = fakeStore([persona({ panels: [panel({ image: savedImage('old') })] })])
  let finishUpdate = () => {}
  store.update.mockImplementationOnce(
    (id: string, record) =>
      new Promise((resolve) => {
        finishUpdate = () => resolve({ ...record, id } as Persona)
      }),
  )
  const images = createMemoryPanelImageStore()
  renderEditor(store, images)
  await openPanel()

  fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
  fireEvent.click(saveButton())

  await waitFor(() => expect(store.update).toHaveBeenCalled())
  expect(images.removed).toEqual([])

  finishUpdate()

  await waitFor(() => expect(images.removed).toHaveLength(2))
})

test('keeps the files when the save fails', async () => {
  const store = fakeStore([persona({ panels: [panel({ image: savedImage('old') })] })])
  store.update.mockRejectedValueOnce(new Error('Network error'))
  const images = createMemoryPanelImageStore()
  renderEditor(store, images)
  await openPanel()

  fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
  fireEvent.click(saveButton())

  expect(await screen.findByText('Couldn’t save: Network error')).toBeTruthy()
  expect(images.removed).toEqual([])
})

test('deletes a removed panel’s image after saving, and doesn’t mind if that fails', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const images = createMemoryPanelImageStore()
  images.failNext('remove')
  renderEditor(fakeStore([persona({ panels: [panel({ image: savedImage('old') })] })]), images)

  fireEvent.click(await screen.findByRole('button', { name: 'Remove Mage' }))
  fireEvent.click(saveButton())

  await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy())
  await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^Couldn’t remove/), expect.any(Error)))
  expect(screen.queryByRole('alert')).toBeNull()
})

test('deletes the persona’s image files after deleting it', async () => {
  const store = fakeStore([persona({ panels: [panel({ image: savedImage('old') })] })])
  const images = createMemoryPanelImageStore()
  renderEditor(store, images)

  fireEvent.click(await screen.findByRole('button', { name: 'Delete persona' }))
  fireEvent.click(screen.getByRole('button', { name: 'Click again to delete' }))

  await waitFor(() => expect(screen.getByText('Persona list')).toBeTruthy())
  await waitFor(() =>
    expect(images.removed).toEqual(['persona-images/old/480.webp', 'persona-images/old/1600.webp']),
  )
})

test('removes the files of an upload whose panel was removed mid-upload', async () => {
  const images = createMemoryPanelImageStore()
  renderEditor(fakeStore([persona({ panels: [panel()] })]), images)
  await openPanel()
  images.hold()

  pick('Upload image')
  await screen.findByRole('progressbar')
  fireEvent.click(screen.getByRole('button', { name: 'Remove Mage' }))
  images.release()

  await waitFor(() => expect(images.removed).toHaveLength(3))
  expect(images.files.size).toBe(0)
  expect(saveButton().disabled).toBe(false)
})
