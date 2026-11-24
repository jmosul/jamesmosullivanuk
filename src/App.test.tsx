import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test } from 'vitest'
import { configureAmplify } from './amplify'
import { AppRoutes } from './App'
import { ThemeProvider } from './theme'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const renderAt = (path: string, authConfigured = false) =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes authConfigured={authConfigured} />
      </MemoryRouter>
    </ThemeProvider>,
  )

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
  // Fake ids: rendering the form makes no calls to Cognito.
  configureAmplify({
    version: '1.4',
    auth: {
      aws_region: 'eu-west-2',
      user_pool_id: 'eu-west-2_TEST',
      user_pool_client_id: 'test-client',
      username_attributes: ['email'],
    },
  })
  renderAt('/signin', true)

  expect(await screen.findByLabelText('Email')).toBeTruthy()
  expect(screen.getByLabelText('Password')).toBeTruthy()
  expect(screen.queryByRole('tab', { name: /create account/i })).toBeNull()
})

test('configureAmplify reports missing auth outputs', () => {
  expect(configureAmplify({} as never)).toBe(false)
})
