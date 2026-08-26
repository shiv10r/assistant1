import { railwayRequest } from '../api/railwayApi'

export type CrowdRiskLevel = 'Normal' | 'Warning' | 'Critical'

export type CrowdObservation = {
  sourceEventId: string
  stationId: string
  zoneId: string
  count: number
  confidence: number
  recordedAt: string
}

export type CrowdAlert = {
  id: string
  stationZoneId: string
  level: CrowdRiskLevel
  isOpen: boolean
  raisedAt: string
  acknowledgedAt?: string
}

export const crowdApi = {
  observations: (stationId?: string) =>
    railwayRequest<CrowdObservation[]>(`/api/railway/crowd/observations${stationId ? `?stationId=${stationId}` : ''}`),
  submit: (obs: Omit<CrowdObservation, 'recordedAt'>) =>
    railwayRequest<{ accepted: boolean }>('/api/railway/crowd/observations', {
      method: 'POST',
      body: obs,
      idempotencyKey: `crowd-${obs.sourceEventId}`,
    }),
  alerts: () => railwayRequest<CrowdAlert[]>('/api/railway/crowd/alerts'),
  acknowledge: (alertId: string) =>
    railwayRequest<CrowdAlert>(`/api/railway/crowd/alerts/${alertId}/acknowledge`, { method: 'POST' }),
}