import { afterEach, describe, expect, it } from 'vitest'
import {
  decodeImage,
  encodeImage,
  ImagePipelineError,
  MAX_SOURCE_BYTES,
  PANEL_IMAGE_WIDTHS,
  renderWidths,
} from './index'

const bitmaps: ImageBitmap[] = []

afterEach(() => {
  for (const bitmap of bitmaps.splice(0)) {
    bitmap.close()
  }
})

// A PNG whose left half is transparent and right half is opaque red.
async function makeSource(width: number, height: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.fillStyle = 'rgb(255, 0, 0)'
  context.fillRect(Math.floor(width / 2), 0, Math.ceil(width / 2), height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}

async function decodeSource(width: number, height: number): Promise<ImageBitmap> {
  const bitmap = await decodeImage(await makeSource(width, height))
  bitmaps.push(bitmap)

  return bitmap
}

async function pixels(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob)
  bitmaps.push(bitmap)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0)

  return context.getImageData(0, 0, bitmap.width, bitmap.height)
}

function alphaAt(data: ImageData, x: number, y: number) {
  return data.data[(y * data.width + x) * 4 + 3]
}

describe('decodeImage', () => {
  it('decodes a PNG', async () => {
    const bitmap = await decodeSource(40, 20)

    expect([bitmap.width, bitmap.height]).toEqual([40, 20])
  })

  it('rejects an empty file', async () => {
    await expect(decodeImage(new Blob([], { type: 'image/png' }))).rejects.toThrow(ImagePipelineError)
  })

  it('rejects a file over the size cap without decoding it', async () => {
    const huge = new Blob([new Uint8Array(MAX_SOURCE_BYTES + 1)], { type: 'image/png' })

    await expect(decodeImage(huge)).rejects.toThrow(/too large/)
  })

  it('gives a friendly error for a file the browser cannot read', async () => {
    const heic = new File([new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 104, 101, 105, 99])], 'photo.heic', {
      type: 'image/heic',
    })
    const error = await decodeImage(heic).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ImagePipelineError)
    expect((error as Error).message).toMatch(/can't read that image/)
    expect((error as Error).cause).toBeDefined()
  })
})

describe('encodeImage', () => {
  it('records the content type the browser produced', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 4
    const image = await encodeImage(canvas)

    expect(image.contentType).toBe('image/webp')
    expect(image.blob.type).toBe(image.contentType)
    expect([image.width, image.height]).toEqual([8, 4])
  })

  it('trusts a PNG fallback, as Safari gives', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 4
    canvas.toBlob = (callback) => {
      callback(new Blob([new Uint8Array([1])], { type: 'image/png' }))
    }
    const image = await encodeImage(canvas)

    expect(image.contentType).toBe('image/png')
  })

  it('rejects a quality outside (0, 1]', async () => {
    const canvas = document.createElement('canvas')

    await expect(encodeImage(canvas, 0)).rejects.toThrow(RangeError)
    await expect(encodeImage(canvas, 1.5)).rejects.toThrow(RangeError)
  })
})

describe('renderWidths', () => {
  it('renders each panel width, keeping the aspect ratio', async () => {
    const bitmap = await decodeSource(2000, 1000)
    const images = await renderWidths(bitmap)

    expect(PANEL_IMAGE_WIDTHS).toEqual([480, 960, 1600])
    expect(images.map((image) => [image.width, image.height])).toEqual([
      [480, 240],
      [960, 480],
      [1600, 800],
    ])

    for (const image of images) {
      const data = await pixels(image.blob)

      expect([data.width, data.height]).toEqual([image.width, image.height])
    }
  })

  it('keeps a portrait aspect ratio', async () => {
    const bitmap = await decodeSource(1200, 1800)
    const images = await renderWidths(bitmap, [480])

    expect([images[0].width, images[0].height]).toEqual([480, 720])
  })

  it('never upscales, and renders widths that collapse together once', async () => {
    const bitmap = await decodeSource(700, 350)
    const images = await renderWidths(bitmap)

    expect(images.map((image) => [image.width, image.height])).toEqual([
      [480, 240],
      [700, 350],
    ])
  })

  it('drops duplicate widths and returns them in ascending order', async () => {
    const bitmap = await decodeSource(2000, 1000)
    const images = await renderWidths(bitmap, [960, 480, 960, 480])

    expect(images.map((image) => image.width)).toEqual([480, 960])
  })

  it('preserves transparency', async () => {
    const bitmap = await decodeSource(1000, 500)
    const [image] = await renderWidths(bitmap, [480])
    const data = await pixels(image.blob)
    const middle = Math.floor(data.height / 2)

    expect(alphaAt(data, 10, middle)).toBe(0)
    expect(alphaAt(data, data.width - 10, middle)).toBe(255)
  })

  it('records the content type of each rendition', async () => {
    const bitmap = await decodeSource(2000, 1000)
    const images = await renderWidths(bitmap)

    for (const image of images) {
      expect(image.contentType).toBe('image/webp')
      expect(image.blob.type).toBe(image.contentType)
    }
  })

  it('rejects widths that are not positive integers', async () => {
    const bitmap = await decodeSource(100, 50)

    await expect(renderWidths(bitmap, [])).rejects.toThrow(RangeError)
    await expect(renderWidths(bitmap, [0])).rejects.toThrow(RangeError)
    await expect(renderWidths(bitmap, [480.5])).rejects.toThrow(RangeError)
  })
})
