import { Authenticator } from '@aws-amplify/ui-react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useEffect, useState, type ReactNode } from 'react'
import '../styles/amplify-ui.css'

/** The shared directory's group allowed to edit website content (see amplify/auth/resource.ts). */
const SUPER_ADMINS = 'SuperAdmins'

type Access = 'checking' | 'allowed' | 'denied'

function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>('checking')

  useEffect(() => {
    let current = true
    fetchAuthSession()
      .then((session) => {
        const groups = session.tokens?.idToken?.payload['cognito:groups']

        if (current) {
          setAccess(Array.isArray(groups) && groups.includes(SUPER_ADMINS) ? 'allowed' : 'denied')
        }
      })
      .catch(() => current && setAccess('denied'))

    return () => {
      current = false
    }
  }, [])

  if (access === 'checking') {
    return (
      <p className="page-note" role="status">
        Checking access…
      </p>
    )
  }

  if (access === 'denied') {
    return (
      <p className="card" role="alert">
        This account isn’t a SuperAdmin, so it can’t edit personas.
      </p>
    )
  }

  return <>{children}</>
}

/** Signs the visitor in and lets only SuperAdmins through to the admin pages. */
export function AdminGate({ configured, children }: { configured: boolean; children: ReactNode }) {
  if (!configured) {
    return (
      <p className="card" role="status">
        Sign-in isn’t set up here: there’s no <code>amplify_outputs.json</code>. Run{' '}
        <code>npx ampx sandbox</code> or generate outputs for a deployed branch.
      </p>
    )
  }

  return (
    <Authenticator hideSignUp>
      <RequireSuperAdmin>{children}</RequireSuperAdmin>
    </Authenticator>
  )
}
