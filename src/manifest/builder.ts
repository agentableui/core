import type { AgentableConfig, RoleManifest, ManifestState, ManifestAction } from '../types'
import { computeVersionHash } from './hash'

export function buildManifest(config: AgentableConfig, role: string): RoleManifest {
  const allowedStates = config.auth[role]
  if (!allowedStates) {
    throw new Error(`Unknown auth role: "${role}"`)
  }

  const stateNames = allowedStates === '*'
    ? new Set(Object.keys(config.states))
    : new Set(allowedStates)

  const states: Record<string, ManifestState> = {}

  for (const stateName of stateNames) {
    const stateConfig = config.states[stateName]
    if (!stateConfig) continue

    const actions: Record<string, ManifestAction> = {}

    for (const [actionName, actionConfig] of Object.entries(stateConfig.actions)) {
      if (actionConfig.transitions && !stateNames.has(actionConfig.transitions)) {
        continue
      }

      const manifestAction: ManifestAction = {}
      if (actionConfig.description) manifestAction.description = actionConfig.description
      if (actionConfig.params) manifestAction.params = actionConfig.params
      if (actionConfig.transitions) manifestAction.transitions = actionConfig.transitions
      if (actionConfig.errors) manifestAction.errors = actionConfig.errors
      if (actionConfig.redirects) manifestAction.redirects = actionConfig.redirects
      if (actionConfig.available) manifestAction.available = actionConfig.available

      if (config.security.authenticatedActions.includes(actionName)) {
        manifestAction.auth = true
      }

      actions[actionName] = manifestAction
    }

    states[stateName] = {
      route: stateConfig.route,
      description: stateConfig.description,
      actions,
    }
  }

  const manifestBody = {
    version: '1.0' as const,
    name: config.name,
    baseUrl: config.baseUrl,
    entrypoint: config.entrypoint,
    role,
    states,
    security: {
      publicActions: config.security.publicActions,
      authenticatedActions: config.security.authenticatedActions,
      rateLimit: config.security.rateLimit,
    },
  }

  const versionHash = computeVersionHash(manifestBody as Record<string, unknown>)

  return { ...manifestBody, versionHash }
}
