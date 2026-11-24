import type { CSSProperties, ReactNode } from 'react'
import type { Theme } from '../theme'
import type { HomePanel } from './personas'
import type { Viewport } from './stage'

/*
 * How each theme draws a panel. The stage places and moves every panel the
 * same way; only the drawing and its size differ, so both live here, picked
 * from PANEL_DRAWINGS.
 */

interface DrawingProps {
  panel: HomePanel
  /** 1-based position among the persona's panels. */
  number: number
}

export interface PanelBox {
  /** Unscaled size in px. */
  width: number
  height: number
  /** Multiplies the slot's scale. */
  scale: number
}

interface PanelDrawing {
  Drawing: (props: DrawingProps) => ReactNode
  box: (panel: HomePanel, viewport: Viewport) => PanelBox
}

// ── Sci-fi: a chamfered tile with a symbol or logo ──

const TILE_WIDTH = 330
const TILE_HEIGHT = 440

function ScifiTile({ panel, number }: DrawingProps) {
  const style = panel.accent ? ({ '--panel-accent': panel.accent } as CSSProperties) : undefined

  return (
    <div className="tile" style={style}>
      <div className="tile-meta">
        <span>{String(number).padStart(2, '0')}</span>
        <span>{panel.subtitle}</span>
      </div>
      {panel.image ? (
        <img className="tile-logo" src={panel.image.src} alt="" draggable={false} />
      ) : (
        <div className="tile-symbol">{panel.symbol}</div>
      )}
      <div className="tile-title">{panel.title}</div>
      <div className="tile-rule" />
    </div>
  )
}

// ── Fantasy: a watercolour portrait, or a placeholder until there is one ──

/** Portraits without an image are drawn at this width to height. */
const PLACEHOLDER_ASPECT = 2 / 3

function FantasyPortrait({ panel }: DrawingProps) {
  if (panel.image) {
    return <img className="portrait" src={panel.image.src} alt="" draggable={false} />
  }

  return (
    <div className="portrait portrait--placeholder" data-placeholder="portrait">
      <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMax meet">
        <ellipse cx="100" cy="118" rx="36" ry="45" vectorEffect="non-scaling-stroke" />
        <path d="M22 300 C28 226 62 186 100 186 C138 186 172 226 178 300" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

export const PANEL_DRAWINGS: Record<Theme, PanelDrawing> = {
  scifi: {
    Drawing: ScifiTile,
    // Tiles are a fixed size, scaled with the window's height.
    box: (_panel, viewport) => ({
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
      scale: viewport.height / (viewport.narrow ? 844 : 900),
    }),
  },
  fantasy: {
    Drawing: FantasyPortrait,
    // Portraits stand the window's full height, at their own proportions.
    box: (panel, viewport) => {
      const aspect = panel.image ? panel.image.width / panel.image.height : PLACEHOLDER_ASPECT

      return { width: viewport.height * aspect, height: viewport.height, scale: 1 }
    },
  },
}
