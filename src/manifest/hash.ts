import { createHash } from 'node:crypto'

function sortedStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(sortedStringify).join(',') + ']'
  const sorted = Object.keys(obj as Record<string, unknown>).sort()
  return '{' + sorted.map(k => JSON.stringify(k) + ':' + sortedStringify((obj as Record<string, unknown>)[k])).join(',') + '}'
}

export function computeVersionHash(manifest: object): string {
  const content = sortedStringify(manifest)
  return createHash('sha256').update(content).digest('hex').slice(0, 8)
}
