import { useMemo } from 'react'
import { useParams } from 'react-router'
import { PersonaEditor } from '../admin/editor/PersonaEditor'
import { createPersonaStore } from '../admin/personas'

/** /a/personas/:personaId: the persona editor. */
export function AdminPersonaScreen() {
  const { personaId = '' } = useParams()
  const store = useMemo(() => createPersonaStore(), [])

  return <PersonaEditor store={store} personaId={personaId} />
}
