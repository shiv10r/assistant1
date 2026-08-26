export type PageResult<T> = {
  items: readonly T[]
  nextCursor: string | null
  total: number | null
}

export type RailwayCapabilities = {
  organizationId: string
  railwayEnabled: boolean
  inspectionEnabled: boolean
  maintenanceEnabled: boolean
  crowdEnabled: boolean
  liveCrowdAdaptersEnabled: boolean
  aiEnabled: boolean
  offlinePackMaxAgeHours: number
  permissions: readonly string[]
}

export type RailwayRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  idempotencyKey?: string
  expectedVersion?: number
}

export class RailwayApiError extends Error {
  status: number
  code: string
  fieldErrors: Record<string, readonly string[]>
  correlationId: string | null

  constructor(
    message: string,
    status: number,
    code: string = '',
    fieldErrors: Record<string, readonly string[]> = {},
    correlationId: string | null = null,
  ) {
    super(message)
    this.name = 'RailwayApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
    this.correlationId = correlationId
  }
}
