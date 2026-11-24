import { memo, type CSSProperties } from 'react'
import { THEME_TRAITS } from '../theme'
import { BACKDROPS } from './backdrops'
import { PANEL_DRAWINGS } from './drawings'
import type { HomePersona } from './personas'
import { onStage, placeAt, slotsFor, type Viewport } from './stage'

interface PersonaLayerProps {
  persona: HomePersona
  /** The order the persona's panels come forward in. */
  sequence: readonly number[]
  active: boolean
  progress: number
  viewport: Viewport
}

/**
 * One persona's backdrop and panels, in that persona's theme. Every persona
 * has a layer so switching cross-fades between them; the layer carries its
 * own data-theme, so its tokens are right whatever the page is wearing.
 * Decorative: the caption names the front panel for screen readers.
 */
export const PersonaLayer = memo(function PersonaLayer({
  persona,
  sequence,
  active,
  progress,
  viewport,
}: PersonaLayerProps) {
  const Backdrop = BACKDROPS[persona.theme]
  const { Drawing, box } = PANEL_DRAWINGS[persona.theme]
  const slots = slotsFor(THEME_TRAITS[persona.theme].panelSlots, viewport)
  const visible = onStage(sequence, progress)

  return (
    <div className="persona-layer" data-theme={persona.theme} data-active={active} aria-hidden="true">
      <Backdrop>
        <div className="stage">
          {persona.panels.map((panel, index) => {
            const relative = visible.get(index)
            const size = box(panel, viewport)
            const style: CSSProperties = { width: size.width, height: size.height }

            if (relative !== undefined) {
              const place = placeAt(relative, slots)
              const scale = place.scale * size.scale
              const x = place.cx * viewport.width - (size.width * scale) / 2
              const y = -place.lift * viewport.height
              style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
              style.opacity = place.opacity
              style.zIndex = place.z
            }

            return (
              <div key={panel.id} className="stage-panel" data-on-stage={relative !== undefined} style={style}>
                <Drawing panel={panel} number={index + 1} />
              </div>
            )
          })}
        </div>
      </Backdrop>
    </div>
  )
})
