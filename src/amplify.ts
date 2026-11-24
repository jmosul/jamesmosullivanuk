import { Amplify } from 'aws-amplify'

type Outputs = Parameters<typeof Amplify.configure>[0]

// amplify_outputs.json is gitignored and only exists once a backend has been
// deployed or generated, so it's loaded through a glob: without the file the
// site still builds and runs, and sign-in says it isn't set up.
const found = import.meta.glob<Outputs>('../amplify_outputs.json', {
  eager: true,
  import: 'default',
})

/** Configures Amplify from amplify_outputs.json; false when there's no auth to configure. */
export function configureAmplify(outputs: Outputs | undefined = Object.values(found)[0]): boolean {
  if (!outputs || typeof outputs !== 'object' || !('auth' in outputs)) {
    return false
  }

  Amplify.configure(outputs)

  return true
}
