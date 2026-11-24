import type { EncodedContentType } from './imagePipeline'

const EXTENSIONS: Record<EncodedContentType, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
}

// One path segment: letters, digits, '.', '_' and '-', but not '.' or '..'.
const SEGMENT = /^[A-Za-z0-9._-]+$/

/**
 * The storage key for one rendition of a panel image:
 * `persona-images/<imageId>/<width>.<ext>`.
 *
 * `ext` comes from the rendition's actual `contentType` (`webp`, or `png`
 * where the browser couldn't encode WebP). Throws if `imageId` isn't a single
 * path segment, `width` isn't a positive integer, or the content type isn't
 * one the pipeline produces.
 */
export function panelImagePath(imageId: string, width: number, contentType: string): string {
  if (!SEGMENT.test(imageId) || imageId === '.' || imageId === '..') {
    throw new RangeError(`Invalid image id: ${JSON.stringify(imageId)}`)
  }

  if (!Number.isInteger(width) || width <= 0) {
    throw new RangeError(`Width must be a positive integer, got ${width}`)
  }

  if (!Object.hasOwn(EXTENSIONS, contentType)) {
    throw new RangeError(`Unsupported content type: ${contentType}`)
  }

  return `persona-images/${imageId}/${width}.${EXTENSIONS[contentType as EncodedContentType]}`
}
