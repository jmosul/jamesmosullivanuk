import {
  progressTracker,
  renderPanelImage,
  toImageFile,
  toPanelImage,
  type PanelImageFile,
  type PanelImageStore,
} from './panelImages'

type Operation = 'upload' | 'remove'

/** A `PanelImageStore` held in memory, for tests. */
export interface MemoryPanelImageStore extends PanelImageStore {
  /** Stored files by path. */
  readonly files: Map<string, Blob>
  /** Every path removed, in order. */
  readonly removed: string[]
  /** Makes the next call of `operation` reject with `error`. */
  failNext(operation: Operation, error?: unknown): void
  /** Holds uploads after rendering, before storing, until `release()`. */
  hold(): void
  release(): void
}

/**
 * Uploads go through the real pipeline (`renderPanelImage`), so jsdom tests
 * stub `src/media` the same way they would for the Amplify store.
 */
export function createMemoryPanelImageStore(): MemoryPanelImageStore {
  const files = new Map<string, Blob>()
  const removed: string[] = []
  const failures = new Map<Operation, unknown>()
  let gate: { promise: Promise<void>; open: () => void } | null = null

  const takeFailure = (operation: Operation) => {
    if (!failures.has(operation)) {
      return
    }

    const error = failures.get(operation)
    failures.delete(operation)

    throw error
  }

  return {
    files,
    removed,
    failNext(operation, error = new Error(`${operation} failed`)) {
      failures.set(operation, error)
    },
    hold() {
      let open = () => {}
      const promise = new Promise<void>((resolve) => {
        open = resolve
      })
      gate = { promise, open }
    },
    release() {
      gate?.open()
      gate = null
    },
    async upload(file, { onProgress } = {}) {
      const renditions = await renderPanelImage(file)
      const imageId = crypto.randomUUID()
      const track = progressTracker(
        renditions.map((rendition) => rendition.blob.size),
        onProgress,
      )
      track(0, 0)
      await gate?.promise
      takeFailure('upload')

      const variants: PanelImageFile[] = renditions.map((rendition, index) => {
        const variant = toImageFile(imageId, rendition)
        files.set(variant.path, rendition.blob)
        track(index, rendition.blob.size)

        return variant
      })
      const largest = renditions[renditions.length - 1]

      return { image: toPanelImage(variants), preview: largest.blob, bytes: largest.blob.size }
    },
    async remove(image) {
      takeFailure('remove')

      for (const { path } of image.variants) {
        files.delete(path)
        removed.push(path)
      }
    },
    async url(path) {
      return `memory://${path}`
    },
  }
}
