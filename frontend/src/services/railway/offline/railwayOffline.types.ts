export type OfflineRailwayCommand = {
  commandId: string
  idempotencyKey: string
  aggregateId: string
  expectedVersion: number
  type: string
  payload: unknown
  capturedAt: string
  evidence: readonly {
    localId: string
    sha256: string
  }
  state: 'pending' | 'syncing' | 'accepted' | 'rejected' | 'conflicted'
}

export type OfflineAssignment = {
  assignmentId: string
  runId: string
  userId: string
  organizationId: string
  divisionId: string
  status: 'pending' | 'in-progress' | 'syncing' | 'accepted' | 'rejected' | 'conflicted'
  capturedAt: string
  findings: readonly {
    itemId: string
    response: string
  }
  evidence: readonly {
    localId: string
    sha256: string
  }
  conflictInfo?: {
    localVersion: number
    serverVersion: number
    divergenceReason: string
  }
}

export type OfflineDbState = {
  commands: Record<string, OfflineRailwayCommand>
  assignments: Record<string, OfflineAssignment>
  syncResults: Record<string, {
    commandId: string
    state: 'accepted' | 'rejected' | 'conflicted'
    serverVersion: number
    error?: string
  }>
  lastPurgeAt: string
  offlinePackMaxAgeHours: number
}

export type SyncCommandResult = {
  commandId: string
  state: 'accepted' | 'rejected' | 'conflicted'
  authoritativeVersion: number
  error?: string
  evidence?: {
    localId: string
    sha256: string
    serverUrl?: string
  }
}

export type PurgeResult = {
  purgedCommands: string[]
  purgedAssignments: string[]
  retainedUnsynced: string[]
  message: string
}

export interface RailwayOfflineDb {
  getCommand: (commandId: string) => OfflineRailwayCommand | undefined
  listCommands: (scope: 'user' | 'org' | 'div', userId?: string, organizationId?: string, divisionId?: string) => OfflineRailwayCommand[]
  queueCommand: (command: OfflineRailwayCommand) => void
  updateCommandState: (commandId: string, state: OfflineRailwayCommand['state'], evidence?: { localId: string; sha256: string }) => void
  getAssignment: (assignmentId: string) => OfflineAssignment | undefined
  listAssignments: (scope: 'user' | 'org' | 'div', userId?: string, organizationId?: string, divisionId?: string) => OfflineAssignment[]
  queueAssignment: (assignment: OfflineAssignment) => void
  updateAssignmentState: (assignmentId: string, state: OfflineAssignment['status'], findings?: OfflineAssignment['findings']) => void
  getState: () => OfflineDbState
  purgeExpired: (maxAgeHours: number) => PurgeResult
  whenIdle: () => Promise<void>
}