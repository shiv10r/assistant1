import { BASE } from '../../platform/api'
import type { PageResult, RailwayRequestOptions, RailwayApiError } from './railwayApi.types'

export async function railwayRequest<T>(
  path: string,
  options: RailwayRequestOptions = {}
): Promise<{ data: T | null; error: RailwayApiError | null }> {
  const {
    method = 'GET',
    body,
    signal,
    idempotencyKey,
    expectedVersion,
  } = options

  const headers: Record<string, string> = {
    ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }),
    ...(expectedVersion && { 'If-Match': `"${expectedVersion}"` }),
  }

  const url = BASE + path
  const config: RequestInit = {
    method,
    headers: {
      ...headers,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(await import('../auth/session').getToken() ? { Authorization: `Bearer ${(await import('../auth/session').getToken())!}` } : {}),
    },
    signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }

  try {
    const response = await fetch(url, config)
    const data = (await response.json()) as { success: boolean; data: T | null; message: string | null; errors: string[]; timestamp: string; correlationId?: string }

    if (!response.ok) {
      const error: RailwayApiError = {
        message: data.message || `API error ${response.status}`,
        status: response.status,
        code: data.errors?.[0] || '',
        fieldErrors: {},
        correlationId: data.correlationId || null,
      }
      return { data: null, error }
    }

    return { data: data.data ?? null, error: null }
  } catch (err: any) {
    const error: RailwayApiError = {
      message: err.message || 'Network error',
      status: 0,
      code: 'network_error',
      fieldErrors: {},
      correlationId: null,
    }
    return { data: null, error }
  }
}