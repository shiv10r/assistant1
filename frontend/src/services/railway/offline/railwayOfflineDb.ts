import { RailwayOfflineDb, OfflineRailwayCommand, OfflineDbState, OfflineAssignment, SyncCommandResult, PurgeResult } from './railwayOffline.types'

const DB_NAME = 'railway-offline'
const DB_VERSION = 2
const COMMAND_STORE = 'railway-commands'
const ASSIGNMENT_STORE = 'railway-assignments'
const SYNC_STORE = 'railway-sync-results'

export class IndexedDB implements RailwayOfflineDb {
  private db: IDBDatabase | null = null
  private promise: IDBOpenDBRequest | null = null
  private readonly offlinePackMaxAgeHours = 72

  constructor() {
    this.promise = this.openDatabase()
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBDatabase).result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(COMMAND_STORE)) {
          const commandStore = db.createObjectStore(COMMAND_STORE, {
            keyPath: 'commandId',
            autoIncrement: false,
          })
          // Index by scope and state
          commandStore.createIndex('byState', 'state', { notUnique: true })
          commandStore.createIndex('byScope', 'aggregateId', { notUnique: true })
          commandStore.createIndex('byCapturedAt', 'capturedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(ASSIGNMENT_STORE)) {
          const assignmentStore = db.createObjectStore(ASSIGNMENT_STORE, {
            keyPath: 'assignmentId',
            autoIncrement: false,
          })
          // Index by scope and state
          assignmentStore.createIndex('byState', 'status', { notUnique: true })
          assignmentStore.createIndex('byUser', 'userId', { notUnique: true })
          assignmentStore.createIndex('byOrg', 'organizationId', { notUnique: true })
          assignmentStore.createIndex('byCapturedAt', 'capturedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: 'commandId', autoIncrement: false })
        }
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBDatabase).result
        this.db = db
        resolve(db)
      }

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target?.error)
        reject(event.target?.error)
      }
    })
  }

  // --- Command Store ---

  async getCommand(commandId: string): Promise<OfflineRailwayCommand | undefined> {
    if (!this.db) await this.promise
    const tx = this.db!.transaction(COMMAND_STORE, 'readonly')
    const store = tx.objectStore(COMMAND_STORE)
    const request = store.get(commandId)
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result as OfflineRailwayCommand | undefined)
      request.onerror = () => resolve(undefined)
    })
  }

  async listCommands(
    scope: 'user' | 'org' | 'div',
    userId?: string,
    organizationId?: string,
    divisionId?: string,
  ): Promise<OfflineRailwayCommand[]> {
    if (!this.db) await this.promise
    const tx = this.db!.transaction(COMMAND_STORE, 'readonly')
    const store = tx.objectStore(COMMAND_STORE)

    return new Promise((resolve) => {
      const allCommands: OfflineRailwayCommand[] = []
      const cursorRequest = store.openCursor()

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBCursorResult).result
        if (cursor) {
          const command = cursor.value as OfflineRailwayCommand

          // Apply scope filtering
          const matchesScope =
            scope === 'user'
              ? userId && command.aggregateId.startsWith(`user:${userId}`)
              : scope === 'org'
              ? organizationId && command.aggregateId.startsWith(`org:${organizationId}`)
              : scope === 'div'
              ? divisionId && command.aggregateId.startsWith(`div:${divisionId}`)
              : true

          if (matchesScope) {
            // Only include commands newer than last purge
            const lastPurge = new Date(this.getState().lastPurgeAt).getTime()
            const capturedAt = new Date(command.capturedAt).getTime()
            if (capturedAt > lastPurge) {
              allCommands.push(command)
            }
          }

          cursor.continue()
        } else {
          resolve(allCommands)
        }
      }

      cursorRequest.onerror = () => resolve([])
    })
  }

  queueCommand(command: OfflineRailwayCommand): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) await this.promise
      const tx = this.db!.transaction(COMMAND_STORE, 'readwrite')
      const store = tx.objectStore(COMMAND_STORE)
      const request = store.add(command)
      request.onsuccess = () => resolve()
      request.onerror = (event) => reject(event.target?.error)
    })
  }

  updateCommandState(
    commandId: string,
    state: OfflineRailwayCommand['state'],
    evidence?: { localId: string; sha256: string },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) await this.promise
      const tx = this.db!.transaction(COMMAND_STORE, 'readwrite')
      const store = tx.objectStore(COMMAND_STORE)
      const getRequest = store.get(commandId)

      getRequest.onsuccess = async () => {
        const command = getRequest.result as OfflineRailwayCommand | undefined
        if (command) {
          command.state = state
          if (evidence) {
            command.evidence = evidence
          }
          const putRequest = store.put(command)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = (event) => reject(event.target?.error)
        } else {
          reject(new Error(`Command ${commandId} not found`))
        }
      }

      getRequest.onerror = (event) => reject(event.target?.error)
    })
  }

  // --- Assignment Store ---

  async getAssignment(assignmentId: string): Promise<OfflineAssignment | undefined> {
    if (!this.db) await this.promise
    const tx = this.db!.transaction(ASSIGNMENT_STORE, 'readonly')
    const store = tx.objectStore(ASSIGNMENT_STORE)
    const request = store.get(assignmentId)
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result as OfflineAssignment | undefined)
      request.onerror = () => resolve(undefined)
    })
  }

  async listAssignments(
    scope: 'user' | 'org' | 'div',
    userId?: string,
    organizationId?: string,
    divisionId?: string,
  ): Promise<OfflineAssignment[]> {
    if (!this.db) await this.promise
    const tx = this.db!.transaction(ASSIGNMENT_STORE, 'readonly')
    const store = tx.objectStore(ASSIGNMENT_STORE)

    return new Promise((resolve) => {
      const allAssignments: OfflineAssignment[] = []
      const cursorRequest = store.openCursor()

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBCursorResult).result
        if (cursor) {
          const assignment = cursor.value as OfflineAssignment

          // Apply scope filtering
          const matchesScope =
            scope === 'user'
              ? userId && assignment.userId === userId
              : scope === 'org'
              ? organizationId && assignment.organizationId === organizationId
              : scope === 'div'
              ? divisionId && assignment.divisionId === divisionId
              : true

          if (matchesScope) {
            const lastPurge = new Date(this.getState().lastPurgeAt).getTime()
            const capturedAt = new Date(assignment.capturedAt).getTime()
            if (capturedAt > lastPurge) {
              allAssignments.push(assignment)
            }
          }

          cursor.continue()
        } else {
          resolve(allAssignments)
        }
      }

      cursorRequest.onerror = () => resolve([])
    })
  }

  queueAssignment(assignment: OfflineAssignment): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) await this.promise
      const tx = this.db!.transaction(ASSIGNMENT_STORE, 'readwrite')
      const store = tx.objectStore(ASSIGNMENT_STORE)
      const request = store.add(assignment)
      request.onsuccess = () => resolve()
      request.onerror = (event) => reject(event.target?.error)
    })
  }

  updateAssignmentState(
    assignmentId: string,
    state: OfflineAssignment['status'],
    findings?: OfflineAssignment['findings'],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) await this.promise
      const tx = this.db!.transaction(ASSIGNMENT_STORE, 'readwrite')
      const store = tx.objectStore(ASSIGNMENT_STORE)
      const getRequest = store.get(assignmentId)

      getRequest.onsuccess = async () => {
        const assignment = getRequest.result as OfflineAssignment | undefined
        if (assignment) {
          assignment.status = state
          if (findings) {
            assignment.findings = findings
          }
          const putRequest = store.put(assignment)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = (event) => reject(event.target?.error)
        } else {
          reject(new Error(`Assignment ${assignmentId} not found`))
        }
      }

      getRequest.onerror = (event) => reject(event.target?.error)
    })
  }

  // --- State ---

  async getState(): Promise<OfflineDbState> {
    if (!this.db) await this.promise
    const tx = this.db!.transaction([
      COMMAND_STORE,
      ASSIGNMENT_STORE,
      SYNC_STORE,
    ], 'readonly')
    const commandStore = tx.objectStore(COMMAND_STORE)
    const assignmentStore = tx.objectStore(ASSIGNMENT_STORE)
    const syncStore = tx.objectStore(SYNC_STORE)

    const [commands, syncResults] = await Promise.all([
      new Promise<OfflineRailwayCommand[]>((resolve) => {
        const request = commandStore.openCursor()
        const results: OfflineRailwayCommand[] = []
        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBCursorResult).result
          if (cursor) {
            results.push(cursor.value as OfflineRailwayCommand)
            cursor.continue()
          } else {
            resolve(results)
          }
        }
      }),
      new Promise<Record<string, { state: string; serverVersion: number; error?: string }>>((resolve) => {
        const request = syncStore.openCursor()
        const results: Record<string, { state: string; serverVersion: number; error?: string }> = {}
        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBCursorResult).result
          if (cursor) {
            results[cursor.key as string] = cursor.value as {
              state: string
              serverVersion: number
              error?: string
            }
            cursor.continue()
          } else {
            resolve(results)
          }
        }
      }),
    ])

    return {
      commands,
      assignments: {}, // Would need separate read
      syncResults,
      lastPurgeAt: new Date().toISOString(),
      offlinePackMaxAgeHours: this.offlinePackMaxAgeHours,
    }
  }

  // --- Purge ---

  async purgeExpired(maxAgeHours?: number): Promise<PurgeResult> {
    if (!this.db) await this.promise
    const ageHours = maxAgeHours ?? this.offlinePackMaxAgeHours
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - ageHours)
    const cutoffStr = cutoff.toISOString()

    const purgedCommands: string[] = []
    const purgedAssignments: string[] = []
    const retainedUnsynced: string[] = []

    // Purge commands
    const commandTx = this.db!.transaction(COMMAND_STORE, 'readwrite')
    const commandStore = commandTx.objectStore(COMMAND_STORE)
    const allCommands: OfflineRailwayCommand[] = []

    return new Promise((resolve) => {
      const cursorRequest = commandStore.openCursor()
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBCursorResult).result
        if (cursor) {
          const command = cursor.value as OfflineRailwayCommand
          allCommands.push(command)
          cursor.continue()
        } else {
          // Now purge
          for (const command of allCommands) {
            if (new Date(command.capturedAt) < new Date(cutoffStr)) {
              if (command.type.startsWith('server:')) {
                commandStore.delete(command.commandId)
                purgedCommands.push(command.commandId)
              } else {
                retainedUnsynced.push(command.commandId)
              }
            }
          }

          // Purge assignments
          const assignmentTx = this.db!.transaction(ASSIGNMENT_STORE, 'readwrite')
          const assignmentStore = assignmentTx.objectStore(ASSIGNMENT_STORE)
          const allAssignments: OfflineAssignment[] = []

          const assignCursorRequest = assignmentStore.openCursor()
          assignCursorRequest.onsuccess = (assignEvent) => {
            const assignCursor = (assignEvent.target as IDBCursorResult).result
            if (assignCursor) {
              allAssignments.push(assignCursor.value as OfflineAssignment)
              assignCursor.continue()
            } else {
              for (const assignment of allAssignments) {
                if (new Date(assignment.capturedAt) < new Date(cutoffStr)) {
                  if (assignment.type.startsWith('server:')) {
                    assignmentStore.delete(assignment.assignmentId)
                    purgedAssignments.push(assignment.assignmentId)
                  } else {
                    retainedUnsynced.push(assignment.assignmentId)
                  }
                }
              }

              // Update last purge timestamp
              const syncTx = this.db!.transaction(SYNC_STORE, 'readwrite')
              const syncStore = syncTx.objectStore(SYNC_STORE)
              syncStore.put({
                lastPurgeAt: new Date().toISOString(),
              })

              commandTx.commit()
              assignmentTx.commit()
              syncTx.commit()

              resolve({
                purgedCommands,
                purgedAssignments,
                retainedUnsynced,
                message: `Purged ${purgedCommands.length} commands and ${purgedAssignments.length} assignments (retained ${retainedUnsynced.length} unsynchronized drafts)`,
              })
            }
          }
          assignCursorRequest.onerror = () => resolve({
            purgedCommands,
            purgedAssignments,
            retainedUnsynced: [],
            message: 'Error during purge',
          })
        }
      }
      assignCursorRequest.onerror = () => resolve({
        purgedCommands,
        purgedAssignments: [],
        retainedUnsynced: [],
        message: 'Error opening assignment cursor',
      })
    })
  }

  whenIdle(): Promise<void> {
    return Promise.resolve()
  }
}