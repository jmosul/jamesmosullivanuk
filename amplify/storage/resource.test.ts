// @vitest-environment node
import { afterEach, expect, test, vi } from 'vitest'

type Access = (typeof import('./resource'))['storageProps']['access']

const loadProps = async (branch?: string) => {
  vi.resetModules()
  vi.stubEnv('AWS_BRANCH', branch)
  const { storageProps } = await import('./resource')

  return storageProps
}

// Records who was given which actions, in place of Amplify's access builder.
const fakeAllow = {
  guest: { to: (actions: string[]) => ({ who: 'guest', actions }) },
  authenticated: { to: (actions: string[]) => ({ who: 'authenticated', actions }) },
} as unknown as Parameters<Access>[0]

afterEach(() => {
  vi.unstubAllEnvs()
})

test('guests and signed-in users can get persona images but not list them', async () => {
  const { access } = await loadProps()

  expect(access(fakeAllow)).toEqual({
    'persona-images/*': [
      { who: 'guest', actions: ['get'] },
      { who: 'authenticated', actions: ['get'] },
    ],
  })
})

test('only the production branch keeps the bucket on delete', async () => {
  expect((await loadProps('main')).keepOnDelete).toBe(true)
  expect((await loadProps('feature')).keepOnDelete).toBe(false)
  expect((await loadProps()).keepOnDelete).toBe(false)
})
