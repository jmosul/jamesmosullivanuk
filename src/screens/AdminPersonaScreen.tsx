import { useMemo } from 'react'
import { useParams } from 'react-router'
import { PersonaEditor } from '../admin/editor/PersonaEditor'
import { createPanelImageStore } from '../admin/panelImages'
import { createPersonaStore } from '../admin/personas'

/** /a/personas/:personaId: the persona editor. */
export function AdminPersonaScreen() {
  const { personaId = '' } = useParams()
  const store = useMemo(() => createPersonaStore(), [])
  const images = useMemo(() => createPanelImageStore(), [])

  return <PersonaEditor store={store} images={images} personaId={personaId} />
}
