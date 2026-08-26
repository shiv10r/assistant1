import { railwayRequest } from '../api/railwayApi'

export type CrowdRiskLevel = 'Normal' | 'Warning' | 'Critical'

export type CrowdObservation = {
  id: string
  sourceEventId: string
  stationId: string
  stationZoneId: string
  sourceId: string
  count: number
  inflow?: number
  outflow?: number
  confidence: number
  qualityFlags: string
  windowStart: string
  windowEnd: string
}

export type CrowdAlert = {
  id: string
  stationId: string
  stationZoneId: string
  level: CrowdRiskLevel
  isOpen: boolean
  raisedAt: string
  acknowledgedAt?: string
  version: number
}

export type CrowdSource = {
  id: string
  divisionId: string
  stationId: string
  stationZoneId: string
  name: string
  adapterType: string
  enabled: boolean
  lastObservationAt?: string
  previousSecretValidUntil?: string
  version: number
}

export type CrowdIncident = {
  id: string
  divisionId: string
  stationId: string
  title: string
  status: string
  openedAt: string
  responseLog: string
  closedAt?: string
  version: number
}

export type SubmitCrowdObservation = {
  divisionId: string
  sourceId: string
  sourceEventId: string
  windowStart: string
  windowEnd: string
  count: number
  inflow?: number
  outflow?: number
  confidence: number
  qualityFlags: string[]
}

export const crowdApi = {
  observations: (stationId?: string) => railwayRequest<CrowdObservation[]>(`/api/railway/crowd/observations${stationId ? `?stationId=${stationId}` : ''}`),
  submit: (observation: SubmitCrowdObservation) => railwayRequest<{ id: string; duplicate?: boolean }>('/api/railway/crowd/observations', {
    method: 'POST', body: observation, idempotencyKey: `crowd-${observation.sourceEventId}`,
  }),
  alerts: () => railwayRequest<CrowdAlert[]>('/api/railway/crowd/alerts'),
  acknowledge: (alertId: string, version: number) => railwayRequest<void>(`/api/railway/crowd/alerts/${alertId}/acknowledge`, { method: 'POST', expectedVersion: version }),
  sources: () => railwayRequest<CrowdSource[]>('/api/railway/crowd/sources'),
  createSource: (source: Pick<CrowdSource, 'divisionId' | 'stationId' | 'stationZoneId' | 'name' | 'adapterType'>) =>
    railwayRequest<{ sourceId: string; signingSecret: string }>('/api/railway/crowd/sources', { method: 'POST', body: source }),
  rotateCredential: (sourceId: string) => railwayRequest<{ sourceId: string; signingSecret: string }>(`/api/railway/crowd/sources/${sourceId}/rotate-credential`, { method: 'POST' }),
  incidents: () => railwayRequest<CrowdIncident[]>('/api/railway/crowd/incidents'),
  openIncident: (divisionId: string, stationId: string, title: string) =>
    railwayRequest<{ id: string }>('/api/railway/crowd/incidents', { method: 'POST', body: { divisionId, stationId, title } }),
  recordResponse: (incidentId: string, action: string) => railwayRequest<void>(`/api/railway/crowd/incidents/${incidentId}/responses`, { method: 'POST', body: { action } }),
  closeIncident: (incidentId: string) => railwayRequest<void>(`/api/railway/crowd/incidents/${incidentId}/close`, { method: 'POST' }),
  createIncidentWorkOrder: (incidentId: string, priority: string) => railwayRequest<{ workOrderId: string }>(`/api/railway/crowd/incidents/${incidentId}/work-order`, { method: 'POST', body: { priority } }),
  quarantine: () => railwayRequest<Array<{ id: string; sourceId: string; reason: string; payloadHash: string; createdAt: string }>>('/api/railway/crowd/ingestion/quarantine'),
}
