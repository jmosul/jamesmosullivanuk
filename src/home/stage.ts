import type { PanelSlot, PanelSlots } from '../theme'

/**
 * The stage is a long strip of panel indexes; `progress` is a position along
 * it, and the panel at round(progress) is at the front. The strip is long
 * enough that nobody scrolls off either end.
 */
export const SEQUENCE_LENGTH = 800

/** How far from either end of the strip progress may go. */
const EDGE = 4

export const clampProgress = (progress: number) => Math.max(EDGE, Math.min(SEQUENCE_LENGTH - 1 - EDGE, progress))

/** Where progress starts: mid-strip, so the visitor can go either way. */
export const START_PROGRESS = SEQUENCE_LENGTH / 2

/** Panels in their saved order, round and round, with the first at the start. */
export function orderedSequence(count: number): number[] {
  if (count === 0) {
    return []
  }

  return Array.from({ length: SEQUENCE_LENGTH }, (_, index) => (((index - START_PROGRESS) % count) + count) % count)
}

/**
 * A shuffled first pass, then each next panel drawn at random from those not
 * in the last few, so nothing is on stage twice at once (given 5+ panels).
 */
export function randomSequence(count: number, random: () => number = Math.random): number[] {
  if (count === 0) {
    return []
  }

  const ids = Array.from({ length: count }, (_, index) => index)

  for (let a = count - 1; a > 0; a--) {
    const b = Math.floor(random() * (a + 1))
    ;[ids[a], ids[b]] = [ids[b], ids[a]]
  }

  const gap = Math.min(4, count - 1)
  const sequence = [...ids]

  while (sequence.length < SEQUENCE_LENGTH) {
    const recent = sequence.slice(sequence.length - gap)
    const pool = gap > 0 ? ids.filter((id) => !recent.includes(id)) : ids
    sequence.push(pool[Math.floor(random() * pool.length)])
  }

  return sequence
}

/**
 * Each visible panel's place relative to the front: 0 is the front, 1 the
 * one behind, -0.5 halfway out. Only (-1, depth) is on stage, where depth is
 * the arriving slot's place: `slots.length - 2` of the slots from `stageSlots`.
 */
export function onStage(sequence: readonly number[], progress: number, depth: number): Map<number, number> {
  const visible = new Map<number, number>()

  if (sequence.length === 0) {
    return visible
  }

  const base = Math.floor(progress)

  for (let step = base; step <= base + depth; step++) {
    const relative = step - progress

    if (relative > -1 && relative < depth && step < sequence.length) {
      visible.set(sequence[step], relative)
    }
  }

  return visible
}

export interface Placement extends PanelSlot {
  /** Stacking order: nearer panels on top. */
  z: number
}

/** The slot for a relative place, gliding between the two slots either side. */
export function placeAt(relative: number, slots: readonly PanelSlot[]): Placement {
  const whole = Math.floor(relative)
  const t = relative - whole
  const from = slots[whole + 1]
  const to = slots[whole + 2]
  const mix = (key: keyof PanelSlot) => from[key] + (to[key] - from[key]) * t

  return {
    cx: mix('cx'),
    lift: mix('lift'),
    scale: mix('scale'),
    opacity: mix('opacity'),
    z: Math.round(100 - relative * 10),
  }
}

export interface Viewport {
  width: number
  height: number
  /** Phones and portrait windows, which use the narrow slots. */
  narrow: boolean
}

/** Shorter windows still lay the stage out as if 560px tall. */
export const MIN_STAGE_HEIGHT = 560

export function viewportOf(width: number, height: number): Viewport {
  const tall = Math.max(height, MIN_STAGE_HEIGHT)

  return { width, height: tall, narrow: width < 820 || width / tall < 1.05 }
}

export const slotsFor = (slots: PanelSlots, viewport: Viewport) => (viewport.narrow ? slots.narrow : slots.wide)

/**
 * The slots a persona with `count` panels uses. A panel can only be in one
 * place at once, so with fewer panels than the stage has places, the places
 * behind the front are cut down to what the panels can fill, keeping the
 * leaving and arriving slots either end. A lone panel stays at the front.
 */
export function stageSlots(slots: readonly PanelSlot[], count: number): readonly PanelSlot[] {
  const behind = slots.length - 3

  if (count <= 1) {
    return [slots[1], slots[1], slots[1]]
  }

  if (count - 2 >= behind) {
    return slots
  }

  return [...slots.slice(0, count), slots[slots.length - 1]]
}

/** The largest scale a panel is drawn at while it can be seen. */
export const largestVisibleScale = (slots: readonly PanelSlot[]) =>
  Math.max(...slots.filter((slot) => slot.opacity > 0).map((slot) => slot.scale))
