import { getCurrentUser } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type AuthStatus = 'checking' | 'signedIn' | 'signedOut'

const AuthStatusContext = createContext<AuthStatus>('signedOut')

export function AuthProvider({ configured, children }: { configured: boolean; children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(configured ? 'checking' : 'signedOut')

  useEffect(() => {
    if (!configured) {
      return
    }

    let checking = true
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'signedOut') {
        checking = false
        setStatus(payload.event)
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
