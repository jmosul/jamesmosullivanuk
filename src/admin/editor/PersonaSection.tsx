import type { Dispatch } from 'react'
import { ToggleGroup } from '../../components/ToggleGroup'
import { SITE_NAME } from '../../site'
import type { DraftAction, PersonaDraft } from './draft'
import { orNull, TextField } from './fields'
import { PlusIcon, TrashIcon } from './icons'

type Rotation = PersonaDraft['rotation']

const ROTATIONS: readonly Rotation[] = ['random', 'ordered']

const ROTATION_LABELS: Record<Rotation, string> = { random: 'Random', ordered: 'In order' }

const ROTATION_HELP: Record<Rotation, string> = {
  random: 'Shuffled on every visit. No panel shows twice on screen at once (needs five or more).',
  ordered: 'Panels come forward in the order listed under Panels.',
}

interface PersonaSectionProps {
  draft: PersonaDraft
  dispatch: Dispatch<DraftAction>
  deleting: 'idle' | 'confirm' | 'busy'
  onDelete: () => void
}

/** The persona's words, panel order and links, and deleting it. */
export function PersonaSection({ draft, dispatch, deleting, onDelete }: PersonaSectionProps) {
  const set = (fields: Partial<PersonaDraft>) => dispatch({ type: 'set', fields })
  const count = draft.content.length

  return (
    <section className="card editor-section" aria-labelledby="persona-heading">
      <header>
        <h2 id="persona-heading" className="section-title">
          Persona
        </h2>
        <p className="section-help">How this persona reads on the homepage.</p>
      </header>

      <div className="field-row">
        <TextField
          label="Toggle label"
          help="The text on the homepage switch."
          value={draft.label}
          onChange={(label) => set({ label })}
        />
        <TextField
          label="Slug"
          help={`Used in links: ?as=${draft.slug}`}
          className="field--mono"
          spellCheck={false}
          value={draft.slug}
          onChange={(slug) => set({ slug })}
        />
      </div>

      <div className="field-row">
        <TextField
          label="Name"
          help={`Leave blank to use ${SITE_NAME}.`}
          placeholder={SITE_NAME}
          value={draft.name}
          onChange={(name) => set({ name: orNull(name) })}
        />
        <TextField
          label="Title"
          help="Optional. Shown under the name."
          value={draft.title}
          onChange={(title) => set({ title: orNull(title) })}
        />
      </div>

      <TextField
        label="Introduction"
        rows={4}
        help="The paragraph under the name. Hidden on short phone screens."
        aside={`${count} ${count === 1 ? 'character' : 'characters'}`}
        value={draft.content}
        onChange={(content) => set({ content })}
      />

      <div className="field-row">
        <TextField
          label="Caption label"
          help="Above the front panel’s name."
          value={draft.panelLabel}
          onChange={(panelLabel) => set({ panelLabel: orNull(panelLabel) })}
        />
        <TextField
          label="Scroll hint"
          help="Desktop only. Phones say “Swipe”."
          value={draft.panelHint}
          onChange={(panelHint) => set({ panelHint: orNull(panelHint) })}
        />
      </div>

      <div className="field">
        <span className="field-label">Panel order</span>
        <ToggleGroup
          label="Panel order"
          options={ROTATIONS}
          labels={ROTATION_LABELS}
          value={draft.rotation}
          onChange={(rotation) => set({ rotation })}
        />
        <p className="field-help">{ROTATION_HELP[draft.rotation]}</p>
      </div>

      <LinkList draft={draft} dispatch={dispatch} />

      <footer className="section-footer">
        <button type="button" className="button button--danger" disabled={deleting === 'busy'} onClick={onDelete}>
          {deleting === 'confirm' ? 'Click again to delete' : deleting === 'busy' ? 'Deleting…' : 'Delete persona'}
        </button>
        <p className="section-help">Removes the toggle and all its panels from the homepage.</p>
      </footer>
    </section>
  )
}

function LinkList({ draft, dispatch }: Pick<PersonaSectionProps, 'draft' | 'dispatch'>) {
  return (
    <div className="link-list">
      <h3 className="field-label">Links</h3>
      {draft.links.map((link, index) => (
        // Links have no id of their own; position is their identity.
        <div className="link-row" key={index}>
          <TextField
            label="Label"
            className="link-label"
            value={link.label}
            onChange={(label) => dispatch({ type: 'setLink', index, fields: { label } })}
          />
          <TextField
            label="Address"
            type="url"
            className="link-href"
            spellCheck={false}
            placeholder="https://"
            value={link.href}
            onChange={(href) => dispatch({ type: 'setLink', index, fields: { href } })}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={link.external}
              onChange={(event) => dispatch({ type: 'setLink', index, fields: { external: event.target.checked } })}
            />
            <span>New tab</span>
          </label>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove link ${link.label || index + 1}`}
            onClick={() => dispatch({ type: 'removeLink', index })}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button type="button" className="button button--quiet" onClick={() => dispatch({ type: 'addLink' })}>
        <PlusIcon />
        Add link
      </button>
    </div>
  )
}
