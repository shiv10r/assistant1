import type { OfflineAssignment, OfflineRailwayCommand, PurgeResult, RailwayOfflineScope } from './railwayOffline.types'

const DB_NAME = 'railway-offline-v2'
const DB_VERSION = 1
const COMMANDS = 'commands'
const ASSIGNMENTS = 'assignments'
const KEYS = 'keys'
const unlockedKeys = new Map<string, CryptoKey>()

type EncryptedCommand = {
  key: string
  scopeKey: string
  commandId: string
  capturedAt: string
  state: OfflineRailwayCommand['state']
  iv: number[]
  ciphertext: ArrayBuffer
}

function scopeKey(scope: RailwayOfflineScope) { return `${scope.organizationId}:${scope.userId}` }
function recordKey(scope: RailwayOfflineScope, id: string) { return `${scopeKey(scope)}:${id}` }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore(COMMANDS, { keyPath: 'key' })
      db.createObjectStore(ASSIGNMENTS, { keyPath: 'key' })
      db.createObjectStore(KEYS, { keyPath: 'scopeKey' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Railway offline database could not open.'))
  })
}

async function request<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const pending = action(transaction.objectStore(storeName))
    pending.onsuccess = () => resolve(pending.result)
    pending.onerror = () => reject(pending.error)
    transaction.oncomplete = () => db.close()
  })
}

async function all<T>(storeName: string): Promise<T[]> {
  return request(storeName, 'readonly', (store) => store.getAll() as IDBRequest<T[]>)
}

export class RailwayOfflineDb {
  constructor() {
    window.addEventListener('vsr:session-cleared', this.lock)
  }

  async unlockForSession(scope: RailwayOfflineScope): Promise<void> {
    const id = scopeKey(scope)
    const stored = await request<{ scopeKey: string; key: CryptoKey } | undefined>(KEYS, 'readonly', (store) => store.get(id))
    const key = stored?.key ?? await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
    if (!stored) await request(KEYS, 'readwrite', (store) => store.put({ scopeKey: id, key }))
    unlockedKeys.set(id, key)
  }

  async putCommand(scope: RailwayOfflineScope, command: OfflineRailwayCommand): Promise<void> {
    const key = this.requiredKey(scope)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const plaintext = new TextEncoder().encode(JSON.stringify(command))
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
    await request(COMMANDS, 'readwrite', (store) => store.put({
      key: recordKey(scope, command.commandId), scopeKey: scopeKey(scope), commandId: command.commandId,
      capturedAt: command.capturedAt, state: command.state, iv: [...iv], ciphertext,
    } satisfies EncryptedCommand))
  }

  async getCommand(scope: RailwayOfflineScope, commandId: string): Promise<OfflineRailwayCommand | undefined> {
    const encrypted = await request<EncryptedCommand | undefined>(COMMANDS, 'readonly', (store) => store.get(recordKey(scope, commandId)))
    return encrypted ? this.decrypt(scope, encrypted) : undefined
  }

  async listCommands(scope: RailwayOfflineScope): Promise<OfflineRailwayCommand[]> {
    const records = (await all<EncryptedCommand>(COMMANDS)).filter((item) => item.scopeKey === scopeKey(scope))
    return Promise.all(records.map((item) => this.decrypt(scope, item)))
  }

  async updateCommandState(scope: RailwayOfflineScope, commandId: string, state: OfflineRailwayCommand['state']): Promise<void> {
    const existing = await this.getCommand(scope, commandId)
    if (existing) await this.putCommand(scope, { ...existing, state })
  }

  async putAssignment(scope: RailwayOfflineScope, assignment: OfflineAssignment): Promise<void> {
    await request(ASSIGNMENTS, 'readwrite', (store) => store.put({ key: recordKey(scope, assignment.assignmentId), scopeKey: scopeKey(scope), assignment }))
  }

  async listAssignments(scope: RailwayOfflineScope): Promise<OfflineAssignment[]> {
    return (await all<{ scopeKey: string; assignment: OfflineAssignment }>(ASSIGNMENTS))
      .filter((item) => item.scopeKey === scopeKey(scope)).map((item) => item.assignment)
  }

  async listRecoverableCommands(scope: RailwayOfflineScope): Promise<OfflineRailwayCommand[]> {
    if (!unlockedKeys.has(scopeKey(scope))) return []
    return (await this.listCommands(scope)).filter((item) => item.state !== 'accepted')
  }

  async purgeExpired(scope: RailwayOfflineScope, now = new Date(), maxAgeHours = 72): Promise<PurgeResult> {
    const cutoff = now.getTime() - maxAgeHours * 3_600_000
    const purgedAssignments: string[] = []
    for (const assignment of await this.listAssignments(scope)) {
      if (new Date(assignment.capturedAt).getTime() < cutoff && !assignment.assignmentId.startsWith('authored:')) {
        await request(ASSIGNMENTS, 'readwrite', (store) => store.delete(recordKey(scope, assignment.assignmentId)))
        purgedAssignments.push(assignment.assignmentId)
      }
    }
    const retainedUnsynced = (await this.listCommands(scope))
      .filter((item) => new Date(item.capturedAt).getTime() < cutoff && item.state !== 'accepted')
      .map((item) => item.commandId)
    return { purgedCommands: [], purgedAssignments, retainedUnsynced, message: `Purged ${purgedAssignments.length} expired reference records; retained ${retainedUnsynced.length} unsynchronized commands` }
  }

  async whenIdle(): Promise<void> { await Promise.resolve() }

  private requiredKey(scope: RailwayOfflineScope) {
    const key = unlockedKeys.get(scopeKey(scope))
    if (!key) throw new Error('Railway authored work is locked for this session.')
    return key
  }

  private async decrypt(scope: RailwayOfflineScope, record: EncryptedCommand): Promise<OfflineRailwayCommand> {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(record.iv) }, this.requiredKey(scope), record.ciphertext)
    return JSON.parse(new TextDecoder().decode(plaintext)) as OfflineRailwayCommand
  }

  private lock = () => { unlockedKeys.clear(); void this.clearAssignments() }
  private async clearAssignments() {
    const db = await openDb()
    await new Promise<void>((resolve) => {
      const transaction = db.transaction(ASSIGNMENTS, 'readwrite')
      transaction.objectStore(ASSIGNMENTS).clear()
      transaction.oncomplete = () => { db.close(); resolve() }
    })
  }
}
