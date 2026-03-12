import type { HandlerFn } from '../types'

export function defineHandlers<TConfig>() {
  return <TContext>(handlers: Record<string, HandlerFn<TContext>>): Record<string, HandlerFn<TContext>> => {
    return handlers
  }
}
