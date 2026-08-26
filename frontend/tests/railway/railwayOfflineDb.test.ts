import { beforeEach, describe, expect, it } from 'vitest'
import { RailwayOfflineDb } from '../../src/services/railway/offline/railwayOfflineDb'

describe('RailwayOfflineDb', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('railway-offline')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
  })

  it('retains old unsynchronized authored work during reference-pack purge', async () => {
    const db = new RailwayOfflineDb()
    await db.putCommand({
      commandId: 'command-1',
      idempotencyKey: 'idem-1',
      aggregateId: 'run-1',
      expectedVersion: 1,
      type: 'inspection.submit',
      payload: {},
      capturedAt: '2026-08-20T00:00:00Z',
      evidence: [],
      state: 'pending',
    })

    const result = await db.purgeExpired(72)

    expect(result.retainedUnsynced).toContain('command-1')
    expect(await db.getCommand('command-1')).toBeDefined()
  })
})
