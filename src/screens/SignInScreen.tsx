import { Authenticator } from '@aws-amplify/ui-react'
import '../styles/amplify-ui.css'

/**
 * Amplify's sign-in form against the shared Cognito pool. Accounts are
 * created by an administrator, so the sign-up tab is hidden; a first sign-in
 * with a temporary password goes on to Amplify's new-password step.
 */
export function SignInScreen({ configured }: { configured: boolean }) {
  return (
    <main className="page">
      <h1 className="page-title">Sign in</h1>
      {configured ? (
        // Authenticator brings its own provider; nothing else reads auth state yet.
        <Authenticator hideSignUp>
          {({ user, signOut }) => (
            <section className="card" aria-labelledby="signed-in-heading">
              <p className="eyebrow" id="signed-in-heading">
                Signed in
              </p>
              <p>{user?.signInDetails?.loginId ?? user?.username}</p>
              <button type="button" className="button button--quiet" onClick={signOut}>
                Sign out
              </button>
            </section>
          )}
        </Authenticator>
      ) : (
        <p className="card" role="status">
          Sign-in isn’t set up here: there’s no <code>amplify_outputs.json</code>. Run{' '}
          <code>npx ampx sandbox</code> or generate outputs for a deployed branch.
        </p>
      )}
    </main>
  )
}
