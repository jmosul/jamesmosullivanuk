import { useEffect, useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { adminPersonaPath } from '../routes'
import { isTheme, THEME_LABELS, THEMES, type Theme } from '../theme'
import { bySortOrder, createDraftPersona, type Persona, type PersonaStore } from './personas'

const STATUS_LABELS: Record<Persona['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

/** The persona list, with a tile that opens into a form for a new draft. */
export function PersonasPage({ store }: { store: PersonaStore }) {
  const [personas, setPersonas] = useState<Persona[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let current = true
    store
      .list()
      .then((list) => current && setPersonas(bySortOrder(list)))
      .catch((error: unknown) => current && setLoadError(messageOf(error)))
    return () => {
      current = false
    }
  }, [store])

  return (
    <main className="admin">
      <h1 className="page-title">Personas</h1>
      <p className="admin-intro">
        Each persona is a toggle on the homepage, in the order shown here.
      </p>
      {loadError && (
        <p className="card" role="alert">
          Couldn’t load personas: {loadError}
        </p>
      )}
      {personas && (
        <ul className="persona-grid">
          {personas.map((persona, index) => (
            <li key={persona.id}>
              <PersonaCard persona={persona} position={index + 1} />
            </li>
          ))}
          <li>
            <NewPersonaTile store={store} />
          </li>
        </ul>
      )}
      {!personas && !loadError && (
        <p className="page-note" role="status">
          Loading personas…
        </p>
      )}
    </main>
  )
}

function PersonaCard({ persona, position }: { persona: Persona; position: number }) {
  const panels = persona.panels.length
  return (
    <article className="persona-card" data-theme={persona.theme} aria-label={persona.label}>
      <p className="eyebrow">{String(position).padStart(2, '0')}</p>
      <h2 className="persona-card-title">{persona.label}</h2>
      {persona.title && <p className="persona-card-byline">{persona.title}</p>}
      <p className="persona-card-content">{persona.content}</p>
      <p className="eyebrow persona-card-meta">
        {STATUS_LABELS[persona.status]} · {THEME_LABELS[persona.theme]} · {panels}{' '}
        {panels === 1 ? 'panel' : 'panels'}
      </p>
    </article>
  )
}

function NewPersonaTile({ store }: { store: PersonaStore }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [theme, setTheme] = useState<Theme>('scifi')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ids = useId()

  if (!open) {
    return (
      <button type="button" className="persona-add" onClick={() => setOpen(true)}>
        <span className="persona-add-mark" aria-hidden="true">
          +
        </span>
        <span className="persona-add-title">New persona</span>
        <span className="persona-add-hint">Starts as a draft with no links or panels</span>
      </button>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const persona = await createDraftPersona(store, { name, content, theme })
      void navigate(adminPersonaPath(persona.id))
    } catch (failure) {
      setError(messageOf(failure))
      setSaving(false)
    }
  }

  return (
    <form className="card persona-form" onSubmit={submit} aria-label="New persona">
      <h2 className="persona-card-title">New persona</h2>
      <div className="field">
        <label htmlFor={`${ids}-name`}>Name</label>
        <input
          id={`${ids}-name`}
          type="text"
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${ids}-content`}>Content</label>
        <textarea
          id={`${ids}-content`}
          rows={4}
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${ids}-theme`}>Theme</label>
        <select
          id={`${ids}-theme`}
          value={theme}
          onChange={(event) => isTheme(event.target.value) && setTheme(event.target.value)}
        >
          {THEMES.map((option) => (
            <option key={option} value={option}>
              {THEME_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
      {error && <p role="alert">Couldn’t create the persona: {error}</p>}
      <div className="persona-form-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Creating…' : 'Create draft'}
        </button>
        <button type="button" className="button button--quiet" disabled={saving} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.')
