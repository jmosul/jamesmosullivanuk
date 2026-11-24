import { defineFunction } from '@aws-amplify/backend'

export const listPublishedPersonas = defineFunction({
  name: 'list-published-personas',
  entry: './handler.ts',
  // Lives in the data stack, beside the table it reads.
  resourceGroupName: 'data',
  timeoutSeconds: 10,
})
