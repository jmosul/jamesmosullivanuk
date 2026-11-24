import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ImagePipelineError, type EncodedImage } from '../media'
import { createMemoryPanelImageStore } from './memoryPanelImages'
import {
  createPanelImageStore,
  PANEL_IMAGE_CACHE_CONTROL,
  progressTracker,
  removeQuietly,
  staleImages,
  type PanelImage,
  type PanelImageStore,
} from './panelImages'
import type { Persona } from './personas'

type Panel = Persona['panels'][number]

const storage = vi.hoisted(() => ({
  uploadData: vi.fn(),
  remove: vi.fn(),
  getUrl: vi.fn(),
}))
vi.mock('aws-amplify/storage', () => storage)

const pipeline = vi.hoisted(() => ({ decodeImage: vi.fn(), renderWidths: vi.fn() }))
vi.mock('../media', async (importOriginal) => ({ ...(await importOriginal<object>()), ...pipeline }))

const bitmap = { width: 2000, height: 1500, close: vi.fn() }

const rendition = (width: number, bytes: number, contentType: EncodedImage['contentType'] = 'image/webp') => ({
  blob: new Blob([new Uint8Array(bytes)], { type: contentType }),
  contentType,
  width,
  height: width * 0.75,
})

const renditions = [rendition(480, 100), rendition(960, 300), rendition(1600, 600)]

beforeEach(() => {
  vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001')
  pipeline.decodeImage.mockResolvedValue(bitmap)
  pipeline.renderWidths.mockResolvedValue(renditions)
  storage.uploadData.mockImplementation(({ data, options }) => {
    options.onProgress?.({ transferredBytes: data.size / 2, totalBytes: data.size })

    return { result: Promise.resolve({ path: 'x' }) }
  })
  storage.remove.mockResolvedValue({ path: 'x' })
  storage.getUrl.mockResolvedValue({ url: new URL('https://bucket.test/signed') })
})

afterEach(() => {
  vi.restoreAllMocks()
  bitmap.close.mockClear()
  storage.uploadData.mockReset()
  storage.remove.mockReset()
  storage.getUrl.mockReset()
})

const file = () => new File([new Uint8Array(10)], 'portrait.png', { type: 'image/png' })
const id = '00000000-0000-4000-8000-000000000001'

describe('createPanelImageStore', () => {
  it('uploads each rendition under a new image id and describes the image', async () => {
    const result = await createPanelImageStore().upload(file())

    expect(storage.uploadData.mock.calls.map(([input]) => input.path)).toEqual([
      `persona-images/${id}/480.webp`,
      `persona-images/${id}/960.webp`,
      `persona-images/${id}/1600.webp`,
    ])
    expect(storage.uploadData).toHaveBeenCalledWith({
      path: `persona-images/${id}/1600.webp`,
      data: renditions[2].blob,
      options: {
        contentType: 'image/webp',
        cacheControl: PANEL_IMAGE_CACHE_CONTROL,
        preventOverwrite: true,
        checksumAlgorithm: 'crc-32',
        onProgress: expect.any(Function),
      },
    })
    expect(result.image).toEqual({
      alt: '',
      width: 1600,
      height: 1200,
      variants: [
        { path: `persona-images/${id}/480.webp`, width: 480, height: 360, contentType: 'image/webp' },
        { path: `persona-images/${id}/960.webp`, width: 960, height: 720, contentType: 'image/webp' },
        { path: `persona-images/${id}/1600.webp`, width: 1600, height: 1200, contentType: 'image/webp' },
      ],
    })
    expect(result.preview).toBe(renditions[2].blob)
    expect(result.bytes).toBe(600)
  })

  it('closes the bitmap, whether rendering works or not', async () => {
    await createPanelImageStore().upload(file())

    expect(bitmap.close).toHaveBeenCalledTimes(1)

    pipeline.renderWidths.mockRejectedValueOnce(new ImagePipelineError("This browser can't draw images."))

    await expect(createPanelImageStore().upload(file())).rejects.toThrow(ImagePipelineError)
    expect(bitmap.close).toHaveBeenCalledTimes(2)
    expect(storage.uploadData).toHaveBeenCalledTimes(3)
  })

  it('stores PNG renditions under .png when the browser fell back', async () => {
    pipeline.renderWidths.mockResolvedValue([rendition(1600, 900, 'image/png')])
    const { image } = await createPanelImageStore().upload(file())

    expect(image.variants[0]).toMatchObject({ path: `persona-images/${id}/1600.png`, contentType: 'image/png' })
    expect(storage.uploadData.mock.calls[0][0].options.contentType).toBe('image/png')
  })

  it('reports progress across every rendition', async () => {
    const onProgress = vi.fn()
    await createPanelImageStore().upload(file(), { onProgress })

    expect(onProgress.mock.calls.map(([progress]) => progress.transferred)).toEqual([50, 100, 250, 400, 700, 1000])
    expect(onProgress).toHaveBeenLastCalledWith({ transferred: 1000, total: 1000 })
  })

  it('removes the renditions already uploaded when one fails, and rethrows', async () => {
    const failure = new Error('network down')
    storage.uploadData
      .mockImplementationOnce(() => ({ result: Promise.resolve({}) }))
      .mockImplementationOnce(() => ({ result: Promise.resolve({}) }))
      .mockImplementationOnce(() => ({ result: Promise.reject(failure) }))

    await expect(createPanelImageStore().upload(file())).rejects.toBe(failure)
    expect(storage.remove.mock.calls.map(([input]) => input.path)).toEqual([
      `persona-images/${id}/480.webp`,
      `persona-images/${id}/960.webp`,
    ])
  })

  it('still rethrows the upload failure when the clean-up fails too', async () => {
    const failure = new Error('network down')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    storage.uploadData
      .mockImplementationOnce(() => ({ result: Promise.resolve({}) }))
      .mockImplementationOnce(() => ({ result: Promise.reject(failure) }))
    storage.remove.mockRejectedValue(new Error('denied'))

    await expect(createPanelImageStore().upload(file())).rejects.toBe(failure)
  })

  it('removes every variant, and rejects if any is left behind', async () => {
    const image = { variants: [{ path: 'persona-images/a/480.webp' }, { path: 'persona-images/a/960.webp' }] } as PanelImage
    await createPanelImageStore().remove(image)

    expect(storage.remove.mock.calls.map(([input]) => input)).toEqual([
      { path: 'persona-images/a/480.webp' },
      { path: 'persona-images/a/960.webp' },
    ])

    storage.remove.mockRejectedValueOnce(new Error('denied'))

    await expect(createPanelImageStore().remove(image)).rejects.toThrow(AggregateError)
  })

  it('signs a path for the editor', async () => {
    expect(await createPanelImageStore().url('persona-images/a/480.webp')).toBe('https://bucket.test/signed')
    expect(storage.getUrl).toHaveBeenCalledWith({ path: 'persona-images/a/480.webp', options: { expiresIn: 3600 } })
  })
})

describe('createMemoryPanelImageStore', () => {
  it('keeps the renditions in memory', async () => {
    const store = createMemoryPanelImageStore()
    const { image } = await store.upload(file())

    expect([...store.files.keys()]).toEqual(image.variants.map((variant) => variant.path))

    await store.remove(image)

    expect(store.files.size).toBe(0)
    expect(store.removed).toEqual(image.variants.map((variant) => variant.path))
  })

  it('fails the next upload or removal on request', async () => {
    const store = createMemoryPanelImageStore()
    store.failNext('upload', new Error('nope'))

    await expect(store.upload(file())).rejects.toThrow('nope')
    expect(store.files.size).toBe(0)
    await expect(store.upload(file())).resolves.toBeDefined()

    store.failNext('remove')

    await expect(store.remove({ variants: [] })).rejects.toThrow('remove failed')
  })

  it('passes pipeline errors through', async () => {
    pipeline.decodeImage.mockRejectedValueOnce(new ImagePipelineError('That file is empty.'))

    await expect(createMemoryPanelImageStore().upload(file())).rejects.toThrow('That file is empty.')
  })

  it('holds uploads until released', async () => {
    const store = createMemoryPanelImageStore()
    store.hold()
    let done = false
    const upload = store.upload(file()).then(() => {
      done = true
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(done).toBe(false)

    store.release()
    await upload

    expect(done).toBe(true)
  })
})

const panel = (id: string, paths: string[] | null): Panel =>
  ({
    id,
    title: id,
    image: paths && {
      alt: '',
      width: 1,
      height: 1,
      variants: paths.map((path) => ({ path, width: 1, height: 1, contentType: 'image/webp' })),
    },
  }) as Panel

describe('staleImages', () => {
  it('lists the files of replaced and removed images and removed panels', () => {
    const previous = [panel('kept', ['k/480', 'k/960']), panel('replaced', ['r/480']), panel('cleared', ['c/480']), panel('gone', ['g/480'])]
    const next = [panel('kept', ['k/480', 'k/960']), panel('replaced', ['n/480']), panel('cleared', null)]

    expect(staleImages(previous, next).map((image) => image.variants.map((variant) => variant.path))).toEqual([
      ['r/480'],
      ['c/480'],
      ['g/480'],
    ])
  })

  it('keeps an image that moved to another panel', () => {
    expect(staleImages([panel('a', ['x/480']), panel('b', null)], [panel('b', ['x/480'])])).toEqual([])
  })

  it('is empty when nothing changed', () => {
    const panels = [panel('a', ['a/480']), panel('b', null)]

    expect(staleImages(panels, panels)).toEqual([])
  })
})

describe('removeQuietly', () => {
  it('removes each image and logs failures without throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = { remove: vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied')) }

    await removeQuietly(store as unknown as PanelImageStore, [
      { variants: [{ path: 'a/480' }] } as PanelImage,
      { variants: [{ path: 'b/480' }] } as PanelImage,
    ])

    expect(store.remove).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledWith('Couldn’t remove b/480', expect.any(Error))
  })
})

describe('progressTracker', () => {
  it('sums progress and never counts more than a rendition’s size', () => {
    const onProgress = vi.fn()
    const track = progressTracker([10, 20], onProgress)
    track(1, 50)
    track(0, 5)

    expect(onProgress).toHaveBeenLastCalledWith({ transferred: 25, total: 30 })
  })
})
