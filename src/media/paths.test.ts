import { describe, expect, it } from 'vitest'
import { panelImagePath } from './index'

describe('panelImagePath', () => {
  it('builds the key from the id, width and WebP type', () => {
    expect(panelImagePath('abc-123', 960, 'image/webp')).toBe('persona-images/abc-123/960.webp')
  })

  it('uses png when the browser fell back to PNG', () => {
    expect(panelImagePath('abc-123', 480, 'image/png')).toBe('persona-images/abc-123/480.png')
  })

  it.each(['', '.', '..', 'a/b', '../x', 'a\\b', 'has space', 'a\nb'])('rejects the id %j', (id) => {
    expect(() => panelImagePath(id, 480, 'image/webp')).toThrow(RangeError)
  })

  it.each([0, -1, 480.5, Number.NaN])('rejects the width %s', (width) => {
    expect(() => panelImagePath('abc', width, 'image/webp')).toThrow(RangeError)
  })

  it.each(['image/jpeg', '', 'image/webp; charset=x', 'constructor'])('rejects the content type %j', (type) => {
    expect(() => panelImagePath('abc', 480, type)).toThrow(RangeError)
  })
})
