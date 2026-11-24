import { Link } from 'react-router'
import { AdminGate } from '../admin/AdminGate'
import { paths } from '../routes'

/** /a/personas/:personaId: the editor, still to come. */
export function AdminPersonaScreen({ configured }: { configured: boolean }) {
  return (
    <AdminGate configured={configured}>
      <main className="admin">
        <Link to={paths.adminPersonas}>All personas</Link>
      </main>
    </AdminGate>
  )
}
