// ── Config types ──

export interface AgentableConfig {
  name: string
  baseUrl: string
  entrypoint: string
  states: Record<string, StateConfig>
  auth: Record<string, string[] | '*'>
  security: SecurityConfig
}

export interface StateConfig {
  route: string
  description: string
  actions: Record<string, ActionConfig>
}

export interface ActionConfig {
  description?: string
  params?: Record<string, ParamConfig>
  transitions?: string
  errors?: string[]
  redirects?: Record<string, string>
  returnToPrevious?: boolean
  available?: string  // condition name
}

export interface ParamConfig {
  type: 'string' | 'number' | 'boolean' | 'enum'
  required: boolean
  description?: string
  values?: string[]  // for enum type
}

export interface SecurityConfig {
  requireApiKey: boolean
  rateLimit: RateLimitConfig
  publicActions: string[]
  authenticatedActions: string[]
}

export interface RateLimitConfig {
  requests: number
  window: string  // format: /^\d+(s|m|h)$/ — e.g., '1m', '30s', '2h'
  scope: 'per-key' | 'per-ip' | 'global'
}

// ── Handlers & Conditions ──

export type HandlerFn<TContext> = (params: Record<string, unknown>, ctx: TContext) => Promise<Record<string, unknown>>

export type Handlers<TConfig, TContext> = Record<string, HandlerFn<TContext>>

export type ConditionCheckFn<TContext> = (ctx: TContext) => Promise<boolean> | boolean

export interface ConditionDef<TContext> {
  description: string
  check: ConditionCheckFn<TContext>
}

export type Conditions<TConfig, TContext> = Record<string, ConditionDef<TContext>>

// ── Manifest types (output of buildManifest) ──

export interface RoleManifest {
  version: '1.0'
  versionHash: string
  name: string
  baseUrl: string
  entrypoint: string
  role: string
  states: Record<string, ManifestState>
  security: {
    publicActions: string[]
    authenticatedActions: string[]
    rateLimit: RateLimitConfig
  }
}

export interface ManifestState {
  route: string
  description: string
  actions: Record<string, ManifestAction>
}

export interface ManifestAction {
  description?: string
  auth?: true
  params?: Record<string, ParamConfig>
  transitions?: string
  errors?: string[]
  redirects?: Record<string, string>
  available?: string
}

export interface MetaManifest {
  agentable: '1.0'
  name: string
  manifests: Record<string, string>
  execute: string
  conditions: string
}

// ── Response envelopes ──

export type ExecuteResponse =
  | { status: 'ok'; state: string; data: Record<string, unknown> }
  | { status: 'error'; state: string; error: { code: string; message: string } }
  | { status: 'redirect'; state: string; reason: string; returnTo: string }
  | { status: 'unavailable'; state: string; condition: string; message: string }
  | { status: 'invalid'; errors: { param: string; message: string }[] }
  | { status: 'unauthorized'; message: string }
  | { status: 'rate-limited'; retryAfter: number }

export interface ConditionsResponse {
  conditions: Record<string, {
    met: boolean
    description: string
  }>
}

// ── Key types ──

export interface KeyOptions {
  role?: string  // default: 'user'
}

export interface GeneratedKey {
  key: string
  prefix: string
  name: string
  role: string
}

export interface KeyInfo {
  prefix: string
  name: string
  role: string
  createdAt: string
  revokedAt: string | null
}

export interface ValidationError {
  param: string
  message: string
}
