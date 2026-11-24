import type { ReactNode } from 'react'
import type { Theme } from '../theme'

/*
 * Small drawings whose shapes differ by theme. Colours come from tokens via
 * classes in components.css; only the shapes are per theme.
 */

function ScifiMonogram() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <polygon className="monogram-fill" points="26,2 47,14 47,38 26,50 5,38 5,14" />
      <polygon className="monogram-shade" points="26,9 41,18 41,34 26,43 11,34 11,18" />
    </svg>
  )
}

/** A wax seal. */
function FantasyMonogram() {
  return (
    <svg viewBox="-2 -2 56 56" aria-hidden="true">
      <path
        className="monogram-fill"
        d="M52.5 26 L52.8 28.3 L52.1 30.6 L50.5 32.6 L48.6 34.2 L47.1 35.8 L46.2 37.7 L45.7 39.8 L45.2 42.1 L44.2 44.2 L42.5 45.6 L40.3 46.4 L38 46.8 L36 47.5 L34.3 48.7 L32.5 50.4 L30.6 52 L28.4 53 L26 52.8 L23.8 51.7 L21.7 50.2 L19.9 48.9 L17.9 48.3 L15.7 48.1 L13.4 47.9 L11.2 47.1 L9.6 45.5 L8.6 43.4 L7.9 41.2 L6.9 39.3 L5.5 37.9 L3.5 36.5 L1.4 34.9 L0 33 L-0.4 30.7 L0.1 28.3 L1.1 26 L1.9 23.9 L2.2 21.8 L2 19.6 L1.9 17.2 L2.4 15 L3.8 13.2 L5.8 11.9 L8 10.9 L9.8 9.8 L11 8.2 L12 6 L13.2 3.8 L14.8 2 L16.9 1.1 L19.3 1.1 L21.7 1.5 L23.9 1.8 L26 1.5 L28.2 0.8 L30.5 0.2 L32.9 0.4 L34.9 1.5 L36.5 3.4 L37.8 5.5 L39.2 7.2 L40.9 8.3 L43 9 L45.3 9.8 L47.3 11.1 L48.5 13 L49 15.3 L49.1 17.6 L49.3 19.7 L50.1 21.7 L51.3 23.8 Z"
      />
      <circle className="monogram-shade" cx="26" cy="26.5" r="17" />
    </svg>
  )
}

export const MONOGRAMS: Record<Theme, () => ReactNode> = {
  scifi: ScifiMonogram,
  fantasy: FantasyMonogram,
}

function ScifiDivider() {
  return (
    <svg className="divider" viewBox="0 0 220 14" aria-hidden="true">
      <rect className="divider-accent" x="0" y="3" width="8" height="8" />
      <rect className="divider-line" x="14" y="6" width="150" height="2" />
      <rect className="divider-accent" x="172" y="4" width="6" height="6" />
      <rect className="divider-accent" x="184" y="4" width="6" height="6" opacity="0.6" />
      <rect className="divider-accent" x="196" y="4" width="6" height="6" opacity="0.3" />
    </svg>
  )
}

function FantasyDivider() {
  return (
    <svg className="divider" viewBox="0 0 220 14" aria-hidden="true">
      <polygon className="divider-line" points="0,7 94,5.4 102,7 94,8.6" />
      <polygon className="divider-line" points="220,7 126,5.4 118,7 126,8.6" />
      <polygon className="divider-accent" points="110,0.5 117,7 110,13.5 103,7" />
      <circle className="divider-bead" cx="110" cy="7" r="1.8" />
    </svg>
  )
}

export const DIVIDERS: Record<Theme, () => ReactNode> = {
  scifi: ScifiDivider,
  fantasy: FantasyDivider,
}
