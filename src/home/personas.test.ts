import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPublicPersonaSource, toHomeImage } from './personas'

const { fetchAuthSession, generateClient, getUrl } = vi.hoisted(() => ({
  fetchAuthSession: vi.fn(),
  generateClient: vi.fn(),
  getUrl: vi.fn(),
}))

vi.mock('aws-amplify/auth', () => ({ fetchAuthSession }))
vi.mock('aws-amplify/data', () => ({ generateClient }))
vi.mock('aws-amplify/storage', () => ({ getUrl }))

const signed = ({ path }: { path: string }) => Promise.resolve({ url: new URL(`https://cdn.test/${path}?sig=1`) })

const variant = (width: number, contentType = 'image/webp') => ({
  path: `persona-images/maeve/${width}.webp`,
  width,
  height: width * 1.5,
  contentType,
})

const image = (variants = [variant(960), variant(480), variant(1600)]) => ({
  alt: 'Maeve',
  width: 1600,
  height: 2400,
  variants,
})

beforeEach(() => {
  getUrl.mockImplementation(signed)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

test.each([
  { visitor: 'guest', session: {}, authMode: 'identityPool' },
  { visitor: 'signed-in user', session: { tokens: { accessToken: {} } }, authMode: 'userPool' },
])('loads published personas as a $visitor using $authMode', async ({ session, authMode }) => {
  const listPersonasByStatus = vi.fn().mockResolvedValue({
    data: [{ slug: 'maeve', label: 'Maeve', content: 'Welcome', links: [], panels: [] }],
  })
  fetchAuthSession.mockResolvedValue(session)
  generateClient.mockReturnValue({ models: { Persona: { listPersonasByStatus } } })

  expect(await createPublicPersonaSource().listPublished()).toMatchObject([{ id: 'maeve', label: 'Maeve' }])
  expect(generateClient).toHaveBeenCalledWith({ authMode })
  expect(listPersonasByStatus).toHaveBeenCalledWith({ status: 'published' }, { nextToken: undefined })
})

test('signs every rendition into a srcset, smallest first, with the largest as src', async () => {
  expect(await toHomeImage(image())).toEqual({
    src: 'https://cdn.test/persona-images/maeve/1600.webp?sig=1',
    srcSet: [
      'https://cdn.test/persona-images/maeve/480.webp?sig=1 480w',
      'https://cdn.test/persona-images/maeve/960.webp?sig=1 960w',
      'https://cdn.test/persona-images/maeve/1600.webp?sig=1 1600w',
    ].join(', '),
    alt: 'Maeve',
    width: 1600,
    height: 2400,
  })
  expect(getUrl).toHaveBeenCalledWith({ path: 'persona-images/maeve/480.webp', options: { expiresIn: 3600 } })
})

test('a single small rendition is still served, as both src and srcset', async () => {
  const result = await toHomeImage({ ...image([variant(320, 'image/png')]), width: 320, height: 480 })

  expect(result?.src).toBe('https://cdn.test/persona-images/maeve/320.webp?sig=1')
  expect(result?.srcSet).toBe('https://cdn.test/persona-images/maeve/320.webp?sig=1 320w')
})

test('a repeated width is offered once', async () => {
  const result = await toHomeImage(image([variant(480), variant(480)]))

  expect(result?.srcSet).toBe('https://cdn.test/persona-images/maeve/480.webp?sig=1 480w')
})

test('renditions that fail to sign are left out, and src falls back to the largest that signed', async () => {
  getUrl.mockImplementation((input: { path: string }) =>
    input.path.endsWith('1600.webp') ? Promise.reject(new Error('expired credentials')) : signed(input),
  )

  const result = await toHomeImage(image())

  expect(result?.src).toBe('https://cdn.test/persona-images/maeve/960.webp?sig=1')
  expect(result?.srcSet).toBe(
    [
      'https://cdn.test/persona-images/maeve/480.webp?sig=1 480w',
      'https://cdn.test/persona-images/maeve/960.webp?sig=1 960w',
    ].join(', '),
  )
  // The layout keeps the image's own proportions.
  expect([result?.width, result?.height]).toEqual([1600, 2400])
  expect(console.warn).toHaveBeenCalledOnce()
})

test('the panel goes without an image when no rendition can be signed', async () => {
  getUrl.mockRejectedValue(new Error('no credentials'))

  expect(await toHomeImage(image())).toBeNull()
})

test('an image with no renditions is no image', async () => {
  expect(await toHomeImage(image([]))).toBeNull()
  expect(getUrl).not.toHaveBeenCalled()
})
