import { createHash } from 'node:crypto'

export function computeVersionHash(manifest: Record<string, unknown>): string {
  const content = JSON.stringify(manifest)
  return createHash('sha256').update(content).digest('hex').slice(0, 8)
}
