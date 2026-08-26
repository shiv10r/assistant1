import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/platform/api', () => ({
  BASE: 'https://api.example.test',
  getToken: () => 'test-token',
}))

import { railwayRequest } from '../../src/services/railway/api/railwayApi'

describe('railwayRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('adds authorization, idempotency, and expected version headers', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: 'defect-1' }, message: null }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))

    await railwayRequest('/api/railway/defects', {
      method: 'POST',
      idempotencyKey: 'cmd-1',
      expectedVersion: 3,
      body: { severity: 'Critical' },
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/railway/defects',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Idempotency-Key': 'cmd-1',
          'If-Match': '"3"',
        }),
      }),
    )
  })

  it('preserves Problem Details fields and correlation metadata', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      title: 'Validation failed',
      detail: 'The request was invalid.',
      code: 'railway.validation',
      errors: { severity: ['Severity is required.'] },
      correlationId: 'corr-1',
    }), { status: 400 }))

    const result = await railwayRequest('/api/railway/defects', { method: 'POST', body: {} })

    expect(result.error).toMatchObject({
      status: 400,
      code: 'railway.validation',
      fieldErrors: { severity: ['Severity is required.'] },
      correlationId: 'corr-1',
    })
  })
})
