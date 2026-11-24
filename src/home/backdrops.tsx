import { useId, type CSSProperties, type ReactNode } from 'react'
import type { Theme } from '../theme'

/*
 * Each theme's backdrop is different markup, so each is its own component,
 * picked from BACKDROPS. They're static: motion comes from CSS reading the
 * --progress property the homepage sets, so turning the stage doesn't
 * re-render them. The panels are passed in as children so each backdrop
 * decides what sits in front of them.
 */

interface BackdropProps {
  /** The panels on stage. */
  children: ReactNode
}

/** An id that's safe inside url(#…). */
const useSvgId = () => useId().replace(/[^\w-]/g, '')

// ── Sci-fi: a drifting star field and a planet's rim ──

/** [x, y, radius, opacity] within a tile. */
type Star = readonly [number, number, number, number]

const FAR_STARS: readonly Star[] = [
  [190, 235, 1, 0.45], [359, 80, 1.2, 0.46], [258, 78, 1, 0.39], [38, 340, 0.7, 0.52], [166, 190, 1.2, 0.54],
  [262, 349, 0.7, 0.28], [80, 102, 0.7, 0.6], [137, 248, 0.8, 0.48], [269, 210, 0.7, 0.46], [117, 419, 0.7, 0.57],
  [132, 96, 1, 0.26], [237, 45, 0.7, 0.63], [162, 402, 0.7, 0.35], [389, 22, 1, 0.69], [167, 31, 0.8, 0.6],
  [113, 37, 1, 0.26], [172, 388, 0.8, 0.36], [42, 25, 1, 0.33], [235, 188, 0.8, 0.69], [323, 176, 1, 0.3],
  [177, 89, 1, 0.64], [409, 249, 0.7, 0.34], [166, 359, 1.2, 0.3], [416, 90, 1, 0.25], [256, 349, 1, 0.28],
  [38, 245, 0.8, 0.26], [155, 261, 0.8, 0.68], [203, 241, 1, 0.33], [65, 382, 1.2, 0.36], [80, 311, 1.2, 0.34],
  [399, 371, 1.2, 0.29], [20, 46, 1.2, 0.68], [100, 296, 1, 0.44], [380, 206, 1.2, 0.33],
]

const NEAR_STARS: readonly (readonly [...Star, string])[] = [
  [399, 475, 2.1, 0.76, '#FFE2B0'], [339, 538, 1.4, 0.52, '#FFE2B0'], [100, 238, 1.4, 0.72, '#9FEFFF'],
  [367, 8, 1.4, 0.61, '#9FEFFF'], [586, 490, 1.4, 0.56, '#E8F6FF'], [395, 81, 1.4, 0.58, '#E8F6FF'],
  [138, 629, 1.4, 0.63, '#9FEFFF'], [127, 561, 2.1, 0.57, '#E8F6FF'], [620, 126, 1.7, 0.51, '#9FEFFF'],
  [266, 599, 1.7, 0.63, '#E8F6FF'], [523, 375, 2.1, 0.78, '#FFE2B0'],
]

/** One repeating tile of stars, a tile wider than the screen so it can slide by a whole tile. */
function Starfield({ tile, speed, children }: { tile: number; speed: number; children: ReactNode }) {
  const id = useSvgId()
  const style = { '--tile': `${tile}px`, '--speed': `${speed}px` } as CSSProperties

  return (
    <svg className="starfield" style={style}>
      <defs>
        <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
          {children}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

function ScifiBackdrop({ children }: BackdropProps) {
  return (
    <>
      <div className="backdrop-glow" />
      <Starfield tile={420} speed={18}>
        {FAR_STARS.map(([cx, cy, r, opacity]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#CFE6FF" opacity={opacity} />
        ))}
      </Starfield>
      <Starfield tile={640} speed={52}>
        {NEAR_STARS.map(([cx, cy, r, opacity, fill]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />
        ))}
      </Starfield>
      <div className="planet" />
      {children}
      <div className="vignette" />
    </>
  )
}

// ── Fantasy: watercolour washes and paper grain ──

interface WashProps {
  className: string
  frequency: number
  seed: number
  displacement: number
  blur: number
  channel: 'G' | 'B'
  children: ReactNode
}

/** Soft shapes roughened by turbulence, so they bleed like paint. */
function Wash({ className, frequency, seed, displacement, blur, channel, children }: WashProps) {
  const id = useSvgId()

  return (
    <svg className={className} viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} seed={seed} result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={displacement}
            xChannelSelector="R"
            yChannelSelector={channel}
          />
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </svg>
  )
}

function PaperGrain() {
  const id = useSvgId()

  return (
    <svg className="grain">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.31  0 0 0 0 0.18  0.32 0 0 0 -0.06" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

function FantasyBackdrop({ children }: BackdropProps) {
  return (
    <>
      <Wash className="wash wash--a" frequency={0.007} seed={7} displacement={120} blur={10} channel="G">
        <ellipse cx="800" cy="780" rx="340" ry="300" fill="#C9A25F" opacity="0.26" />
        <ellipse cx="930" cy="560" rx="150" ry="210" fill="#7FA0B0" opacity="0.16" />
      </Wash>
      <Wash className="wash wash--b" frequency={0.011} seed={21} displacement={90} blur={8} channel="B">
        <ellipse cx="560" cy="700" rx="230" ry="180" fill="#8E3B3B" opacity="0.11" />
        <ellipse cx="420" cy="860" rx="200" ry="120" fill="#C9A25F" opacity="0.14" />
      </Wash>
      {children}
      <PaperGrain />
      <div className="vignette" />
    </>
  )
}

export const BACKDROPS: Record<Theme, (props: BackdropProps) => ReactNode> = {
  scifi: ScifiBackdrop,
  fantasy: FantasyBackdrop,
}
