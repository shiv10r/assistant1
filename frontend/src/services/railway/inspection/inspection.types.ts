export type InspectionTemplate = {
  id: string
  version: string
  name: string
  description: string
  severityLevels: readonly {
    id: string
    name: string
    color: string
    maxFindings: number
  }[]
  requiredEvidenceTypes: readonly string[]
  checklistItems: readonly {
    id: string
    label: string
    category: 'measurement' | 'visual' | 'equipment' | 'geolocation'
    required: boolean
    measurementLimits?: {
      min: number
      max: number
      unit: string
    }
  }[]
  locationExceptions?: {
    id: string
    label: string
    allowed: boolean
    description: string
  }
}

export type InspectionRun = {
  id: string
  templateVersion: string
  status: 'Draft' | 'Submitted' | 'Accepted' | 'Rejected' | 'Amended'
  startedAt: string
  completedAt?: string
  assignedInspector: string
  stationId: string
  expectedVersion: number
  actualVersion: number
  findings: readonly {
    itemId: string
    response: string
    finding:
      | { type: 'pass'; noted: boolean }
      | { type: 'fail'; finding: string; measurement?: number; unit?: string }
      | { type: 'na'; reason: string }
  }[]
  defects?: readonly {
    id: string
    description: string
    severity: 'Low' | 'Medium' | 'High' | 'Critical'
    status: 'Open' | 'Triaged' | 'WorkPlanned' | 'Resolved' | 'Verified' | 'Closed' | 'Rejected'
    assignedWorkOrderId?: string
  }[]
  amendments: readonly {
    id: string
    changedBy: string
    changedAt: string
    description: string
    changedFields: readonly string[]
  }[]
  createdBy: string
  organizationId: string
  divisionId: string
}

export type Defect = {
  id: string
  inspectionRunId: string
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Triaged' | 'WorkPlanned' | 'Resolved' | 'Verified' | 'Closed' | 'Rejected'
  raisedAt: string
  resolvedAt?: string
  assignedWorkOrderId?: string
  evidence: readonly {
    localId: string
    sha256: string
    uploadedAt: string
    url?: string
  }
  review?: {
    reviewedBy: string
    reviewedAt: string
    decision: 'Accept' | 'Reject'
    reason?: string
  }
}

export type InspectionEvent =
  | { type: 'InspectionStarted'; runId: string; timestamp: string }
  | { type: 'FindingSubmitted'; runId: string; itemId: string; response: string; timestamp: string }
  | { type: 'DefectRaised'; runId: string; defectId: string; severity: Defect['severity']; timestamp: string }
  | { type: 'DefectResolved'; runId: string; defectId: string; timestamp: string }
  | { type: 'WorkOrderCreated'; runId: string; workOrderId: string; timestamp: string }
  | { type: 'WorkOrderCompleted'; runId: string; workOrderId: string; timestamp: string }
  | { type: 'CriticalDefectRaised'; runId: string; defectId: string; timestamp: string }
  | { type: 'InspectionAmended'; runId: string; amendmentId: string; timestamp: string }

export type RailwayInspectionApi = {
  getTemplates: (orgId: string, divId: string) => Promise<InspectionTemplate[]>
  createRun: (orgId: string, divId: string, templateVersion: string, stationId: string) => Promise<InspectionRun>
  submitFinding: (runId: string, itemId: string, response: string, evidence?: { localId: string; sha256: string }) => Promise<InspectionRun>
  raiseDefect: (runId: string, description: string, severity: Defect['severity'], evidence?: { localId: string; sha256: string }) => Promise<Defect>
  resolveDefect: (defectId: string, decision: 'Accept' | 'Reject', reason?: string) => Promise<Defect>
  createWorkOrder: (sourceId: string, priority: string, assignedTo: string) => Promise<{ workOrderId: string }>
  listDefects: (organizationId: string, divisionId: string, status?: Defect['status']) => Promise<Defect[]>
}