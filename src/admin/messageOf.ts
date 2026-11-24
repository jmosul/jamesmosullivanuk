/** A failure's message, for showing to the admin. */
export const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.')
