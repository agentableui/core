import type { AgentableConfig } from '../types'

export function defineAgentable(config: AgentableConfig): AgentableConfig {
  if (!config.name) {
    throw new Error('AgentableConfig: name is required')
  }
  if (!config.baseUrl) {
    throw new Error('AgentableConfig: baseUrl is required')
  }
  if (!config.states[config.entrypoint]) {
    throw new Error(`AgentableConfig: entrypoint "${config.entrypoint}" not found in states`)
  }

  const stateNames = new Set(Object.keys(config.states))

  for (const [stateName, state] of Object.entries(config.states)) {
    for (const [actionName, action] of Object.entries(state.actions)) {
      if (action.transitions && !stateNames.has(action.transitions)) {
        throw new Error(
          `AgentableConfig: state "${stateName}" action "${actionName}" has transition to unknown state "${action.transitions}"`
        )
      }
      if (action.redirects) {
        for (const [reason, target] of Object.entries(action.redirects)) {
          if (!stateNames.has(target)) {
            throw new Error(
              `AgentableConfig: state "${stateName}" action "${actionName}" redirect "${reason}" targets unknown state "${target}"`
            )
          }
        }
      }
      if (action.params) {
        for (const [paramName, param] of Object.entries(action.params)) {
          if (param.type === 'enum' && (!param.values || param.values.length === 0)) {
            throw new Error(
              `AgentableConfig: state "${stateName}" action "${actionName}" param "${paramName}" is enum but missing values`
            )
          }
        }
      }
    }
  }

  return config
}
