import type { AgentableConfig, MetaManifest } from '../types'

export function buildMetaManifest(config: AgentableConfig, pathPrefix = '/agentable'): MetaManifest {
  const manifests: Record<string, string> = {}
  for (const role of Object.keys(config.auth)) {
    manifests[role] = `${pathPrefix}/manifest/${role}`
  }

  return {
    agentable: '1.0',
    name: config.name,
    manifests,
    execute: `${pathPrefix}/execute`,
    conditions: `${pathPrefix}/conditions`,
  }
}
