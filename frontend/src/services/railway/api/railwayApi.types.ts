export type PageResult<T> = {
  items: readonly T[]
  nextCursor: string | null
  total: number | null
}

export type RailwayRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  idempotencyKey?: string
  expectedVersion?: number
}

export class RailwayApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: Readonly<Record<string, readonly string[]>>,
    readonly correlationId: string | null,
  ) { super(message) }
}