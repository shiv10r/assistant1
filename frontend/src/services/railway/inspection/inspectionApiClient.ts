import { RailwayOfflineSync } from './railwaySync'
import type { RailwayInspectionApi, InspectionRun, Defect, InspectionEvent } from '../inspection/inspection.types'

/**
 * RailwayInspectionApiClient - Frontend API client for inspection workflows
 * Extends the base railwayRequest with inspection-specific methods
 * and integrates with the offline database for sync support.
 */
export class RailwayInspectionApiClient implements RailwayInspectionApi {
  private sync: RailwayOfflineSync
  private organizationId: string
  private divisionId: string
  private authToken: string | null

  constructor(
    organizationId: string,
    divisionId: string,
    authToken: string | null = null,
  ) {
    this.organizationId = organizationId
    this.divisionId = divisionId
    this.authToken = authToken
    this.sync = new RailwayOfflineSync()
  }

  // --- Template operations ---

  async getTemplates(): Promise<InspectionTemplate[]> {
    const { data, error } = await railwayRequest<InspectionTemplate[]>(
      '/api/railway/inspections/templates',
      {
        method: 'GET',
        signal: this.getSignal(),
        headers: this.getHeaders(),
      },
    )

    if (error) {
      // Fallback to offline cache if available
      const cached = this.sync.getState().commands
      throw error
    }

    return data ?? []
  }

  // --- Inspection Run operations ---

  async createRun(
    templateVersion: string,
    stationId: string,
  ): Promise<InspectionRun> {
    const { data, error } = await railwayRequest<InspectionRun>(
      '/api/railway/inspections/runs',
      {
        method: 'POST',
        body: {
          templateVersion,
          stationId,
          organizationId: this.organizationId,
          divisionId: this.divisionId,
        },
        idempotencyKey: `inspect-run-${Date.now()}`,
        signal: this.getSignal(),
        headers: this.getHeaders(),
      },
    )

    if (error) throw error
    if (data) {
      // Queue the run creation in offline DB for sync resilience
      this.sync.queueCommand({
        commandId: data.id,
        idempotencyKey: `inspect-run-${Date.now()}`,
        aggregateId: data.id,
        expectedVersion: 1,
        type: 'inspection.create-run',
        payload: {
          templateVersion,
          stationId,
          organizationId: this.organizationId,
          divisionId: this.divisionId,
        },
        capturedAt: new Date().toISOString(),
      })
    }

    return data ?? { id: '', templateVersion: '', status: 'Draft', startedAt: new Date().toISOString(), assignedInspector: '', stationId: '', expectedVersion: 0, actualVersion: 0, findings: [], defects: [], amendments: [], createdBy: '', organizationId: this.organizationId, divisionId: this.divisionId, }
  }

  async submitFinding(
    runId: string,
    itemId: string,
    response: string,
    evidence?: { localId: string; sha256: string },
  ): Promise<InspectionRun> {
    const { data, error } = await railwayRequest<InspectionRun>(
      `/api/railway/inspections/runs/${runId}/findings`,
      {
        method: 'POST',
        body: {
          runId,
          itemId,
          response,
          organizationId: this.organizationId,
          divisionId: this.divisionId,
          evidence,
        },
        idempotencyKey: `finding-${runId}-${itemId}-${Date.now()}`,
        signal: this.getSignal(),
        headers: this.getHeaders(),
      },
    )

    if (error) throw error
    if (data) {
      this.sync.queueCommand({
        commandId: runId,
        idempotencyKey: `finding-${runId}-${itemId}-${Date.now()}`,
        aggregateId: runId,
        expectedVersion: 1,
        type: 'inspection.submit-finding',
        payload: { runId, itemId, response, evidence },
        capturedAt: new Date().toISOString(),
      })
    }

    return data ?? { id: runId, templateVersion: '', status: 'Draft', startedAt: new Date().toISOString(), assignedInspector: '', stationId: '', expectedVersion: 0, actualVersion: 0, findings: [], defects: [], amendments: [], createdBy: '', organizationId: this.organizationId, divisionId: this.divisionId, }
  }

  async raiseDefect(
    runId: string,
    description: string,
    severity: Defect['severity'],
    evidence?: { localId: string; sha256: string },
  ): Promise<Defect> {
    const { data, error } = await railwayRequest<Defect>(
      `/api/railway/inspections/runs/${runId}/defects`,
      {
        method: 'POST',
        body: {
          runId,
          description,
          severity,
          organizationId: this.organizationId,
          divisionId: this.divisionId,
          evidence,
        },
        idempotencyKey: `defect-${runId}-${Date.now()}`,
        signal: this.getSignal(),
        headers: this.getHeaders(),
      },
    )

    if (error) throw error
    if (data) {
      this.sync.queueCommand({
        commandId: runId,
        idempotencyKey: `defect-${runId}-${Date.now()}`,
        aggregateId: runId,
        expectedVersion: 1,
        type: 'inspection.raise-defect',
        payload: { runId, description, severity, evidence },
        capturedAt: new Date().toISOString(),
      })
    }

    return data ?? {
      id: '',
      inspectionRunId: runId,
      description,
      severity,
      status: 'Open',
      raisedAt: new Date().toISOString(),
      resolvedAt: undefined,
      assignedWorkOrderId: undefined,
      evidence: [],
    }
  }

  async resolveDefect(
    defectId: string,
    decision: 'Accept' | 'Reject',
    reason?: string,
  ): Promise<Defect> {
    const { data, error } = await railwayRequest<Defect>(
      `/api/railway/defects/${defectId}`,
      {
        method: 'PATCH',
        body: {
          defectId,
          decision,
          reason,
          organizationId: this.organizationId,
          divisionId: this.divisionId,
        },
        idempotencyKey: `defect-resolve-${defectId}-${Date.now()}`,
        signal: this.getSignal(),
        headers: this.getHeaders(),
      },
    )

    if (error) throw error
    if (data) {
      this.sync.queueCommand({
        commandId: defectId,
        idempotencyKey: `defect-resolve-${defectId}-${Date.now()}`,
        aggregateId: defectId,
        expectedVersion: 1,
        type: 'inspection.resolve-defect',
        payload: { defectId, decision, reason },
        capturedAt: new Date().toISOString(),
      })
    }

    return data ?? {
      id: defectId,
      inspectionRunId: '',
      description: '',
      severity: 'Low',
      status: 'Open',
      raisedAt: new Date().toISOString(),
      resolvedAt: undefined,
      assignedWorkOrderId: undefined,
      evidence: [],
    }
  }

  // --- Work Order operations ---

  async createWorkOrder(
    sourceId: string,
    priority: string,
    assignedTo: string,
  ): Promise<{ workOrderId: string }> {
    const { data, error } = await railwayRequest<{ workOrderId: string }>(
      '/api/railway/work-orders',
      {
        method: 'POST',
        body: {
          sourceId,
          priority,
          assignedTo,
          organizationId: this.organizationId,
          divisionId: this.divisionId,
        },
        idempotencyKey: `work-order-${Date.now()}`,
        signal: this.getSignal(),
        headers: this.getHeaders(),
      },
    )

    if (error) throw error
    if (data) {
      this.sync.queueCommand({
        commandId: data.workOrderId,
        idempotencyKey: `work-order-${Date.now()}`,
        aggregateId: data.workOrderId,
        expectedVersion: 1,
        type: 'work-order.create',
        payload: { sourceId, priority, assignedTo, organizationId: this.organizationId, divisionId: this.divisionId },
        capturedAt: new Date().toISOString(),
      })
    }

    return data ?? { workOrderId: '' }
  }

  async listDefects(
    status?: Defect['status'],
  ): Promise<Defect[]> {
    const { data, error } = await railwayRequest<Defect[]>(
      '/api/railway/defects',
      {
        method: 'GET',
        signal: this.getSignal(),
        headers: this.getHeaders(),
        query: status ? { status } : undefined,
      },
    )

    if (error) throw error
    return data ?? []
  }

  // --- Event/realtime subscriptions ---

  subscribeToRun(runId: string, onEvent: (event: InspectionEvent) => void): () => void {
    // In a full implementation, this would use SignalR or WebSocket
    // For now, return an unsubscribe function
    // The frontend hook must re-fetch authoritative queries after reconnect
    return () => {
      // Cleanup subscription
    }
  }

  // --- Signal helper ---

  private getSignal(): AbortSignal {
    // In a full implementation, this would tie into an AbortController
    // managed at the component level for cancellation on unmount
    const controller = new AbortController()
    return controller.signal
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    // Organization/division scoping headers
    if (this.organizationId) {
      headers['X-Organization'] = this.organizationId
    }
    if (this.divisionId) {
      headers['X-Division'] = this.divisionId
    }

    return headers
  }
}