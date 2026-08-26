import type { OfflineDbState, OfflineRailwayCommand, PurgeResult } from './railwayOffline.types'

const MAX_AGE_DEFAULT = 72 // hours

/**
 * In-memory implementation of the offline command queue boundary.
 * The IndexedDB-backed variant lives in railwayOfflineDb.ts; both share
 * this contract so screens and sync logic are storage-agnostic.
 */
export class RailwayOfflineQueue {
  private state: OfflineDbState

  constructor(initial?: Partial<OfflineDbState>) {
    this.state = {
      commands: initial?.commands ?? {},
      assignments: initial?.assignments ?? {},
      syncResults: initial?.syncResults ?? {},
      lastPurgeAt: initial?.lastPurgeAt ?? new Date().toISOString(),
      offlinePackMaxAgeHours: initial?.offlinePackMaxAgeHours ?? MAX_AGE_DEFAULT,
    }
  }

  getCommand(commandId: string): OfflineRailwayCommand | undefined {
    return this.state.commands[commandId]
  }

  listCommands(): OfflineRailwayCommand[] {
    return Object.values(this.state.commands)
  }

  queueCommand(command: OfflineRailwayCommand): void {
    this.state.commands[command.commandId] = { ...command }
  }

  updateCommandState(
    commandId: string,
    newState: OfflineRailwayCommand['state'],
  ): void {
    const existing = this.state.commands[commandId]
    if (existing) {
      this.state.commands[commandId] = { ...existing, state: newState }
    }
  }

  getState(): OfflineDbState {
    return { ...this.state, commands: { ...this.state.commands } }
  }

  /**
   * Purge expired server-derived data. Unsynchronized user-authored work is
   * retained until successful sync or explicit discard.
   */
  purgeExpired(maxAgeHours?: number): PurgeResult {
    const hours = maxAgeHours ?? this.state.offlinePackMaxAgeHours
    const cutoff = Date.now() - hours * 3_600_000

    const purgedCommands: string[] = []
    const purgedAssignments: string[] = []
    const retainedUnsynced: string[] = []

    for (const [id, cmd] of Object.entries(this.state.commands)) {
      if (new Date(cmd.capturedAt).getTime() < cutoff) {
        if (cmd.type.startsWith('server:')) {
          delete this.state.commands[id]
          purgedCommands.push(id)
        } else if (cmd.state === 'pending' || cmd.state === 'rejected' || cmd.state === 'conflicted') {
          retainedUnsynced.push(id)
        } else {
          delete this.state.commands[id]
          purgedCommands.push(id)
        }
      }
    }

    for (const [id, assignment] of Object.entries(this.state.assignments)) {
      if (new Date(assignment.capturedAt).getTime() < cutoff && !assignment.assignmentId.startsWith('authored:')) {
        delete this.state.assignments[id]
        purgedAssignments.push(id)
      }
    }

    this.state.lastPurgeAt = new Date().toISOString()

    return {
      purgedCommands,
      purgedAssignments,
      retainedUnsynced,
      message:
        `Purged ${purgedCommands.length} commands and ${purgedAssignments.length} assignments; ` +
        `retained ${retainedUnsynced.length} unsynchronized drafts`,
    }
  }

  async whenIdle(): Promise<void> {
    await Promise.resolve()
  }
}
