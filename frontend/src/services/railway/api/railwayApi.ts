import { BASE, getToken } from '../../../platform/api'
import { RailwayApiError } from './railwayApi.types'
import type { RailwayRequestOptions } from './railwayApi.types'

type Envelope<T> = { success: boolean; data: T | null; message: string | null; errors?: string[]; correlationId?: string }

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

    const payload = (await response.json().catch(() => null)) as Envelope<T> | null

    if (!response.ok || !payload?.success) {
      return {
        data: null,
        error: new RailwayApiError(
          payload?.message ?? `API error ${response.status}`,
          response.status,
          payload?.errors?.[0] ?? '',
        ),
      }
    }

    return { data: payload.data ?? null, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: new RailwayApiError(message, 0, 'network_error') }
  }
}
