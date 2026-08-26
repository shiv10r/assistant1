/**
 * Railway API contract reference (development mock).
 *
 * Documents the expected shape of VSRSystemsBackend Railway endpoints until
 * `npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json`
 * can run against a real exported OpenAPI schema. Data-only: no type-level coupling.
 */

export const RAILWAY_CAPABILITIES_EXAMPLE = {
  railwayEnabled: true,
  inspectionEnabled: true,
  maintenanceEnabled: false,
  crowdEnabled: false,
  offlinePackMaxAgeHours: 72,
  maxEvidenceBytes: 5242880,
  allowedEvidenceTypes: ['image/jpeg', 'image/png', 'application/pdf'],
} as const

export const OFFLINE_SYNC_REQUEST_EXAMPLE = {
  idempotencyKey: 'sync-2026-08-26-user-a',
  commands: [
    {
      commandId: 'cmd-1',
      type: 'inspection.submit',
      payload: { runId: 'run-1' },
      expectedVersion: 3,
    },
  ],
}

export const OFFLINE_SYNC_RESPONSE_EXAMPLE = {
  accepted: ['cmd-1'],
  rejected: [],
  conflicted: [],
  total: 1,
}

/** Endpoint inventory consumed by check-railway-api.mjs */
export const RAILWAY_ENDPOINTS = [
  { method: 'GET', path: '/api/railway/capabilities' },
  { method: 'GET', path: '/api/railway/inspections' },
  { method: 'POST', path: '/api/railway/inspections' },
  { method: 'POST', path: '/api/railway/inspections/{runId}/findings' },
  { method: 'POST', path: '/api/railway/inspections/{runId}/defects' },
  { method: 'GET', path: '/api/railway/defects' },
  { method: 'PATCH', path: '/api/railway/defects/{defectId}' },
  { method: 'GET', path: '/api/railway/work-orders' },
  { method: 'POST', path: '/api/railway/work-orders' },
  { method: 'PATCH', path: '/api/railway/work-orders/{orderId}/approve' },
  { method: 'PATCH', path: '/api/railway/work-orders/{orderId}/complete' },
  { method: 'GET', path: '/api/railway/maintenance/plans' },
  { method: 'POST', path: '/api/railway/maintenance/plans' },
  { method: 'POST', path: '/api/railway/maintenance/plans/{planId}/generate' },
  { method: 'GET', path: '/api/railway/crowd/observations' },
  { method: 'POST', path: '/api/railway/crowd/observations' },
  { method: 'GET', path: '/api/railway/crowd/alerts' },
  { method: 'POST', path: '/api/railway/crowd/alerts/{alertId}/acknowledge' },
  { method: 'GET', path: '/api/railway/crowd/incidents' },
  { method: 'POST', path: '/api/railway/crowd/incidents' },
  { method: 'POST', path: '/api/railway/crowd/ingestion/batches' },
  { method: 'POST', path: '/api/railway/offline-sync' },
] as const
