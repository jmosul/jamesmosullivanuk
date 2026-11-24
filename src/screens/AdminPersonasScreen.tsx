import { useMemo } from 'react'
import { AdminGate } from '../admin/AdminGate'
import { PersonasPage } from '../admin/PersonasPage'
import { createPersonaStore } from '../admin/personas'

/** /a/personas: the persona list and the new-persona tile. */
export function AdminPersonasScreen({ configured }: { configured: boolean }) {
  return (
    <AdminGate configured={configured}>
      <SignedInPersonas />
    </AdminGate>
  )
}

// Only built once signed in: the client needs Amplify's auth to be ready.
function SignedInPersonas() {
  const store = useMemo(() => createPersonaStore(), [])

  return <PersonasPage store={store} />
}
