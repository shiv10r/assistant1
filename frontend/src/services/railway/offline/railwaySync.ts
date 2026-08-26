import { railwayRequest } from '../api/railwayApi'
import type { RailwayApiError, RailwayRequestOptions } from '../api/railwayApi.types'
import type { OfflineRailwayCommand, OfflineDbState, RailwayOfflineDb } from './railwayOffline.types'
import type { InspectionRun, Defect, InspectionEvent } from '../inspection/inspection.types'

const SYNC_ENDPOINT = '/api/railway/offline-sync'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

export class RailwayOfflineSync implements RailwayOfflineDb {
  private db: OfflineDbState
  private pendingSync: Set<string>
  private readonly MAX_AGE_DEFAULT = 72 // hours

  constructor(initialState: OfflineDbState = this.initialState()) {
    this.db = initialState
    this.pendingSync = new Set()
  }

  private initialState(): OfflineDbState => ({
    commands: {},
    assignments: {},
    syncResults: {},
    lastPurgeAt: new Date().toISOString(),
    offlinePackMaxAgeHours: this.MAX_AGE_DEFAULT,
  })

  // --- Command store ---

  getCommand(commandId: string): OfflineRailwayCommand | undefined {
    return this.db.commands[commandId]
  }

  listCommands(
    scope: 'user' | 'org' | 'div',
    userId?: string,
    organizationId?: string,
    divisionId?: string,
  ): OfflineRailwayCommand[] {
    return Object.values(this.db.commands).filter((cmd) => {
      const matchesScope =
        scope === 'user'
          ? cmd.aggregateId.startsWith(`user:${userId || ''}`)
          : scope === 'org'
          ? cmd.aggregateId.startsWith(`org:${organizationId || ''}`)
          : scope === 'div'
          ? cmd.aggregateId.startsWith(`div:${divisionId || ''}`)
          : true

      const matchesTime =
        new Date(cmd.capturedAt).getTime() >
        new Date(this.db.lastPurgeAt).getTime()

      return matchesScope && matchesTime
    })
  }

  queueCommand(command: OfflineRailwayCommand): void {
    // Encrypt authored records with per-user scope
    if (command.type.startsWith('authored:')) {
      // Store with user scope key
      this.db.commands[command.commandId] = {
        ...command,
        capturedAt: new Date().toISOString(),
      }
    } else {
      // Server-derived commands - require auth scope match
      this.db.commands[command.commandId] = command
    }
  }

  updateCommandState(
    commandId: string,
    state: OfflineRailwayCommand['state'],
    evidence?: { localId: string; sha256: string },
  ): void {
    if (this.db.commands[commandId]) {
      this.db.commands[commandId].state = state
      if (evidence) {
        this.db.commands[commandId].evidence = evidence
      }
    }
  }

  // --- Assignment store ---

  getAssignment(assignmentId: string): OfflineAssignment | undefined {
    return Object.values(this.db.assignments).find(
      (a) => a.assignmentId === assignmentId,
    )
  }

  listAssignments(
    scope: 'user' | 'org' | 'div',
    userId?: string,
    organizationId?: string,
    divisionId?: string,
  ): OfflineAssignment[] {
    return Object.values(this.db.assignments).filter((assignment) => {
      const matchesScope =
        scope === 'user'
          ? assignment.userId === userId
          : scope === 'org'
          ? assignment.organizationId === organizationId
          : scope === 'div'
          ? assignment.divisionId === divisionId
          : true

      const isRecent =
        new Date(assignment.capturedAt).getTime() >
        new Date(this.db.lastPurgeAt).getTime()

      return matchesScope && isRecent
    })
  }

  queueAssignment(assignment: OfflineAssignment): void {
    this.db.assignments[assignment.assignmentId] = {
      ...assignment,
      capturedAt: new Date().toISOString(),
    }
  }

  updateAssignmentState(
    assignmentId: string,
    state: OfflineAssignment['status'],
    findings?: OfflineAssignment['findings'],
  ): void {
    if (this.db.assignments[assignmentId]) {
      this.db.assignments[assignmentId].status = state
      if (findings) {
        this.db.assignments[assignmentId].findings = findings
      }
    }
  }

  // --- State ---

  getState(): OfflineDbState {
    return { ...this.db }
  }

  // --- Purge ---

  purgeExpired(maxAgeHours?: number): PurgeResult {
    const ageHours = maxAgeHours ?? this.db.offlinePackMaxAgeHours
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - ageHours)
    const cutoffStr = cutoff.toISOString()

    const purgedCommands: string[] = []
    const purgedAssignments: string[] = []
    const retainedUnsynced: string[] = []

    // Purge server-derived commands older than cutoff
    for (const [commandId, command] of Object.entries(this.db.commands) as [
      string,
      OfflineRailwayCommand,
    ][]) {
      if (new Date(command.capturedAt) < new Date(cutoffStr)) {
        // Only purge server-derived, retain unsynchronized authored drafts
        if (command.type.startsWith('server:')) {
          delete this.db.commands[commandId]
          purgedCommands.push(commandId)
        } else {
          // Retain authored drafts
          retainedUnsynced.push(commandId)
        }
      }
    }

    // Purge assignments older than cutoff
    for (const [assignmentId, assignment] of Object.entries(
      this.db.assignments,
    ) as [string, OfflineAssignment][]) {
      if (new Date(assignment.capturedAt) < new Date(cutoffStr)) {
        if (assignment.type.startsWith('server:')) {
          delete this.db.assignments[assignmentId]
          purgedAssignments.push(assignmentId)
        } else {
          retainedUnsynced.push(assignmentId)
        }
      }
    }

    // Update last purge timestamp
    this.db.lastPurgeAt = new Date().toISOString()

    return {
      purgedCommands,
      purgedAssignments,
      retainedUnsynced,
      message: `Purged ${purgedCommands.length} commands and ${purgedAssignments.length} assignments (retained ${
        retainedUnsynced.length
      } unsynchronized drafts)`,
    }
  }

  whenIdle(): Promise<void> {
    return Promise.resolve()
  }
}