import { fetchAuthSession } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuthStatus } from '../auth'
import { paths } from '../routes'

/** Require a signed-in session throughout the admin section. */
export function AdminGate() {
  const status = useAuthStatus()

  if (status === 'checking') {
    return <CheckingAccess />
  }

  if (status === 'signedOut') {
    return <Navigate to={paths.home} replace />
  }

  return <Outlet />
}

/** The shared directory's group allowed to edit website content (see amplify/auth/resource.ts). */
const SUPER_ADMINS = 'SuperAdmins'

type Access = 'checking' | 'allowed' | 'denied'

/** Only SuperAdmins can manage personas. */
export function RequireSuperAdmin() {
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
    return <CheckingAccess />
  }

  if (access === 'denied') {
    return (
      <p className="card" role="alert">
        This account isn’t a SuperAdmin, so it can’t edit personas.
      </p>
    )
  }

  return <Outlet />
}

function CheckingAccess() {
  return (
    <p className="page-note" role="status">
      Checking access…
    </p>
  )
}
