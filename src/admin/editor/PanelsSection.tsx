import { useState, type CSSProperties, type Dispatch } from 'react'
import type { ThemeTraits } from '../../theme'
import { placeholderPanels, newPanel, type DraftAction, type Panel, type PersonaDraft } from './draft'
import { orNull, TextField } from './fields'
import { ArrowIcon, CheckIcon, PlusIcon, TrashIcon, WarningIcon } from './icons'

interface PanelsSectionProps {
  draft: PersonaDraft
  traits: ThemeTraits
  dispatch: Dispatch<DraftAction>
}

/** The persona's panels in display order: add, reorder, remove, and edit one at a time. */
export function PanelsSection({ draft, traits, dispatch }: PanelsSectionProps) {
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
  onToggle: () => void
}

function PanelRow({ panel, index, last, open, traits, dispatch, onToggle }: PanelRowProps) {
  const title = panel.title || 'Untitled panel'
  const needsImage = traits.panelNeedsImage && !panel.image
  const bodyId = `panel-${panel.id}`

  return (
    <li className="panel-row" data-open={open}>
      <div className="panel-row-head">
        <span className="panel-row-number">{String(index + 1).padStart(2, '0')}</span>
        <PanelThumb panel={panel} traits={traits} />
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
          <PanelFields panel={panel} index={index} traits={traits} dispatch={dispatch} />
        </div>
      )}
    </li>
  )
}

/**
 * A small stand-in for how the homepage draws the panel. The frame's look
 * comes from tokens; what goes inside follows the theme's traits.
 */
function PanelThumb({ panel, traits }: { panel: Panel; traits: ThemeTraits }) {
  const missing = traits.panelNeedsImage && !panel.image
  const usesAccent = traits.panelAccents.length > 0

  return (
    <span className="panel-thumb" data-missing={missing} style={accentStyle(panel)} aria-hidden="true">
      {usesAccent && <span className="panel-thumb-bar" />}
      {usesAccent && <span className="panel-thumb-symbol">{panel.symbol}</span>}
      {missing && <WarningIcon />}
    </span>
  )
}

function PanelFields({ panel, index, traits, dispatch }: Omit<PanelRowProps, 'last' | 'open' | 'onToggle'>) {
  const set = (fields: Partial<Panel>) => dispatch({ type: 'setPanel', index, fields })
  const needsImage = traits.panelNeedsImage && !panel.image

  return (
    <>
      <div className="field-row">
        <TextField label="Title" value={panel.title} onChange={(title) => set({ title })} />
        <TextField label="Subtitle" value={panel.subtitle} onChange={(subtitle) => set({ subtitle: orNull(subtitle) })} />
      </div>

      <div className="field">
        <span className="field-label">Image</span>
        {panel.image ? (
          <div className="panel-image">
            <p className="field-help">
              {panel.image.width} × {panel.image.height}
            </p>
            <TextField
              label="Alt text"
              value={panel.image.alt}
              onChange={(alt) => panel.image && set({ image: { ...panel.image, alt } })}
            />
            <button type="button" className="button button--quiet" onClick={() => set({ image: null })}>
              Remove image
            </button>
          </div>
        ) : (
          <p className={needsImage ? 'notice' : 'empty-note'}>
            {needsImage && <WarningIcon />}
            <span>
              Image uploads aren’t available yet.{' '}
              {needsImage ? 'This panel stays off the homepage until it has one.' : 'Without one, the symbol is shown.'}
            </span>
          </p>
        )}
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
