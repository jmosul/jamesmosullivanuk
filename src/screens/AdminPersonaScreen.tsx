import { useMemo } from 'react'
import { useParams } from 'react-router'
import { AdminGate } from '../admin/AdminGate'
import { PersonaEditor } from '../admin/editor/PersonaEditor'
import { createPanelImageStore } from '../admin/panelImages'
import { createPersonaStore } from '../admin/personas'

/** /a/personas/:personaId: the persona editor. */
export function AdminPersonaScreen({ configured }: { configured: boolean }) {
  return (
    <AdminGate configured={configured}>
      <SignedInEditor />
    </AdminGate>
  )
}

// Only built once signed in: the client needs Amplify's auth to be ready.
function SignedInEditor() {
  const { personaId = '' } = useParams()
  const store = useMemo(() => createPersonaStore(), [])
  const images = useMemo(() => createPanelImageStore(), [])

  return <PersonaEditor store={store} images={images} personaId={personaId} />
}
