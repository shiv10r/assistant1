// Generated from openapi/railway.json. Do not edit manually.

export type CreateDefectRequest = { "description"?: string | null; "severity"?: DefectSeverity }

export type CreateInspectionRunRequest = { "divisionId"?: string }

export type ProblemDetails = { "type"?: string | null; "title"?: string | null; "status"?: number | null; "detail"?: string | null; "instance"?: string | null }

export type DefectInputDto = { "description"?: string | null; "severity"?: DefectSeverity }

export type RailwayPageOfAssetSummary = { "items"?: readonly (AssetSummary)[] | null; "page"?: number; "pageSize"?: number; "total"?: number }

export type RailwayPageOfMasterRecordSummary = { "items"?: readonly (MasterRecordSummary)[] | null; "page"?: number; "pageSize"?: number; "total"?: number }

export type RailwayPageOfRouteSummary = { "items"?: readonly (RouteSummary)[] | null; "page"?: number; "pageSize"?: number; "total"?: number }

export type RailwayPageOfStationSummary = { "items"?: readonly (StationSummary)[] | null; "page"?: number; "pageSize"?: number; "total"?: number }

export type ResolveDefectRequest = { "accepted"?: boolean; "reason"?: string | null }

export type SubmitFindingRequest = { "itemId"?: string | null; "response"?: string | null }

export type DefectSeverity = 0 | 1 | 2 | 3

export type CreateRailwayMasterRecordRequest = { "divisionId"?: string | null; "code"?: string | null; "name"?: string | null; "parentId"?: string | null; "secondaryParentId"?: string | null; "tertiaryParentId"?: string | null; "effectiveFrom"?: string | null; "departureWindowStart"?: string | null; "departureWindowEnd"?: string | null; "status"?: string | null; "criticality"?: string | null; "latitude"?: number | null; "longitude"?: number | null; "geometry"?: readonly (RailwayCoordinate)[] | null }

export type RailwayCoordinate = { "latitude"?: number; "longitude"?: number }

export type UpdateRailwayMasterRecordRequest = { "code"?: string | null; "name"?: string | null }

export type CompleteRequest = { "reason"?: string | null }

export type CreatePlanRequest = { "name"?: string | null; "description"?: string | null; "slaDays"?: number }

export type CreateWorkOrderRequest = { "sourceId"?: string; "sourceType"?: string | null; "priority"?: string | null }

export type IncidentRequest = { "stationId"?: string; "title"?: string | null }

export type IngestBatchRequest = { "sourceId"?: string; "nonce"?: string | null; "signature"?: string | null; "observations"?: readonly (ObservationRequest)[] | null }

export type ObservationRequest = { "sourceEventId"?: string | null; "stationId"?: string; "zoneId"?: string; "count"?: number; "confidence"?: number }

export type AssetSummary = { "id"?: string; "organizationId"?: string; "divisionId"?: string; "assetTypeId"?: string; "code"?: string | null; "name"?: string | null; "criticality"?: string | null; "version"?: number }

export type MasterRecordSummary = { "id"?: string; "organizationId"?: string; "divisionId"?: string | null; "kind"?: string | null; "code"?: string | null; "name"?: string | null; "retiredAt"?: string | null; "version"?: number }

export type RailwayCapabilities = { "organizationId"?: string; "railwayEnabled"?: boolean; "inspectionEnabled"?: boolean; "maintenanceEnabled"?: boolean; "crowdEnabled"?: boolean; "liveCrowdAdaptersEnabled"?: boolean; "aiEnabled"?: boolean; "offlinePackMaxAgeHours"?: number; "permissions"?: readonly (string)[] | null }

export type RouteSummary = { "id"?: string; "organizationId"?: string; "divisionId"?: string; "corridorId"?: string; "code"?: string | null; "name"?: string | null; "version"?: number }

export type StationSummary = { "id"?: string; "organizationId"?: string; "divisionId"?: string; "code"?: string | null; "name"?: string | null; "latitude"?: number | null; "longitude"?: number | null; "version"?: number }

export type RailwayOperationId = "railway.railwaycapabilities.get" | "railway.railwaycrowd.observations" | "railway.railwaycrowd.submitobservation" | "railway.railwaycrowd.alerts" | "railway.railwaycrowd.acknowledge" | "railway.railwaycrowd.sources" | "railway.railwaycrowd.incidents" | "railway.railwaycrowd.openincident" | "railway.railwaycrowdingestion.ingestbatch" | "railway.railwaycrowdingestion.quarantine" | "railway.railwaydefects.list" | "railway.railwaydefects.create" | "railway.railwaydefects.resolve" | "railway.railwayinspections.createrun" | "railway.railwayinspections.submitfinding" | "railway.railwayinspections.raisedefect" | "railway.railwaymaintenanceplans.list" | "railway.railwaymaintenanceplans.createplan" | "railway.railwaymaintenanceplans.generatefromplan" | "railway.railwaymasterdata.listassets" | "railway.railwaymasterdata.listroutes" | "railway.railwaymasterdata.liststations" | "railway.railwaymasterdata.list" | "railway.railwaymasterdata.create" | "railway.railwaymasterdata.listtimetableservices" | "railway.railwaymasterdata.update" | "railway.railwaymasterdata.retire" | "railway.railwayworkorders.list" | "railway.railwayworkorders.create" | "railway.railwayworkorders.approve" | "railway.railwayworkorders.complete"

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
  "railway.railwaymasterdata.create": { method: "POST", path: "/api/railway/master-data/types/{kind}" },
  "railway.railwaymasterdata.list": { method: "GET", path: "/api/railway/master-data/types/{kind}" },
  "railway.railwaymasterdata.listassets": { method: "GET", path: "/api/railway/master-data/assets" },
  "railway.railwaymasterdata.listroutes": { method: "GET", path: "/api/railway/master-data/routes" },
  "railway.railwaymasterdata.liststations": { method: "GET", path: "/api/railway/master-data/stations" },
  "railway.railwaymasterdata.listtimetableservices": { method: "GET", path: "/api/railway/timetable-services" },
  "railway.railwaymasterdata.retire": { method: "DELETE", path: "/api/railway/master-data/types/{kind}/{id}" },
  "railway.railwaymasterdata.update": { method: "PUT", path: "/api/railway/master-data/types/{kind}/{id}" },
  "railway.railwayworkorders.approve": { method: "PATCH", path: "/api/railway/work-orders/{orderId}/approve" },
  "railway.railwayworkorders.complete": { method: "PATCH", path: "/api/railway/work-orders/{orderId}/complete" },
  "railway.railwayworkorders.create": { method: "POST", path: "/api/railway/work-orders" },
  "railway.railwayworkorders.list": { method: "GET", path: "/api/railway/work-orders" },
} as const satisfies Record<RailwayOperationId, { method: string; path: string }>
