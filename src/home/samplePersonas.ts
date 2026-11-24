import type { HomePanel, HomePersona, HomePersonaSource } from './personas'

const tile = (id: string, title: string, subtitle: string, symbol: string, accent: string): HomePanel => ({
  id,
  title,
  subtitle,
  image: null,
  symbol,
  accent,
})

const portrait = (id: string, title: string, subtitle: string | null = null): HomePanel => ({
  id,
  title,
  subtitle,
  image: null,
  symbol: null,
  accent: null,
})

/**
 * The homepage design's content, shown when there's no backend to read
 * (local development without amplify_outputs.json, and tests). The live site
 * reads published personas instead.
 */
export const SAMPLE_PERSONAS: HomePersona[] = [
  {
    id: 'engineer',
    label: 'Software Engineer',
    theme: 'scifi',
    name: null,
    title: 'Principal Software Engineer',
    content:
      'I build and run a SaaS product used by thousands of people, from PHP and Laravel to Node and TypeScript, on AWS infrastructure.',
    panelLabel: 'In the stack',
    panelHint: 'Scroll to cycle the stack',
    rotation: 'random',
    links: [{ href: 'https://www.linkedin.com/in/jmosullivan/', label: 'LinkedIn profile', external: true }],
    panels: [
      tile('php', 'PHP', 'Language', 'Ph', '#B79CFF'),
      tile('node', 'Node.js', 'Runtime', 'Nd', '#5EE6FF'),
      tile('aws', 'AWS', 'Cloud', 'Aw', '#FFB547'),
      tile('azure', 'Azure', 'Cloud', 'Az', '#5EE6FF'),
      tile('dotnet', '.NET', 'Framework', 'Nt', '#B79CFF'),
      tile('docker', 'Docker', 'Containers', 'Dk', '#5EE6FF'),
      tile('terraform', 'Terraform', 'Infrastructure as code', 'Tf', '#B79CFF'),
      tile('claude-code', 'Claude Code', 'AI coding agent', 'Cc', '#FFB547'),
      tile('devin', 'Devin', 'AI coding agent', 'Dv', '#FFB547'),
    ],
  },
  {
    id: 'worldbuilder',
    label: 'Worldbuilder',
    theme: 'fantasy',
    name: null,
    title: null,
    content:
      'By day I build software for the web. The rest of the time I build worlds: the World of Eate, the Brecan Seas, and the people who live in them.',
    panelLabel: 'Stepping forward',
    panelHint: 'Scroll to bring another forward',
    rotation: 'random',
    links: [],
    panels: [
      portrait('riemar', 'Riemar'),
      portrait('zathryn', 'Zathryn'),
      portrait('maeve', 'Maeve'),
      portrait('fiachra', 'Fiachra'),
      portrait('thalina', 'Queen Thalina I', 'Albriah, World of Eate'),
      portrait('alyce', 'Alyce Lichfield'),
    ],
  },
]

export const samplePersonaSource: HomePersonaSource = {
  listPublished: () => Promise.resolve(SAMPLE_PERSONAS),
}
