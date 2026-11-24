import { useMemo } from 'react'
import { PersonasPage } from '../admin/PersonasPage'
import { createPersonaStore } from '../admin/personas'

/** /a/personas: the persona list and the new-persona tile. */
export function AdminPersonasScreen() {
  const store = useMemo(() => createPersonaStore(), [])

  return <PersonasPage store={store} />
}
