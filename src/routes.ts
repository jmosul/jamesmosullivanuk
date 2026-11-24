export const paths = {
  home: '/',
  signIn: '/signin',
  adminPersonas: '/a/personas',
} as const

export const adminPersonaPath = (personaId: string) =>
  `${paths.adminPersonas}/${encodeURIComponent(personaId)}`
