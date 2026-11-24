import { useMemo } from 'react'
import { HomePage } from '../home/HomePage'
import { createPublicPersonaSource } from '../home/personas'
import { samplePersonaSource } from '../home/samplePersonas'

/** /: published personas, or the design's sample content when there's no backend to read. */
export function HomeScreen({ configured }: { configured: boolean }) {
  const source = useMemo(() => (configured ? createPublicPersonaSource() : samplePersonaSource), [configured])

  return <HomePage source={source} />
}
