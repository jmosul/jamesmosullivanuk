import { decodeImage, panelImagePath, renderWidths, type EncodedImage } from '../media'
import type { Persona } from './personas'

type Panel = Persona['panels'][number]
export type PanelImage = NonNullable<Panel['image']>
export type PanelImageFile = PanelImage['variants'][number]

/** Bytes sent so far, across every rendition of one upload. */
export interface UploadProgress {
  transferred: number
  total: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
}

/** A freshly uploaded image, with what the editor needs to show it before saving. */
export interface UploadedPanelImage {
  /** Ready to set on a panel once the caller fills in `alt`, which is left empty. */
  image: PanelImage
  /** The largest rendition, for a local preview. */
  preview: Blob
  /** Size of the largest rendition. */
  bytes: number
}

/** Panel image files, as the persona editor needs them. */
export interface PanelImageStore {
  /**
   * Renders the file at each panel width and uploads every rendition under a
   * new image id. If any rendition fails, the ones already uploaded are
   * removed (best effort) and the error is rethrown. Problems with the file
   * itself reject with an `ImagePipelineError`.
   */
  upload(file: Blob, options?: UploadOptions): Promise<UploadedPanelImage>
  /** Deletes every rendition of the image. Rejects if any couldn't be deleted. */
  remove(image: Pick<PanelImage, 'variants'>): Promise<void>
  /** A short-lived address for one rendition's path, for showing it in the editor. */
  url(path: string): Promise<string>
}

/** Long-lived: a key is never reused, so its bytes never change. */
export const PANEL_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

/** Decodes the file and renders each panel width, closing the bitmap after. */
export async function renderPanelImage(file: Blob): Promise<EncodedImage[]> {
  const bitmap = await decodeImage(file)

  try {
    return await renderWidths(bitmap)
  } finally {
    bitmap.close()
  }
}

/** One rendition's entry on the panel, under the image's id. */
export const toImageFile = (imageId: string, rendition: EncodedImage): PanelImageFile => ({
  path: panelImagePath(imageId, rendition.width, rendition.contentType),
  width: rendition.width,
  height: rendition.height,
  contentType: rendition.contentType,
})

/** The image as stored on the panel. Its size is the largest variant's. */
export function toPanelImage(variants: PanelImageFile[]): PanelImage {
  const largest = variants.reduce((a, b) => (b.width > a.width ? b : a))

  return { alt: '', width: largest.width, height: largest.height, variants }
}

/** Combines per-rendition progress into one running total. */
export function progressTracker(sizes: readonly number[], onProgress?: (progress: UploadProgress) => void) {
  const sent = sizes.map(() => 0)
  const total = sizes.reduce((sum, size) => sum + size, 0)

  return (index: number, transferred: number) => {
    sent[index] = Math.min(transferred, sizes[index])
    onProgress?.({ transferred: sent.reduce((sum, bytes) => sum + bytes, 0), total })
  }
}

/**
 * Every image file the previous panels used that the next ones don't, grouped
 * by image. Covers replaced images, removed images and removed panels.
 */
export function staleImages(previous: readonly Panel[], next: readonly Panel[]): Pick<PanelImage, 'variants'>[] {
  const kept = new Set(next.flatMap((panel) => panel.image?.variants.map((variant) => variant.path) ?? []))
  const stale: Pick<PanelImage, 'variants'>[] = []

  for (const panel of previous) {
    const gone = panel.image?.variants.filter((variant) => !kept.has(variant.path)) ?? []

    if (gone.length > 0) {
      stale.push({ variants: gone })
    }
  }

  return stale
}

/**
 * Removes each image, without failing the caller: the record no longer points
 * at them, so a file left behind is an orphan, not a broken panel.
 */
export async function removeQuietly(store: PanelImageStore, images: readonly Pick<PanelImage, 'variants'>[]) {
  const results = await Promise.allSettled(images.map((image) => store.remove(image)))

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const paths = images[index].variants.map((variant) => variant.path).join(', ')
      console.warn(`Couldn’t remove ${paths}`, result.reason)
    }
  })
}

/** Panel images in the website's bucket, called as the signed-in SuperAdmin. */
export function createPanelImageStore(): PanelImageStore {
  // Loaded on first use, so the admin list doesn't pull storage in.
  const storage = () => import('aws-amplify/storage')

  const removeFiles = async (files: readonly PanelImageFile[]) => {
    const { remove } = await storage()
    const results = await Promise.allSettled(files.map((file) => remove({ path: file.path })))
    const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason)

    if (failures.length > 0) {
      throw new AggregateError(failures, `Couldn’t remove ${failures.length} of ${files.length} image files.`)
    }
  }

  return {
    async upload(file, { onProgress } = {}) {
      const renditions = await renderPanelImage(file)
      const imageId = crypto.randomUUID()
      const track = progressTracker(
        renditions.map((rendition) => rendition.blob.size),
        onProgress,
      )
      const { uploadData } = await storage()
      const uploaded: PanelImageFile[] = []

      try {
        // One at a time, so a failure leaves as little as possible to clean up.
        for (const [index, rendition] of renditions.entries()) {
          const variant = toImageFile(imageId, rendition)
          await uploadData({
            path: variant.path,
            data: rendition.blob,
            options: {
              contentType: rendition.contentType,
              cacheControl: PANEL_IMAGE_CACHE_CONTROL,
              preventOverwrite: true,
              checksumAlgorithm: 'crc-32',
              onProgress: ({ transferredBytes }) => track(index, transferredBytes),
            },
          }).result
          track(index, rendition.blob.size)
          uploaded.push(variant)
        }
      } catch (error) {
        await removeFiles(uploaded).catch((cleanup: unknown) => console.warn('Couldn’t clean up a failed upload', cleanup))

        throw error
      }

      const largest = renditions[renditions.length - 1]

      return { image: toPanelImage(uploaded), preview: largest.blob, bytes: largest.blob.size }
    },
    remove(image) {
      return removeFiles(image.variants)
    },
    async url(path) {
      const { getUrl } = await storage()
      const { url } = await getUrl({ path, options: { expiresIn: 3600 } })

      return url.toString()
    },
  }
}
