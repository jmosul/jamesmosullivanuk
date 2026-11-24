import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import type { Schema } from '../../data/resource'

type Handler = Schema['listPublishedPersonas']['functionHandler']
type PublicPersona = Schema['PublicPersona']['type']
type Persona = Schema['Persona']['type']

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

/**
 * The public view of a persona. Drops status, IDs and timestamps, and leaves
 * out fantasy panels that have no image, since those are drawn as portraits.
 */
export const toPublicPersona = (persona: Persona): PublicPersona => ({
  slug: persona.slug,
  label: persona.label,
  theme: persona.theme,
  name: persona.name ?? null,
  title: persona.title ?? null,
  content: persona.content,
  panelLabel: persona.panelLabel ?? null,
  panelHint: persona.panelHint ?? null,
  rotation: persona.rotation,
  links: persona.links ?? [],
  panels: (persona.panels ?? []).filter(
    (panel) => persona.theme !== 'fantasy' || Boolean(panel.image),
  ),
})

/** Published personas in display order, from the personasByStatus index. */
export const handler: Handler = async () => {
  const personas: Persona[] = []
  let startKey: Record<string, unknown> | undefined

  do {
    const page = await client.send(
      new QueryCommand({
        TableName: process.env.PERSONA_TABLE_NAME,
        IndexName: 'personasByStatus',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'published' },
        ScanIndexForward: true,
        ExclusiveStartKey: startKey,
      }),
    )
    personas.push(...((page.Items ?? []) as Persona[]))
    startKey = page.LastEvaluatedKey
  } while (startKey)

  return personas.map(toPublicPersona)
}
