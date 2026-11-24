import { useId, useState, type CSSProperties, type Dispatch } from 'react'
import type { ThemeTraits } from '../../theme'
import type { PanelImageStore } from '../panelImages'
import { placeholderPanels, newPanel, type DraftAction, type Panel, type PersonaDraft } from './draft'
import { orNull, TextField } from './fields'
import { ArrowIcon, CheckIcon, PlusIcon, TrashIcon, WarningIcon } from './icons'
import { describeImage, usePanelImage, type PanelImageControl, type TrackUpload } from './usePanelImage'

interface PanelsSectionProps {
  draft: PersonaDraft
  traits: ThemeTraits
  dispatch: Dispatch<DraftAction>
  images: PanelImageStore
  /** Wraps each upload, so the editor can hold Save until it's done. */
  trackUpload: TrackUpload
}

/** The persona's panels in display order: add, reorder, remove, and edit one at a time. */
export function PanelsSection({ draft, traits, dispatch, images, trackUpload }: PanelsSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const placeholders = placeholderPanels(draft, traits).length

  const add = () => {
    const panel = newPanel(traits)
    dispatch({ type: 'addPanel', panel })
    setOpenId(panel.id)
  }

  return (
    <section className="card editor-section editor-section--wide" aria-labelledby="panels-heading">
      <header className="section-head">
        <div>
          <h2 id="panels-heading" className="section-title">
            Panels <span className="section-count">{draft.panels.length}</span>
          </h2>
          <p className="section-help">{traits.panelDescription}</p>
        </div>
        <button type="button" className="button" onClick={add}>
          <PlusIcon />
          Add panel
        </button>
      </header>

      {placeholders > 0 && (
        <p className="notice" role="note">
          <WarningIcon />
          <span>
            {placeholders === 1 ? '1 panel has no image, so it shows' : `${placeholders} panels have no image, so they show`}{' '}
            a placeholder on the homepage.
          </span>
        </p>
      )}

      {draft.panels.length > 0 ? (
        <ol className="panel-list">
          {draft.panels.map((panel, index) => (
            <PanelRow
              key={panel.id}
              panel={panel}
              index={index}
              last={index === draft.panels.length - 1}
              open={panel.id === openId}
              traits={traits}
              dispatch={dispatch}
              images={images}
              trackUpload={trackUpload}
              onToggle={() => setOpenId(panel.id === openId ? null : panel.id)}
            />
          ))}
        </ol>
      ) : (
        <p className="empty-note">No panels yet. Add one to start the procession.</p>
      )}
    </section>
  )
}

interface PanelRowProps {
  panel: Panel
  index: number
  last: boolean
  open: boolean
  traits: ThemeTraits
  dispatch: Dispatch<DraftAction>
  images: PanelImageStore
  trackUpload: TrackUpload
  onToggle: () => void
}

function PanelRow({ panel, index, last, open, traits, dispatch, images, trackUpload, onToggle }: PanelRowProps) {
  // Held by the row, not the fields, so an upload carries on while the panel is collapsed.
  const image = usePanelImage({ panel, images, trackUpload, dispatch })
  const title = panel.title || 'Untitled panel'
  const needsImage = traits.panelNeedsImage && !panel.image
  const bodyId = `panel-${panel.id}`

  return (
    <li className="panel-row" data-open={open}>
      <div className="panel-row-head">
        <span className="panel-row-number">{String(index + 1).padStart(2, '0')}</span>
        <PanelThumb panel={panel} traits={traits} src={image.src} />
        <button
          type="button"
          className="panel-row-toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <span className="panel-row-title">{title}</span>
          <span className="panel-row-subtitle">{panel.subtitle || traits.panelSubtitleFallback}</span>
        </button>
        {needsImage && <span className="badge">Needs image</span>}
        <button
          type="button"
          className="icon-button"
          aria-label={`Move ${title} up`}
          disabled={index === 0}
          onClick={() => dispatch({ type: 'movePanel', index, by: -1 })}
        >
          <ArrowIcon direction="up" />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Move ${title} down`}
          disabled={last}
          onClick={() => dispatch({ type: 'movePanel', index, by: 1 })}
        >
          <ArrowIcon direction="down" />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Remove ${title}`}
          onClick={() => dispatch({ type: 'removePanel', index })}
        >
          <TrashIcon />
        </button>
      </div>
      {open && (
        <div className="panel-fields" id={bodyId}>
          <PanelFields panel={panel} index={index} traits={traits} dispatch={dispatch} image={image} />
        </div>
      )}
    </li>
  )
}

/**
 * A small stand-in for how the homepage draws the panel. The frame's look
 * comes from tokens; what goes inside follows the theme's traits.
 */
function PanelThumb({ panel, traits, src }: { panel: Panel; traits: ThemeTraits; src: string | null }) {
  const missing = traits.panelNeedsImage && !panel.image
  const usesAccent = traits.panelAccents.length > 0

  if (panel.image && src) {
    return (
      <span className="panel-thumb" aria-hidden="true">
        <img className="panel-thumb-image" src={src} alt="" />
      </span>
    )
  }

  return (
    <span className="panel-thumb" data-missing={missing} style={accentStyle(panel)} aria-hidden="true">
      {usesAccent && <span className="panel-thumb-bar" />}
      {usesAccent && <span className="panel-thumb-symbol">{panel.symbol}</span>}
      {missing && <WarningIcon />}
    </span>
  )
}

interface PanelFieldsProps {
  panel: Panel
  index: number
  traits: ThemeTraits
  dispatch: Dispatch<DraftAction>
  image: PanelImageControl
}

function PanelFields({ panel, index, traits, dispatch, image }: PanelFieldsProps) {
  const set = (fields: Partial<Panel>) => dispatch({ type: 'setPanel', index, fields })
  const needsImage = traits.panelNeedsImage && !panel.image
  const uploading = image.upload.status === 'uploading'
  const imageLabelId = `image-${panel.id}`

  return (
    <>
      <div className="field-row">
        <TextField label="Title" value={panel.title} onChange={(title) => set({ title })} />
        <TextField label="Subtitle" value={panel.subtitle} onChange={(subtitle) => set({ subtitle: orNull(subtitle) })} />
      </div>

      <div className="field" role="group" aria-labelledby={imageLabelId}>
        <span className="field-label" id={imageLabelId}>
          Image
        </span>
        {panel.image ? (
          <div className="panel-image">
            {image.src && (
              <img
                className="panel-image-preview"
                src={image.src}
                alt={panel.image.alt}
                width={panel.image.width}
                height={panel.image.height}
              />
            )}
            <p className="field-help">{describeImage(panel.image, image.bytes)}</p>
            <TextField
              label="Alt text"
              value={panel.image.alt}
              onChange={(alt) => panel.image && set({ image: { ...panel.image, alt } })}
            />
          </div>
        ) : (
          <p className={needsImage ? 'notice' : 'empty-note'}>
            {needsImage && <WarningIcon />}
            <span>
              No image yet.{' '}
              {needsImage ? 'The homepage shows a placeholder until it has one.' : 'Without one, the symbol is shown.'}
            </span>
          </p>
        )}
        <div className="panel-image-actions">
          <ImagePicker label={panel.image ? 'Replace image' : 'Upload image'} disabled={uploading} onPick={image.start} />
          {panel.image && (
            <button
              type="button"
              className="button button--quiet"
              disabled={uploading}
              onClick={() => set({ image: null })}
            >
              Remove image
            </button>
          )}
        </div>
        <UploadStatus state={image.upload} />
      </div>

      {traits.panelAccents.length > 0 && (
        <div className="field-row field-row--start">
          <TextField
            label="Symbol"
            help="Up to three letters, shown when there’s no image."
            className="field--symbol"
            maxLength={3}
            value={panel.symbol}
            onChange={(symbol) => set({ symbol: orNull(symbol) })}
          />
          <div className="field">
            <span className="field-label" id={`accent-${panel.id}`}>
              Accent
            </span>
            <div role="group" aria-labelledby={`accent-${panel.id}`} className="swatches">
              {traits.panelAccents.map(({ name, color }) => {
                const on = panel.accent?.toLowerCase() === color.toLowerCase()

                return (
                  <button
                    key={color}
                    type="button"
                    className="swatch"
                    aria-label={name}
                    aria-pressed={on}
                    style={{ '--swatch': color } as CSSProperties}
                    onClick={() => set({ accent: color })}
                  >
                    {on && <CheckIcon />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const accentStyle = (panel: Panel): CSSProperties | undefined =>
  panel.accent ? ({ '--panel-accent': panel.accent } as CSSProperties) : undefined

/** A file input behind a button-styled label, so it reads and focuses as one control. */
function ImagePicker({ label, disabled, onPick }: { label: string; disabled: boolean; onPick: (file: File) => void }) {
  const id = useId()

  return (
    <span className="file-picker">
      <input
        id={id}
        type="file"
        accept="image/*"
        className="visually-hidden"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Cleared so picking the same file again still fires a change.
          event.target.value = ''

          if (file) {
            onPick(file)
          }
        }}
      />
      <label htmlFor={id} className="button button--quiet">
        {label}
      </label>
    </span>
  )
}

function UploadStatus({ state }: { state: PanelImageControl['upload'] }) {
  const id = useId()

  if (state.status === 'failed') {
    return (
      <p className="notice" role="alert">
        <WarningIcon />
        <span>{state.message}</span>
      </p>
    )
  }

  if (state.status !== 'uploading') {
    return null
  }

  const { transferred = 0, total = 0 } = state.progress ?? {}
  const percent = total > 0 ? Math.round((transferred / total) * 100) : 0

  return (
    <div className="upload-progress">
      <span id={id} role="status">
        Uploading image… {percent}%
      </span>
      <progress aria-labelledby={id} max={100} value={percent} />
    </div>
  )
}
