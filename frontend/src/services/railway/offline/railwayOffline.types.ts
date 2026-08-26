export type RailwayOfflineScope = { userId: string; organizationId: string }

export type OfflineRailwayCommand = {
  commandId: string
  idempotencyKey: string
  aggregateId: string
  expectedVersion: number
  type: string
  payload: unknown
  capturedAt: string
  evidence: { localId: string; sha256: string }[]
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
  findings: { itemId: string; response: string }[]
  evidence: { localId: string; sha256: string }[]
  conflictInfo?: {
    localVersion: number
    serverVersion: number
    divergenceReason: string
  }
}

export type OfflineDbState = {
  commands: Record<string, OfflineRailwayCommand>
  assignments: Record<string, OfflineAssignment>
  syncResults: Record<
    string,
    { commandId: string; state: 'accepted' | 'rejected' | 'conflicted'; serverVersion: number; error?: string }
  >
  lastPurgeAt: string
  offlinePackMaxAgeHours: number
}

export type PurgeResult = {
  purgedCommands: string[]
  purgedAssignments: string[]
  retainedUnsynced: string[]
  message: string
}
