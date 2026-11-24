import { Authenticator } from '@aws-amplify/ui-react'
import { Navigate } from 'react-router'
import { useAuthStatus } from '../auth'
import { paths } from '../routes'
import '../styles/amplify-ui.css'

/**
 * Amplify's sign-in form against the shared Cognito pool. Accounts are
 * created by an administrator, so the sign-up tab is hidden; a first sign-in
 * with a temporary password goes on to Amplify's new-password step.
 */
export function SignInScreen({ configured }: { configured: boolean }) {
  const status = useAuthStatus()

  if (status === 'signedIn') {
    return <Navigate to={paths.admin} replace />
  }

  return (
    <main className="page">
      <h1 className="page-title">Sign in</h1>
      {configured ? (
        <Authenticator hideSignUp />
      ) : (
        <p className="card" role="status">
          Sign-in isn’t set up here: there’s no <code>amplify_outputs.json</code>. Run{' '}
          <code>npx ampx sandbox</code> or generate outputs for a deployed branch.
        </p>
      )}
    </main>
  )
}
