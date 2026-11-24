import { getCurrentUser } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type AuthStatus = 'checking' | 'signedIn' | 'signedOut'

const AuthStatusContext = createContext<AuthStatus>('signedOut')

// Amplify clears its stored tokens for these Cognito refresh errors.
const TERMINAL_REFRESH_ERRORS = [
  'NotAuthorizedException',
  'TokenRevokedException',
  'UserNotFoundException',
  'PasswordResetRequiredException',
  'UserNotConfirmedException',
  'RefreshTokenReuseException',
]

export function AuthProvider({ configured, children }: { configured: boolean; children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(configured ? 'checking' : 'signedOut')

  useEffect(() => {
    if (!configured) {
      return
    }

    let checking = true
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload
      const sessionInvalidated = event === 'tokenRefresh_failure' &&
        TERMINAL_REFRESH_ERRORS.some((name) => payload.data.error?.name.startsWith(name))

      if (event === 'signedIn' || event === 'signedOut' || sessionInvalidated) {
        checking = false
        setStatus(event === 'signedIn' ? 'signedIn' : 'signedOut')
      }
    })

    void getCurrentUser().then(
      () => checking && setStatus('signedIn'),
      () => checking && setStatus('signedOut'),
    )

    return () => {
      checking = false
      unsubscribe()
    }
  }, [configured])

  return <AuthStatusContext value={configured ? status : 'signedOut'}>{children}</AuthStatusContext>
}

export function useAuthStatus() {
  return useContext(AuthStatusContext)
}
