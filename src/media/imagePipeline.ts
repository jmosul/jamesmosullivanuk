// Browser-side image pipeline for persona panel images: decode an upload, then
// render it as WebP at a few widths for a srcSet. Everything here runs in the
// browser; nothing leaves it until the caller uploads the results.

/** Largest source file we'll try to decode, in bytes (25 MB). */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024

/** The widths panel images are rendered at, ascending. */
export const PANEL_IMAGE_WIDTHS: readonly number[] = [480, 960, 1600]

/**
 * WebP quality used when none is given. Watercolour gradients band visibly
 * below about this.
 */
export const DEFAULT_QUALITY = 0.85

/** The content types `encodeImage` can produce. */
export type EncodedContentType = 'image/webp' | 'image/png'

/** One encoded rendition of an image. */
export interface EncodedImage {
  blob: Blob
  /** The type the browser actually encoded. Usually WebP; Safari may give PNG. */
  contentType: EncodedContentType
  width: number
  height: number
}

/** A problem with the image itself, worded to show to the person uploading. */
export class ImagePipelineError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ImagePipelineError'
  }
}

/**
 * Decodes an uploaded file into a bitmap, applying its EXIF orientation.
 *
 * Rejects with an `ImagePipelineError` if the file is empty, larger than
 * `MAX_SOURCE_BYTES`, or a format this browser can't read (such as HEIC on
 * most desktop browsers). The caller owns the bitmap and should `close()` it
 * when done.
 */
export async function decodeImage(file: Blob): Promise<ImageBitmap> {
  if (!(file instanceof Blob)) {
    throw new TypeError('decodeImage expects a File or Blob')
  }

  if (file.size === 0) {
    throw new ImagePipelineError('That file is empty.')
  }

  if (file.size > MAX_SOURCE_BYTES) {
    const limit = MAX_SOURCE_BYTES / (1024 * 1024)

    throw new ImagePipelineError(`That image is too large. The limit is ${limit} MB.`)
  }

  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch (cause) {
    throw new ImagePipelineError(
      "This browser can't read that image. Try a JPEG, PNG or WebP " +
        '(iPhone HEIC photos may need converting first).',
      { cause },
    )
  }
}

/**
 * Encodes a canvas as WebP at the given quality (0 to 1).
 *
 * Browsers that can't encode WebP (Safari) fall back to PNG; the returned
 * `contentType` is whatever the browser actually produced, so store and serve
 * the blob under that type.
 */
export async function encodeImage(
  canvas: HTMLCanvasElement,
  quality: number = DEFAULT_QUALITY,
): Promise<EncodedImage> {
  assertQuality(quality)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', quality)
  })

  if (!blob) {
    throw new ImagePipelineError("Couldn't encode the image.")
  }

  const contentType = blob.type

  if (contentType !== 'image/webp' && contentType !== 'image/png') {
    throw new ImagePipelineError(`The browser encoded an unexpected type: ${contentType || 'none'}.`)
  }

  return { blob, contentType, width: canvas.width, height: canvas.height }
}

/**
 * Renders a bitmap at each of `widths`, keeping its aspect ratio and any
 * transparency, and encodes each with `encodeImage`.
 *
 * Never upscales: a width larger than the bitmap is rendered at the bitmap's
 * own width. Widths that end up the same are rendered once. Results are in
 * ascending width order. Renditions are encoded one at a time to keep memory
 * down on phones.
 */
export async function renderWidths(
  bitmap: ImageBitmap,
  widths: readonly number[] = PANEL_IMAGE_WIDTHS,
  quality: number = DEFAULT_QUALITY,
): Promise<EncodedImage[]> {
  if (bitmap.width <= 0 || bitmap.height <= 0) {
    throw new ImagePipelineError('That image has no size.')
  }

  if (widths.length === 0) {
    throw new RangeError('renderWidths needs at least one width')
  }

  for (const width of widths) {
    if (!Number.isInteger(width) || width <= 0) {
      throw new RangeError(`Widths must be positive integers, got ${width}`)
    }
  }

  assertQuality(quality)

  const targets = [...new Set(widths.map((width) => Math.min(width, bitmap.width)))].sort((a, b) => a - b)
  const results: EncodedImage[] = []

  for (const width of targets) {
    const height = Math.max(1, Math.round((bitmap.height * width) / bitmap.width))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')

    if (!context) {
      throw new ImagePipelineError("This browser can't draw images.")
    }

    // A new canvas is fully transparent. Don't fill it: portraits may have
    // transparent edges that should stay transparent.
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, width, height)

    results.push(await encodeImage(canvas, quality))

    // Let the browser free the backing store before the next, larger canvas.
    canvas.width = 0
    canvas.height = 0
  }

  return results
}

function assertQuality(quality: number) {
  if (!Number.isFinite(quality) || quality <= 0 || quality > 1) {
    throw new RangeError(`Quality must be above 0 and at most 1, got ${quality}`)
  }
}
