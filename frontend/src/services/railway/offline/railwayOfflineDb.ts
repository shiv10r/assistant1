import type {
  OfflineAssignment,
  OfflineDbState,
  OfflineRailwayCommand,
  PurgeResult,
} from './railwayOffline.types'

const DB_NAME = 'railway-offline'
const DB_VERSION = 1
const COMMAND_STORE = 'commands'
const ASSIGNMENT_STORE = 'assignments'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(COMMAND_STORE)) {
        db.createObjectStore(COMMAND_STORE, { keyPath: 'commandId' })
      }
      if (!db.objectStoreNames.contains(ASSIGNMENT_STORE)) {
        db.createObjectStore(ASSIGNMENT_STORE, { keyPath: 'assignmentId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
  })
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const request = fn(tx.objectStore(storeName))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
    tx.oncomplete = () => db.close()
  })
}

/**
 * IndexedDB-backed offline storage for the Railway field PWA.
 * Server-derived reference packs are purgeable after
 * RAILWAY_OFFLINE_PACK_MAX_AGE_HOURS (72h default); user-authored commands
 * in pending/rejected/conflicted states are retained until synced or discarded.
 */
export class RailwayOfflineDb {
  async putCommand(command: OfflineRailwayCommand): Promise<void> {
    await withStore(COMMAND_STORE, 'readwrite', (s) => s.put(command))
  }

  async getCommand(commandId: string): Promise<OfflineRailwayCommand | undefined> {
    return withStore(COMMAND_STORE, 'readonly', (s) => s.get(commandId))
  }

  async listCommands(): Promise<OfflineRailwayCommand[]> {
    return withStore(COMMAND_STORE, 'readonly', (s) => s.getAll() as IDBRequest<OfflineRailwayCommand[]>)
  }

  async updateCommandState(
    commandId: string,
    state: OfflineRailwayCommand['state'],
  ): Promise<void> {
    const existing = await this.getCommand(commandId)
    if (existing) {
      await this.putCommand({ ...existing, state })
    }
  }

  async putAssignment(assignment: OfflineAssignment): Promise<void> {
    await withStore(ASSIGNMENT_STORE, 'readwrite', (s) => s.put(assignment))
  }

  async listAssignments(): Promise<OfflineAssignment[]> {
    return withStore(
      ASSIGNMENT_STORE,
      'readonly',
      (s) => s.getAll() as IDBRequest<OfflineAssignment[]>,
    )
  }

  /**
   * Purge expired server-derived data; retain unsynchronized authored work.
   */
  async purgeExpired(maxAgeHours = 72): Promise<PurgeResult> {
    const cutoff = Date.now() - maxAgeHours * 3_600_000
    const purgedCommands: string[] = []
    const retainedUnsynced: string[] = []
    const purgedAssignments: string[] = []

    for (const cmd of await this.listCommands()) {
      if (new Date(cmd.capturedAt).getTime() < cutoff) {
        if (cmd.type.startsWith('server:') || cmd.state === 'accepted') {
          await withStore(COMMAND_STORE, 'readwrite', (s) => s.delete(cmd.commandId))
          purgedCommands.push(cmd.commandId)
        } else if (cmd.state === 'pending' || cmd.state === 'rejected' || cmd.state === 'conflicted') {
          retainedUnsynced.push(cmd.commandId)
        }
      }
    }

    for (const a of await this.listAssignments()) {
      if (
        new Date(a.capturedAt).getTime() < cutoff &&
        !a.assignmentId.startsWith('authored:')
      ) {
        await withStore(ASSIGNMENT_STORE, 'readwrite', (s) => s.delete(a.assignmentId))
        purgedAssignments.push(a.assignmentId)
      }
    }

    return {
      purgedCommands,
      purgedAssignments,
      retainedUnsynced,
      message: `Purged ${purgedCommands.length} commands and ${purgedAssignments.length} assignments; retained ${retainedUnsynced.length} unsynchronized drafts`,
    }
  }

  async getState(): Promise<Partial<OfflineDbState>> {
    const [commands, assignments] = await Promise.all([
      this.listCommands(),
      this.listAssignments(),
    ])
    return {
      commands: Object.fromEntries(commands.map((c) => [c.commandId, c])),
      assignments: Object.fromEntries(assignments.map((a) => [a.assignmentId, a])),
    }
  }

  async whenIdle(): Promise<void> {
    await Promise.resolve()
  }
}
