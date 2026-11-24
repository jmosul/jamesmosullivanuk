// @vitest-environment node
import { expect, test } from 'vitest'
import { schema } from './resource'

const sdl = schema.transform().schema

const typeBlock = (name: string) => {
  const match = sdl.match(new RegExp(`^type ${name}\\b[\\s\\S]*?\\n\\}`, 'm'))
  if (!match) throw new Error(`Missing type ${name}`)
  return match[0]
}

test('only SuperAdmins can read or write personas', () => {
  expect(typeBlock('Persona')).toMatch(
    /^type Persona @model @auth\(rules: \[\{allow: groups, groups: \["SuperAdmins"\]\}\]\)/,
  )
})

test('the public query is the only operation open to guests', () => {
  expect(typeBlock('Query')).toContain(
    'listPublishedPersonas: [PublicPersona!]! @function(name: "FnListPublishedPersonas") @auth(rules: [{allow: public, provider: identityPool},\n  {allow: private}])',
  )
  expect(sdl).not.toMatch(/type Mutation/)
})

test('the public type exposes no status or identifiers', () => {
  const publicPersona = typeBlock('PublicPersona')
  expect(publicPersona).not.toMatch(/\b(status|id|sortOrder|createdAt|updatedAt|owner):/)
})
