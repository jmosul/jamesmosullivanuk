import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent, type WheelEvent } from 'react'
import { ToggleGroup } from '../components/ToggleGroup'
import { DIVIDERS } from '../components/ornaments'
import { SITE_NAME } from '../site'
import { useTheme } from '../theme'
import type { HomePanel, HomePersona, HomePersonaSource } from './personas'
import { PersonaLayer } from './PersonaLayer'
import { orderedSequence, randomSequence } from './stage'
import { useStageMotion, useViewport } from './useStage'

/** A full wheel notch moves this fraction of a panel. */
const WHEEL_STEP = 1 / 460

export function HomePage({ source }: { source: HomePersonaSource }) {
  const personas = usePublishedPersonas(source)
  const { theme, setTheme } = useTheme()
  const [chosenId, setChosenId] = useState<string | null>(null)

  // Until a persona is chosen, show the first one in the visitor's theme.
  const persona =
    personas.find((each) => each.id === chosenId) ?? personas.find((each) => each.theme === theme) ?? personas[0]

  // The page wears the shown persona's theme, and remembers it for other pages.
  useEffect(() => {
    if (persona && persona.theme !== theme) {
      setTheme(persona.theme)
    }
  }, [persona, theme, setTheme])

  // Each persona's panel order, fixed for the visit; the layers and the caption share it.
  const sequences = useMemo(
    () =>
      new Map(
        personas.map((each) => [
          each.id,
          each.rotation === 'random' ? randomSequence(each.panels.length) : orderedSequence(each.panels.length),
        ]),
      ),
    [personas],
  )

  const viewport = useViewport()
  const motion = useStageMotion()
  const touch = useRef({ x: 0, y: 0 }).current

  const onWheel = (event: WheelEvent) => {
    const lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1
    const delta = Math.max(-240, Math.min(240, event.deltaY * lines))
    motion.nudge(delta * WHEEL_STEP)
  }

  const onTouchStart = (event: TouchEvent) => {
    touch.x = event.touches[0].clientX
    touch.y = event.touches[0].clientY
  }

  // A swipe right or up brings the next panel forward.
  const onTouchMove = (event: TouchEvent) => {
    const { clientX, clientY } = event.touches[0]
    const dx = clientX - touch.x
    const dy = touch.y - clientY
    touch.x = clientX
    touch.y = clientY
    motion.nudge(Math.abs(dx) > Math.abs(dy) ? dx / 180 : dy / 260)
  }

  return (
    <div
      className="home"
      style={{ '--progress': motion.progress } as CSSProperties}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {personas.map((each) => (
        <PersonaLayer
          key={each.id}
          persona={each}
          sequence={sequences.get(each.id) ?? []}
          active={each === persona}
          progress={motion.progress}
          viewport={viewport}
        />
      ))}

      <main className="hero">
        {personas.length > 1 && persona && (
          <ToggleGroup
            label="Choose a side"
            options={personas.map((each) => each.id)}
            labels={Object.fromEntries(personas.map((each) => [each.id, each.label]))}
            value={persona.id}
            onChange={setChosenId}
          />
        )}
        <HeroCopy persona={persona} />
      </main>

      {persona && persona.panels.length > 0 && (
        <PanelCaption
          persona={persona}
          sequence={sequences.get(persona.id) ?? []}
          target={motion.target}
          onStep={motion.step}
        />
      )}
    </div>
  )
}

function HeroCopy({ persona }: { persona: HomePersona | undefined }) {
  const name = persona?.name || SITE_NAME
  const cut = name.indexOf(' ')
  const { theme } = useTheme()
  const Divider = DIVIDERS[persona?.theme ?? theme]

  return (
    <>
      <h1 className="hero-title">
        {cut > 0 ? (
          <>
            <span>{name.slice(0, cut)}</span> <span>{name.slice(cut + 1)}</span>
          </>
        ) : (
          name
        )}
      </h1>
      {persona?.title && <p className="hero-byline">{persona.title}</p>}
      {persona && (
        <>
          <Divider />
          <p className="hero-lede">{persona.content}</p>
        </>
      )}
      {persona && persona.links.length > 0 && (
        <div className="hero-links">
          {persona.links.map((link) => (
            <a
              key={link.href}
              className="button button--plate"
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              <span>{link.label}</span>
              <LinkIcon external={link.external} />
              {link.external && <span className="visually-hidden">(opens in a new tab)</span>}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

interface PanelCaptionProps {
  persona: HomePersona
  sequence: readonly number[]
  target: number
  onStep: (direction: 1 | -1) => void
}

/** Previous and next, and the name of the panel at the front, read out as it changes. */
function PanelCaption({ persona, sequence, target, onStep }: PanelCaptionProps) {
  const front: HomePanel | undefined = persona.panels[sequence[Math.round(target)]]

  return (
    <div className="stage-caption">
      <button type="button" className="nav-button nav-button--prev" aria-label="Previous" onClick={() => onStep(-1)}>
        <ArrowIcon direction="back" />
      </button>
      <button type="button" className="nav-button nav-button--next" aria-label="Next" onClick={() => onStep(1)}>
        <ArrowIcon direction="forward" />
      </button>
      <div className="caption-text" role="status">
        {persona.panelLabel && (
          <span className="caption-label">
            <span className="caption-swipe">Swipe · </span>
            {persona.panelLabel}
          </span>
        )}
        <span className="caption-name">{front?.title}</span>
        {front?.subtitle && <span className="caption-subtitle">{front.subtitle}</span>}
      </div>
      {persona.panelHint && <span className="caption-hint">{persona.panelHint}</span>}
    </div>
  )
}

function ArrowIcon({ direction }: { direction: 'back' | 'forward' }) {
  const d =
    direction === 'back' ? 'M4 12 L13 4.5 V9.4 H20 V14.6 H13 V19.5 Z' : 'M20 12 L11 4.5 V9.4 H4 V14.6 H11 V19.5 Z'

  return (
    <svg className="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d={d} />
    </svg>
  )
}

function LinkIcon({ external }: { external: boolean }) {
  return external ? (
    <svg className="icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d="M7 4 H20 V17 L16 13 L8.5 20.5 L3.5 15.5 L11 8 Z" />
    </svg>
  ) : (
    <ArrowIcon direction="forward" />
  )
}

/** Published personas, or none while loading or if they can't be read. */
function usePublishedPersonas(source: HomePersonaSource): HomePersona[] {
  const [personas, setPersonas] = useState<HomePersona[]>([])

  useEffect(() => {
    let current = true
    source
      .listPublished()
      .then((list) => current && setPersonas(list))
      // The page still shows the site name; nothing more useful to say to a visitor.
      .catch((error: unknown) => console.error('Could not load personas', error))

    return () => {
      current = false
    }
  }, [source])

  return personas
}
