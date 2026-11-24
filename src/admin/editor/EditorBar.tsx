import { useId } from 'react'
import { Link } from 'react-router'
import { ToggleGroup } from '../../components/ToggleGroup'
import { paths } from '../../routes'
import { THEME_LABELS, THEMES, type Theme } from '../../theme'
import { PERSONA_STATUS_LABELS, PERSONA_STATUSES, type PersonaStatus } from '../personas'
import { ArrowIcon } from './icons'

interface EditorBarProps {
  title: string
  theme: Theme
  onTheme: (theme: Theme) => void
  status: PersonaStatus
  onStatus: (status: PersonaStatus) => void
  /** Whether the persona is ready to be published (see publishBlockers). */
  ready: boolean
  saveState: string
  canSave: boolean
  onSave: () => void
}

/** Back link, the persona's name, its theme and status, and saving. */
export function EditorBar({ title, theme, onTheme, status, onStatus, ready, saveState, canSave, onSave }: EditorBarProps) {
  const statusId = useId()

  return (
    <div className="editor-bar">
      <Link to={paths.adminPersonas} className="button button--quiet">
        <ArrowIcon direction="left" />
        All personas
      </Link>
      <h1 className="editor-title">{title}</h1>
      <ToggleGroup label="Theme" options={THEMES} labels={THEME_LABELS} value={theme} onChange={onTheme} />
      <div className="field field--inline">
        <label htmlFor={statusId}>Status</label>
        <select
          id={statusId}
          value={status}
          onChange={(event) => {
            const next = event.target.value as PersonaStatus

            if (next !== 'published' || ready) {
              onStatus(next)
            }
          }}
        >
          {PERSONA_STATUSES.map((option) => (
            <option key={option} value={option} disabled={option === 'published' && !ready}>
              {PERSONA_STATUS_LABELS[option]}
              {option === 'published' && !ready ? ' (not ready)' : ''}
            </option>
          ))}
        </select>
      </div>
      <span className="editor-save-state" role="status">
        {saveState}
      </span>
      <button type="button" className="button" disabled={!canSave} onClick={onSave}>
        Save changes
      </button>
    </div>
  )
}
