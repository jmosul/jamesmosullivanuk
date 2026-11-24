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

test('panel images hold their renditions, each with its own storage path', () => {
  expect(sdl).toContain(
    'type PanelImageFile \n{\n  path: String!\n  width: Int!\n  height: Int!\n  contentType: String!\n}',
  )
  expect(sdl).toContain(
    'type PanelImage \n{\n  alt: String!\n  width: Int!\n  height: Int!\n  variants: [PanelImageFile!]!\n}',
  )
})
