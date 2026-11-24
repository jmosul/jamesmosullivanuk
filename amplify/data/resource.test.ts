// @vitest-environment node
import { expect, test } from 'vitest'
import { schema } from './resource'

const sdl = schema.transform().schema

test('anyone can read personas, only SuperAdmins can write them', () => {
  expect(sdl).toContain(
    'type Persona @model @auth(rules: [{allow: public, provider: identityPool, operations: [read]},\n' +
      '  {allow: private, operations: [read]},\n' +
      '  {allow: groups, groups: ["SuperAdmins"]}])',
  )
})

test('no custom operations bypass the model rules', () => {
  expect(sdl).not.toMatch(/type (Query|Mutation)\b/)
})
