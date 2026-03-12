import type { ActionConfig, ValidationError } from '../types'

export function validateParams(
  actionConfig: ActionConfig,
  params: Record<string, unknown>
): ValidationError[] {
  if (!actionConfig.params) return []

  const errors: ValidationError[] = []

  for (const [name, paramConfig] of Object.entries(actionConfig.params)) {
    const value = params[name]

    if (value === undefined || value === null) {
      if (paramConfig.required) {
        errors.push({ param: name, message: `Required parameter "${name}" is missing` })
      }
      continue
    }

    switch (paramConfig.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({ param: name, message: `Parameter "${name}" must be a string` })
        }
        break
      case 'number':
        if (typeof value !== 'number') {
          errors.push({ param: name, message: `Parameter "${name}" must be a number` })
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({ param: name, message: `Parameter "${name}" must be a boolean` })
        }
        break
      case 'enum':
        if (!paramConfig.values?.includes(value as string)) {
          errors.push({
            param: name,
            message: `Parameter "${name}" must be one of: ${paramConfig.values?.join(', ')}`,
          })
        }
        break
    }
  }

  return errors
}
