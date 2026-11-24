import { useEffect, useReducer, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { paths } from '../../routes'
import { THEME_TRAITS, useThemeOverride } from '../../theme'
import { messageOf } from '../messageOf'
import type { Persona, PersonaStore } from '../personas'
import { draftReducer, publishBlockers, saveProblems, toDraft } from './draft'
import { EditorBar } from './EditorBar'
import { PanelsSection } from './PanelsSection'
import { PersonaSection } from './PersonaSection'

interface Loaded {
  persona: Persona
  /** Slugs used by the other personas. */
  takenSlugs: string[]
}

/** /a/personas/:personaId: loads the persona, then edits it. */
export function PersonaEditor({ store, personaId }: { store: PersonaStore; personaId: string }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let current = true
    store
      .list()
      .then((personas) => {
        if (!current) {
          return
        }

        const persona = personas.find((candidate) => candidate.id === personaId)

        if (!persona) {
          setError('There’s no persona with this id.')

          return
        }

        const takenSlugs = personas.filter((other) => other.id !== personaId).map((other) => other.slug)
        setLoaded({ persona, takenSlugs })
      })
      .catch((failure: unknown) => current && setError(messageOf(failure)))

    return () => {
      current = false
    }
  }, [store, personaId])

  if (error) {
    return (
      <main className="admin">
        <p className="card" role="alert">
          Couldn’t load the persona: {error} <Link to={paths.adminPersonas}>All personas</Link>
        </p>
      </main>
    )
  }

  if (!loaded) {
    return (
      <main className="admin">
        <p className="page-note" role="status">
          Loading persona…
        </p>
      </main>
    )
  }

  return <EditorForm key={loaded.persona.id} store={store} {...loaded} />
}

function EditorForm({ store, persona, takenSlugs }: Loaded & { store: PersonaStore }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(() => toDraft(persona))
  const [draft, dispatch] = useReducer(draftReducer, saved)
  const [saving, setSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<'idle' | 'confirm' | 'busy'>('idle')

  // The whole page wears the persona's theme, and follows it as it's changed.
  useThemeOverride(draft.theme)

  const traits = THEME_TRAITS[draft.theme]
  const blockers = publishBlockers(draft, traits)
  const problems = saveProblems(draft, takenSlugs)
  const publishedButNotReady = draft.status === 'published' && blockers.length > 0
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const canSave = dirty && !saving && problems.length === 0 && !publishedButNotReady

  const save = async () => {
    const snapshot = draft
    setSaving(true)
    setFailure(null)

    try {
      await store.update(persona.id, snapshot)
      setSaved(snapshot)
      setHasSaved(true)
    } catch (error) {
      setFailure(messageOf(error))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (deleting === 'idle') {
      setDeleting('confirm')

      return
    }

    setDeleting('busy')
    setFailure(null)

    try {
      await store.remove(persona.id)
      void navigate(paths.adminPersonas)
    } catch (error) {
      setFailure(messageOf(error))
      setDeleting('idle')
    }
  }

  const saveState = saving
    ? 'Saving…'
    : dirty
      ? 'Unsaved changes'
      : hasSaved
        ? 'All changes saved'
        : 'No changes yet'

  return (
    <>
      <EditorBar
        title={draft.label || 'Untitled persona'}
        theme={draft.theme}
        onTheme={(theme) => dispatch({ type: 'set', fields: { theme } })}
        status={draft.status}
        onStatus={(status) => dispatch({ type: 'set', fields: { status } })}
        ready={blockers.length === 0}
        saveState={saveState}
        canSave={canSave}
        onSave={save}
      />
      <main className="editor">
        {(failure || problems.length > 0 || blockers.length > 0) && (
          <div className="editor-notes">
            {failure && (
              <p className="notice" role="alert">
                Couldn’t save: {failure}
              </p>
            )}
            {problems.length > 0 && <Checklist heading="Fix before saving" items={problems} alert />}
            {blockers.length > 0 && (
              <Checklist
                heading={
                  publishedButNotReady
                    ? 'Published, but not ready. Fix these or set the status back to draft to save'
                    : 'Before this can be published'
                }
                items={blockers}
                alert={publishedButNotReady}
              />
            )}
          </div>
        )}
        <PersonaSection
          draft={draft}
          dispatch={(action) => {
            setDeleting('idle')
            dispatch(action)
          }}
          deleting={deleting}
          onDelete={remove}
        />
        <PanelsSection draft={draft} traits={traits} dispatch={dispatch} />
      </main>
    </>
  )
}

function Checklist({ heading, items, alert = false }: { heading: string; items: string[]; alert?: boolean }) {
  return (
    <div className={alert ? 'notice notice--list' : 'notice notice--list notice--quiet'} role={alert ? 'alert' : 'note'}>
      <p className="notice-heading">{heading}:</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
