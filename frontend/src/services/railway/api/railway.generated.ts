// Generated from openapi/railway.json. Do not edit manually.

export type CreateDefectRequest = { "description"?: string | null; "severity"?: DefectSeverity }

export type CreateInspectionRunRequest = { "divisionId"?: string }

export type ProblemDetails = { "type"?: string | null; "title"?: string | null; "status"?: number | null; "detail"?: string | null; "instance"?: string | null }

export type DefectInputDto = { "description"?: string | null; "severity"?: DefectSeverity }

export type ResolveDefectRequest = { "accepted"?: boolean; "reason"?: string | null }

export type SubmitFindingRequest = { "itemId"?: string | null; "response"?: string | null }

export type DefectSeverity = 0 | 1 | 2 | 3

export type CompleteRequest = { "reason"?: string | null }

export type CreatePlanRequest = { "name"?: string | null; "description"?: string | null; "slaDays"?: number }

export type CreateWorkOrderRequest = { "sourceId"?: string; "sourceType"?: string | null; "priority"?: string | null }

export type IncidentRequest = { "stationId"?: string; "title"?: string | null }

export type IngestBatchRequest = { "sourceId"?: string; "nonce"?: string | null; "signature"?: string | null; "observations"?: readonly (ObservationRequest)[] | null }

export type ObservationRequest = { "sourceEventId"?: string | null; "stationId"?: string; "zoneId"?: string; "count"?: number; "confidence"?: number }

export type RailwayCapabilities = { "organizationId"?: string; "railwayEnabled"?: boolean; "inspectionEnabled"?: boolean; "maintenanceEnabled"?: boolean; "crowdEnabled"?: boolean; "liveCrowdAdaptersEnabled"?: boolean; "aiEnabled"?: boolean; "offlinePackMaxAgeHours"?: number; "permissions"?: readonly (string)[] | null }

export type RailwayOperationId = "railway.railwaycapabilities.get" | "railway.railwaycrowd.observations" | "railway.railwaycrowd.submitobservation" | "railway.railwaycrowd.alerts" | "railway.railwaycrowd.acknowledge" | "railway.railwaycrowd.sources" | "railway.railwaycrowd.incidents" | "railway.railwaycrowd.openincident" | "railway.railwaycrowdingestion.ingestbatch" | "railway.railwaycrowdingestion.quarantine" | "railway.railwaydefects.list" | "railway.railwaydefects.create" | "railway.railwaydefects.resolve" | "railway.railwayinspections.createrun" | "railway.railwayinspections.submitfinding" | "railway.railwayinspections.raisedefect" | "railway.railwaymaintenanceplans.list" | "railway.railwaymaintenanceplans.createplan" | "railway.railwaymaintenanceplans.generatefromplan" | "railway.railwayworkorders.list" | "railway.railwayworkorders.create" | "railway.railwayworkorders.approve" | "railway.railwayworkorders.complete"

export const railwayOperations = {
  "railway.railwaycapabilities.get": { method: "GET", path: "/api/railway/capabilities" },
  "railway.railwaycrowd.acknowledge": { method: "POST", path: "/api/railway/crowd/alerts/{alertId}/acknowledge" },
  "railway.railwaycrowd.alerts": { method: "GET", path: "/api/railway/crowd/alerts" },
  "railway.railwaycrowd.incidents": { method: "GET", path: "/api/railway/crowd/incidents" },
  "railway.railwaycrowd.observations": { method: "GET", path: "/api/railway/crowd/observations" },
  "railway.railwaycrowd.openincident": { method: "POST", path: "/api/railway/crowd/incidents" },
  "railway.railwaycrowd.sources": { method: "GET", path: "/api/railway/crowd/sources" },
  "railway.railwaycrowd.submitobservation": { method: "POST", path: "/api/railway/crowd/observations" },
  "railway.railwaycrowdingestion.ingestbatch": { method: "POST", path: "/api/railway/crowd/ingestion/batches" },
  "railway.railwaycrowdingestion.quarantine": { method: "GET", path: "/api/railway/crowd/ingestion/quarantine" },
  "railway.railwaydefects.create": { method: "POST", path: "/api/railway/defects" },
  "railway.railwaydefects.list": { method: "GET", path: "/api/railway/defects" },
  "railway.railwaydefects.resolve": { method: "PATCH", path: "/api/railway/defects/{defectId}" },
  "railway.railwayinspections.createrun": { method: "POST", path: "/api/railway/inspections/template/{templateVersion}/station/{stationId}" },
  "railway.railwayinspections.raisedefect": { method: "POST", path: "/api/railway/inspections/{runId}/defects" },
  "railway.railwayinspections.submitfinding": { method: "POST", path: "/api/railway/inspections/{runId}/findings" },
  "railway.railwaymaintenanceplans.createplan": { method: "POST", path: "/api/railway/maintenance/plans" },
  "railway.railwaymaintenanceplans.generatefromplan": { method: "POST", path: "/api/railway/maintenance/plans/{planId}/generate" },
  "railway.railwaymaintenanceplans.list": { method: "GET", path: "/api/railway/maintenance/plans" },
  "railway.railwayworkorders.approve": { method: "PATCH", path: "/api/railway/work-orders/{orderId}/approve" },
  "railway.railwayworkorders.complete": { method: "PATCH", path: "/api/railway/work-orders/{orderId}/complete" },
  "railway.railwayworkorders.create": { method: "POST", path: "/api/railway/work-orders" },
  "railway.railwayworkorders.list": { method: "GET", path: "/api/railway/work-orders" },
} as const satisfies Record<RailwayOperationId, { method: string; path: string }>
