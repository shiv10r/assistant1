import { BASE, getToken } from '../../../platform/api'
import { RailwayApiError } from './railwayApi.types'
import type { RailwayRequestOptions } from './railwayApi.types'

type Envelope<T> = {
  success: boolean
  data: T | null
  message: string | null
  errors?: string[] | Record<string, readonly string[]>
  code?: string
  correlationId?: string
}

type ProblemDetails = {
  title?: string
  detail?: string
  code?: string
  errors?: Record<string, readonly string[]>
  correlationId?: string
  extensions?: {
    code?: string
    errors?: Record<string, readonly string[]>
    correlationId?: string
  }
}

export async function railwayRequest<T>(
  path: string,
  options: RailwayRequestOptions = {},
): Promise<{ data: T | null; error: RailwayApiError | null }> {
  const { method = 'GET', body, signal, idempotencyKey, expectedVersion } = options

  const headers: Record<string, string> = {}
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
  if (expectedVersion !== undefined) headers['If-Match'] = `"${expectedVersion}"`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const response = await fetch(BASE + path, {
      method,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const payload = (await response.json().catch(() => null)) as Envelope<T> | ProblemDetails | null

    if (!response.ok) {
      const problem = payload as ProblemDetails | null
      const envelope = payload as Envelope<T> | null
      const envelopeErrors = envelope?.errors
      const fieldErrors = !Array.isArray(envelopeErrors)
        ? envelopeErrors ?? problem?.errors ?? problem?.extensions?.errors ?? {}
        : {}
      return {
        data: null,
        error: new RailwayApiError(
          problem?.detail ?? problem?.title ?? envelope?.message ?? `API error ${response.status}`,
          response.status,
          problem?.code ?? problem?.extensions?.code ?? envelope?.code ?? (Array.isArray(envelopeErrors) ? envelopeErrors[0] : '') ?? '',
          fieldErrors,
          problem?.correlationId ?? problem?.extensions?.correlationId ?? envelope?.correlationId ?? response.headers.get('x-correlation-id'),
        ),
      }
    }

    if (payload && 'success' in payload) {
      if (!payload.success) {
        return {
          data: null,
          error: new RailwayApiError(payload.message ?? 'Railway request failed', response.status, payload.code),
        }
      }
      return { data: payload.data ?? null, error: null }
    }

    return { data: payload as T | null, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: new RailwayApiError(message, 0, 'network_error') }
  }
}
