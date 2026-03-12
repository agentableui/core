import type { ConditionDef } from '../types'

export function defineConditions<TConfig, TContext>(
  conditions: Record<string, ConditionDef<TContext>>
): Record<string, ConditionDef<TContext>> {
  return conditions
}
