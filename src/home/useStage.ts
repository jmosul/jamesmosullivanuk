import { useCallback, useEffect, useRef, useState } from 'react'
import { clampProgress, START_PROGRESS, viewportOf, type Viewport } from './stage'

/** The window's size, as the stage lays out against it. */
export function useViewport(): Viewport {
  const [viewport, setViewport] = useState(() => viewportOf(window.innerWidth, window.innerHeight))

  useEffect(() => {
    const measure = () => setViewport(viewportOf(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [])

  return viewport
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** How long a scroll must pause before the stage settles on the nearest panel. */
const SETTLE_MS = 150

export interface StageMotion {
  /** Where the stage is drawn now, easing towards `target`. */
  progress: number
  /** Where it's heading; round(target) is the panel the caption names. */
  target: number
  /** Moves by a fraction of a panel, e.g. from a wheel or swipe, then settles. */
  nudge: (delta: number) => void
  /** Moves a whole panel forward (1) or back (-1). */
  step: (direction: 1 | -1) => void
}

/**
 * The stage's position, eased towards where the visitor last pushed it.
 * Jumps straight there for visitors who prefer reduced motion.
 */
export function useStageMotion(): StageMotion {
  const start = START_PROGRESS
  const [progress, setProgress] = useState(start)
  const [target, setTargetState] = useState(start)
  const current = useRef(start)
  const goal = useRef(start)
  const frame = useRef<number | null>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(
    () => () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current)
      }

      clearTimeout(settleTimer.current)
    },
    [],
  )

  const animate = useCallback(() => {
    if (prefersReducedMotion()) {
      current.current = goal.current
      setProgress(goal.current)

      return
    }

    if (frame.current !== null) {
      return
    }

    const tick = () => {
      const distance = goal.current - current.current

      if (Math.abs(distance) < 0.0015) {
        current.current = goal.current
        frame.current = null
        setProgress(goal.current)

        return
      }

      current.current += distance * 0.13
      setProgress(current.current)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [])

  const moveTo = useCallback(
    (next: number) => {
      goal.current = clampProgress(next)
      setTargetState(goal.current)
      animate()
    },
    [animate],
  )

  const nudge = useCallback(
    (delta: number) => {
      clearTimeout(settleTimer.current)
      settleTimer.current = setTimeout(() => moveTo(Math.round(goal.current)), SETTLE_MS)
      moveTo(goal.current + delta)
    },
    [moveTo],
  )

  const step = useCallback(
    (direction: 1 | -1) => {
      clearTimeout(settleTimer.current)
      moveTo(Math.round(goal.current) + direction)
    },
    [moveTo],
  )

  return { progress, target, nudge, step }
}
