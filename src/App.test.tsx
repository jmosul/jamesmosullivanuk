import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as auth from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { useEffect } from 'react'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import { configureAmplify } from './amplify'
import { AppRoutes } from './App'
import { ThemeProvider } from './theme'

vi.mock('aws-amplify/auth', async (importOriginal) => {
  const auth = await importOriginal<typeof import('aws-amplify/auth')>()

  return {
    ...auth,
    fetchAuthSession: vi.fn(auth.fetchAuthSession),
    fetchUserAttributes: vi.fn(auth.fetchUserAttributes),
    getCurrentUser: vi.fn(auth.getCurrentUser),
    signIn: vi.fn(auth.signIn),
  }
})

vi.mock(import('./home/personas'), () => ({
  createPublicPersonaSource: () => ({ listPublished: async () => [] }),
}))

vi.mock(import('./screens/AdminPersonasScreen'), () => ({
  AdminPersonasScreen: () => <h1>Personas</h1>,
}))

const user = { username: 'test-user', userId: 'test-id' }

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.resetAllMocks()
})

function renderAt(path: string, authConfigured = false) {
  if (authConfigured) {
    // Fake IDs let the form and local auth state run without a Cognito backend.
    configureAmplify({
      version: '1.4',
      auth: {
        aws_region: 'eu-west-2',
        user_pool_id: 'eu-west-2_TEST',
        user_pool_client_id: 'test-client',
        username_attributes: ['email'],
      },
    })
  }

  const locations: string[] = []

  function TrackLocation() {
    const { pathname } = useLocation()
    useEffect(() => {
      locations.push(pathname)
    }, [pathname])

    return null
  }

  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes authConfigured={authConfigured} />
        <TrackLocation />
      </MemoryRouter>
    </ThemeProvider>,
  )

  return locations
}

test('renders the home page heading', () => {
  renderAt('/')

  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('James O’Sullivan')
  expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/signin')
})

test('says sign-in is not set up without Amplify outputs', async () => {
  renderAt('/signin')

  expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy()
  expect(screen.getByRole('status').textContent).toContain('amplify_outputs.json')
})

test('shows the Amplify sign-in form without a sign-up tab', async () => {
  renderAt('/signin', true)

  expect(await screen.findByLabelText('Email')).toBeTruthy()
  expect(screen.getByLabelText('Password')).toBeTruthy()
  expect(screen.queryByRole('tab', { name: /create account/i })).toBeNull()
})

test('waits for the email verification step before redirecting through the admin index', async () => {
  vi.mocked(auth.signIn).mockImplementationOnce(async () => {
    vi.mocked(auth.getCurrentUser).mockResolvedValue(user)
    Hub.dispatch('auth', { event: 'signedIn', data: user })

    return { isSignedIn: true, nextStep: { signInStep: 'DONE' } }
  })
  vi.mocked(auth.fetchUserAttributes).mockResolvedValueOnce({
    email: 'test@example.com',
    email_verified: 'false',
  })
  const locations = renderAt('/signin', true)
  fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'example-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  const skip = await screen.findByRole('button', { name: 'Skip' })
  expect(locations).toEqual(['/signin'])
  fireEvent.click(skip)

  expect((await screen.findByRole('alert')).textContent).toContain('isn’t a SuperAdmin')
  expect(locations).toEqual(['/signin', '/a', '/a/personas'])
})

test('links an existing session to admin and returns home after sign-out', async () => {
  vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(user)
  const idToken = { payload: { 'cognito:groups': ['SuperAdmins'] } }
  vi.mocked(auth.fetchAuthSession).mockResolvedValueOnce({ tokens: { idToken, accessToken: idToken } })
  const locations = renderAt('/', true)

  const adminLink = await screen.findByRole('link', { name: 'Admin' })
  expect(adminLink.getAttribute('href')).toBe('/a')
  expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull()
  fireEvent.click(adminLink)
  await screen.findByRole('heading', { name: 'Personas' })
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

  expect(await screen.findByRole('link', { name: 'Sign in' })).toBeTruthy()
  expect(locations).toEqual(['/', '/a', '/a/personas', '/'])
})

test.each(['/a', '/a/personas', '/a/personas/p1', '/a/future/page'])(
  'redirects signed-out visitors from %s to the homepage',
  async (path) => {
    const locations = renderAt(path, true)

    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeTruthy()
    expect(locations).toEqual([path, '/'])
  },
)

test('configureAmplify reports missing auth outputs', () => {
  expect(configureAmplify({} as never)).toBe(false)
})
