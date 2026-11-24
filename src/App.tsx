import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { paths } from './routes'
import { HomeScreen } from './screens/HomeScreen'
import { SiteLayout } from './screens/SiteLayout'
import { ThemeProvider } from './theme'

// Amplify UI is most of the bundle; only the sign-in page needs it.
const SignInScreen = lazy(() =>
  import('./screens/SignInScreen').then((module) => ({ default: module.SignInScreen })),
)

interface AppProps {
  /** Whether Amplify found auth outputs to sign in against. */
  authConfigured: boolean
}

/** Every page. Render inside a router and a ThemeProvider. */
export function AppRoutes({ authConfigured }: AppProps) {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path={paths.home} element={<HomeScreen />} />
        <Route
          path={paths.signIn}
          element={
            <Suspense fallback={null}>
              <SignInScreen configured={authConfigured} />
            </Suspense>
          }
        />
      </Route>
    </Routes>
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
