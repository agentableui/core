import type { ActionConfig, HandlerFn } from '../types'

function isPureTransition(actionConfig: ActionConfig): boolean {
  return (
    !!actionConfig.transitions &&
    !actionConfig.params &&
    !actionConfig.errors &&
    !actionConfig.redirects &&
    !actionConfig.available &&
    !actionConfig.returnToPrevious
  )
}

export function resolveHandler<TContext>(
  state: string,
  action: string,
  handlers: Record<string, HandlerFn<TContext>>,
  actionConfig: ActionConfig
): HandlerFn<TContext> | null {
  const scopedKey = `${state}.${action}`

  if (handlers[scopedKey]) return handlers[scopedKey]
  if (handlers[action]) return handlers[action]
  if (isPureTransition(actionConfig)) return null

  throw new Error(
    `No handler found for action "${action}" in state "${state}" and it is not a pure transition`
  )
}
