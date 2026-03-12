export class AgentableError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AgentableError'
    this.code = code
  }
}

export class AgentableRedirect extends Error {
  readonly reason: string

  constructor(reason: string) {
    super(`Redirect: ${reason}`)
    this.name = 'AgentableRedirect'
    this.reason = reason
  }
}
