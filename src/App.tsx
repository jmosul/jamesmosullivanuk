import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AdminGate, RequireSuperAdmin } from './admin/AdminGate'
import { AuthProvider } from './auth'
import { paths } from './routes'
import { HomeScreen } from './screens/HomeScreen'
import { SiteLayout } from './screens/SiteLayout'
import { ThemeProvider } from './theme'

// Amplify UI is most of the bundle; only the sign-in page needs it.
const SignInScreen = lazy(() =>
  import('./screens/SignInScreen').then((module) => ({ default: module.SignInScreen })),
)

const AdminPersonasScreen = lazy(() =>
  import('./screens/AdminPersonasScreen').then((module) => ({ default: module.AdminPersonasScreen })),
)
const AdminPersonaScreen = lazy(() =>
  import('./screens/AdminPersonaScreen').then((module) => ({ default: module.AdminPersonaScreen })),
)

interface AppProps {
  /** Whether Amplify found auth outputs to sign in against. */
  authConfigured: boolean
}

/** Every page. Render inside a router and a ThemeProvider. */
export function AppRoutes({ authConfigured }: AppProps) {
  return (
    <AuthProvider configured={authConfigured}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path={paths.home} element={<HomeScreen configured={authConfigured} />} />
          <Route
            path={paths.signIn}
            element={
              <Suspense fallback={null}>
                <SignInScreen configured={authConfigured} />
              </Suspense>
            }
          />
          <Route path={paths.admin} element={<AdminGate />}>
            <Route index element={<Navigate to={paths.adminPersonas} replace />} />
            <Route path={paths.adminPersonas} element={<RequireSuperAdmin />}>
              <Route
                index
                element={
                  <Suspense fallback={null}>
                    <AdminPersonasScreen />
                  </Suspense>
                }
              />
              <Route
                path=":personaId"
                element={
                  <Suspense fallback={null}>
                    <AdminPersonaScreen />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={null} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default function App({ authConfigured }: AppProps) {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes authConfigured={authConfigured} />
      </BrowserRouter>
    </ThemeProvider>
  )
}
