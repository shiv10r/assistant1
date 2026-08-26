import { railwayRequest } from '../api/railwayApi'
import type {
  Defect,
  InspectionRun,
} from './inspection.types'

type InspectionTemplateLite = { id: string; version: string; name: string }

/**
 * Frontend API client for inspection workflows. Online-first; offline queueing
 * is layered through the shared offline command boundary (railwaySync.ts).
 */
export class RailwayInspectionApiClient {
  private organizationId: string
  private divisionId: string

  constructor(organizationId: string, divisionId: string) {
    this.organizationId = organizationId
    this.divisionId = divisionId
  }

  async getTemplates(): Promise<InspectionTemplateLite[]> {
    const { data, error } = await railwayRequest<InspectionTemplateLite[]>(
      `/api/railway/inspections/templates?organizationId=${this.organizationId}&divisionId=${this.divisionId}`,
    )
    if (error) throw error
    return data ?? []
  }

  async createRun(templateVersion: string, stationId: string): Promise<InspectionRun> {
    const { data, error } = await railwayRequest<InspectionRun>(
      '/api/railway/inspections',
      {
        method: 'POST',
        body: { templateVersion, stationId },
        idempotencyKey: `run-${templateVersion}-${stationId}-${Date.now()}`,
      },
    )
    if (error) throw error
    return (
      data ?? {
        id: '',
        templateVersion,
        status: 'Draft',
        startedAt: new Date().toISOString(),
        assignedInspector: '',
        stationId,
        expectedVersion: 1,
        actualVersion: 0,
        findings: [],
        amendments: [],
        createdBy: '',
        organizationId: this.organizationId,
        divisionId: this.divisionId,
      }
    )
  }

  async submitFinding(runId: string, itemId: string, response: string): Promise<InspectionRun> {
    const { data, error } = await railwayRequest<InspectionRun>(
      `/api/railway/inspections/${runId}/findings`,
      {
        method: 'POST',
        body: { itemId, response },
        idempotencyKey: `finding-${runId}-${itemId}`,
      },
    )
    if (error) throw error
    return data as InspectionRun
  }

  async raiseDefect(
    runId: string,
    description: string,
    severity: Defect['severity'],
  ): Promise<Defect> {
    const { data, error } = await railwayRequest<Defect>(
      `/api/railway/inspections/${runId}/defects`,
      {
        method: 'POST',
        body: { description, severity },
        idempotencyKey: `defect-${runId}-${Date.now()}`,
      },
    )
    if (error) throw error
    return data as Defect
  }

  async resolveDefect(
    defectId: string,
    decision: 'Accept' | 'Reject',
    reason?: string,
  ): Promise<Defect> {
    const { data, error } = await railwayRequest<Defect>(`/api/railway/defects/${defectId}`, {
      method: 'PATCH',
      body: { decision, reason },
    })
    if (error) throw error
    return data as Defect
  }

  async createWorkOrder(
    sourceId: string,
    priority: string,
  ): Promise<{ workOrderId: string }> {
    const { data, error } = await railwayRequest<{ workOrderId: string }>(
      '/api/railway/work-orders',
      {
        method: 'POST',
        body: { sourceId, sourceType: 'Defect', priority },
        idempotencyKey: `wo-${sourceId}`,
      },
    )
    if (error) throw error
    return data ?? { workOrderId: '' }
  }

  async listDefects(status?: Defect['status']): Promise<Defect[]> {
    const query = status ? `?status=${status}` : ''
    const { data, error } = await railwayRequest<Defect[]>(`/api/railway/defects${query}`)
    if (error) throw error
    return data ?? []
  }
}
