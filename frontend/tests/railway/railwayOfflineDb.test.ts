import { beforeEach, describe, expect, it } from 'vitest'
import { RailwayOfflineDb } from '../../src/services/railway/offline/railwayOfflineDb'
import type { RailwayOfflineScope } from '../../src/services/railway/offline/railwayOffline.types'

const scopeA: RailwayOfflineScope = { userId: 'user-a', organizationId: 'org-a' }
const scopeB: RailwayOfflineScope = { userId: 'user-b', organizationId: 'org-b' }

describe('RailwayOfflineDb', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      const pending = indexedDB.deleteDatabase('railway-offline-v2')
      pending.onsuccess = () => resolve()
      pending.onerror = () => resolve()
      pending.onblocked = () => resolve()
    })
  })

  it('isolates cached assignments by user and organization', async () => {
    const db = new RailwayOfflineDb()
    await db.putAssignment(scopeA, assignment('a', scopeA))
    await db.putAssignment(scopeB, assignment('b', scopeB))

    expect((await db.listAssignments(scopeA)).map((item) => item.assignmentId)).toEqual(['a'])
  })

  it('retains encrypted unsynchronized work when reference packs expire', async () => {
    const db = new RailwayOfflineDb()
    await db.unlockForSession(scopeA)
    await db.putCommand(scopeA, {
      commandId: 'command-1', idempotencyKey: 'idem-1', aggregateId: 'run-1', expectedVersion: 1,
      type: 'inspection.submit', payload: {}, capturedAt: '2026-08-20T00:00:00Z', evidence: [], state: 'pending',
    })
    await db.putAssignment(scopeA, assignment('old-pack', scopeA))

    const result = await db.purgeExpired(scopeA, new Date('2026-08-24T00:00:00Z'))

    expect(result.retainedUnsynced).toContain('command-1')
    expect(await db.getCommand(scopeA, 'command-1')).toBeDefined()
    expect(await db.listAssignments(scopeA)).toEqual([])
  })

  it('locks authored work and clears reference packs on logout', async () => {
    const db = new RailwayOfflineDb()
    await db.unlockForSession(scopeA)
    await db.putCommand(scopeA, {
      commandId: 'command-1', idempotencyKey: 'idem-1', aggregateId: 'run-1', expectedVersion: 1,
      type: 'inspection.submit', payload: {}, capturedAt: new Date().toISOString(), evidence: [], state: 'pending',
    })
    await db.putAssignment(scopeA, assignment('pack', scopeA))

    window.dispatchEvent(new Event('vsr:session-cleared'))
    await db.whenIdle()

    expect(await db.listRecoverableCommands(scopeB)).toEqual([])
    await db.unlockForSession(scopeA)
    expect(await db.listRecoverableCommands(scopeA)).toHaveLength(1)
  })
})

function assignment(id: string, scope: RailwayOfflineScope) {
  return {
    assignmentId: id, runId: `run-${id}`, userId: scope.userId, organizationId: scope.organizationId,
    divisionId: 'division', status: 'pending' as const, capturedAt: '2026-08-20T00:00:00Z', findings: [], evidence: [],
  }
}
