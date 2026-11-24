import { describe, expect, test } from 'vitest'
import { THEME_TRAITS } from '../theme'
import {
  clampProgress,
  largestVisibleScale,
  onStage,
  orderedSequence,
  placeAt,
  randomSequence,
  SEQUENCE_LENGTH,
  START_PROGRESS,
  viewportOf,
} from './stage'

describe('sequences', () => {
  test('ordered runs the panels round in their saved order', () => {
    expect(orderedSequence(3).slice(START_PROGRESS, START_PROGRESS + 7)).toEqual([0, 1, 2, 0, 1, 2, 0])
    expect(orderedSequence(0)).toEqual([])
  })

  test('random never puts a panel on stage twice at once', () => {
    let seed = 1
    const random = () => {
      seed = (seed * 16807) % 2147483647

      return seed / 2147483647
    }
    const sequence = randomSequence(6, random)

    expect(sequence).toHaveLength(SEQUENCE_LENGTH)

    for (let i = 0; i + 5 <= sequence.length; i++) {
      expect(new Set(sequence.slice(i, i + 5)).size).toBe(5)
    }
  })

  test('random copes with a single panel', () => {
    expect(new Set(randomSequence(1))).toEqual(new Set([0]))
  })

  test('starts on the first panel when they run in order', () => {
    const sequence = orderedSequence(7)

    expect(sequence[START_PROGRESS]).toBe(0)
    expect(sequence[START_PROGRESS - 1]).toBe(6)
  })

  test('progress stays clear of the strip ends', () => {
    expect(clampProgress(-50)).toBe(4)
    expect(clampProgress(5000)).toBe(SEQUENCE_LENGTH - 5)
  })
})

describe('onStage', () => {
  test('puts the panel at progress at the front and the next four behind it', () => {
    const stage = onStage(orderedSequence(6), START_PROGRESS)

    expect([...stage.entries()]).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ])
  })

  test('between steps, the front panel is on its way out', () => {
    const stage = onStage(orderedSequence(6), START_PROGRESS + 0.25)

    expect(stage.get(0)).toBeCloseTo(-0.25)
    expect(stage.get(4)).toBeCloseTo(3.75)
  })
})

describe('placeAt', () => {
  const slots = THEME_TRAITS.scifi.panelSlots.wide

  test('the front panel sits in the front slot', () => {
    expect(placeAt(0, slots)).toMatchObject({ ...slots[1], z: 100 })
  })

  test('glides halfway between slots', () => {
    const half = placeAt(0.5, slots)

    expect(half.cx).toBeCloseTo((slots[1].cx + slots[2].cx) / 2)
    expect(half.opacity).toBeCloseTo((slots[1].opacity + slots[2].opacity) / 2)
  })
})

test('narrow viewports are phones and portrait windows', () => {
  expect(viewportOf(1440, 900).narrow).toBe(false)
  expect(viewportOf(390, 844).narrow).toBe(true)
  expect(viewportOf(1000, 1000).narrow).toBe(true)
  expect(viewportOf(1440, 300).height).toBe(560)
})

test('the largest visible scale ignores slots a panel is faded out in', () => {
  expect(largestVisibleScale(THEME_TRAITS.scifi.panelSlots.wide)).toBe(1)
  expect(largestVisibleScale(THEME_TRAITS.fantasy.panelSlots.narrow)).toBe(0.52)
})
