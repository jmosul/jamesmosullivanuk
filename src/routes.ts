const admin = '/a'

export const paths = {
  home: '/',
  signIn: '/signin',
  admin,
  adminPersonas: `${admin}/personas`,
} as const

export const adminPersonaPath = (personaId: string) =>
  `${paths.adminPersonas}/${encodeURIComponent(personaId)}`
