import { useEffect, useRef, useState, type Dispatch } from 'react'
import { ImagePipelineError } from '../../media'
import { removeQuietly, type PanelImageStore, type UploadProgress } from '../panelImages'
import type { DraftAction, Panel } from './draft'

/** Runs an upload while the editor holds Save back. */
export type TrackUpload = <T>(work: Promise<T>) => Promise<T>

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: UploadProgress | null }
  | { status: 'failed'; message: string }

/** What a panel row shows and does with its image. */
export interface PanelImageControl {
  upload: UploadState
  /** Where to show the panel's image from, once known: a local blob or a signed URL. */
  src: string | null
  /** The largest rendition's size, known only for an image uploaded in this visit. */
  bytes: number | null
  start: (file: File) => void
}

interface Options {
  panel: Panel
  images: PanelImageStore
  trackUpload: TrackUpload
  dispatch: Dispatch<DraftAction>
}

export const UPLOAD_FAILED = 'Couldn’t upload the image. Try again.'

interface LocalPreview {
  /** A variant path of the image it shows, to tell whether it's still the panel's. */
  path: string
  url: string
  bytes: number
}

/**
 * Uploads a panel's image and finds an address to show it from. A fresh
 * upload is shown from its own blob; a saved image is shown from its smallest
 * rendition, signed. Object URLs are revoked when replaced or unmounted.
 */
export function usePanelImage({ panel, images, trackUpload, dispatch }: Options): PanelImageControl {
  const [upload, setUpload] = useState<UploadState>({ status: 'idle' })
  const [local, setLocal] = useState<LocalPreview | null>(null)
  const [signed, setSigned] = useState<{ path: string; url: string } | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(
    () => () => {
      if (local) {
        URL.revokeObjectURL(local.url)
      }
    },
    [local],
  )

  const variants = panel.image?.variants ?? []
  const showingLocal = local !== null && variants.some((variant) => variant.path === local.path)
  const thumbPath = variants.length > 0 ? variants.reduce((a, b) => (b.width < a.width ? b : a)).path : null

  useEffect(() => {
    if (!thumbPath || showingLocal) {
      return
    }

    let current = true
    images
      .url(thumbPath)
      .then((url) => current && setSigned({ path: thumbPath, url }))
      .catch((error: unknown) => console.warn(`Couldn’t sign ${thumbPath}`, error))

    return () => {
      current = false
    }
  }, [images, thumbPath, showingLocal])

  const start = (file: File) => {
    setUpload({ status: 'uploading', progress: null })
    const onProgress = (progress: UploadProgress) => {
      if (mounted.current) {
        setUpload({ status: 'uploading', progress })
      }
    }

    trackUpload(images.upload(file, { onProgress })).then(
      ({ image, preview, bytes }) => {
        if (!mounted.current) {
          // The panel was removed, or the editor closed, mid-upload.
          void removeQuietly(images, [image])

          return
        }

        setLocal({ path: image.variants[0].path, url: URL.createObjectURL(preview), bytes })
        dispatch({ type: 'setPanelImage', id: panel.id, image })
        setUpload({ status: 'idle' })
      },
      (error: unknown) => {
        if (!(error instanceof ImagePipelineError)) {
          console.warn('Panel image upload failed', error)
        }

        if (mounted.current) {
          setUpload({ status: 'failed', message: error instanceof ImagePipelineError ? error.message : UPLOAD_FAILED })
        }
      },
    )
  }

  if (local && showingLocal) {
    return { upload, src: local.url, bytes: local.bytes, start }
  }

  return { upload, src: signed && signed.path === thumbPath ? signed.url : null, bytes: null, start }
}

const FORMATS: Record<string, string> = { 'image/webp': 'WebP', 'image/png': 'PNG' }

/** e.g. "1600 × 2133 · WebP · 210 KB"; the size only when it's known. */
export function describeImage(image: NonNullable<Panel['image']>, bytes: number | null): string {
  const largest = image.variants.reduce((a, b) => (b.width > a.width ? b : a), image.variants[0])
  const type = largest?.contentType
  const parts = [`${image.width} × ${image.height}`]

  if (type) {
    parts.push(FORMATS[type] ?? type.replace(/^image\//, '').toUpperCase())
  }

  if (bytes !== null) {
    parts.push(formatBytes(bytes))
  }

  return parts.join(' · ')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
