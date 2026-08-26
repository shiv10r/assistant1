# VSR Railway Top Three Modules Architecture

## 1. Document Purpose

This document defines the deployable full-stack architecture for the first three production modules added to the existing VSR Railway workspace:

1. Track and Asset Inspection System.
2. Station Crowd Management Command Center.
3. Maintenance and Defect Work Order System.

The three capabilities remain inside one VSR Railway product. They share railway master data, identity, organization and division boundaries, files, notifications, audit, realtime delivery, reporting, and operational events.

## 2. Goals

- Extend the existing VSR Railway card and shell instead of creating three launcher cards.
- Deliver an organization- and division-scoped production system.
- Support an offline-capable responsive PWA for inspectors and maintenance crews.
- Support manual and CSV crowd inputs immediately, with stable adapters for live sensor providers.
- Connect inspection findings, defects, crowd incidents, and work orders in one auditable lifecycle.
- Reuse current VSR platform capabilities and visual conventions.
- Keep deployment compatible with the current React, ASP.NET Core, PostgreSQL/Supabase, Netlify, and Render stack.
- Preserve clear module boundaries so high-volume crowd ingestion can be extracted later if measured load requires it.

## 3. Non-Goals For The First Release

- A separate React Native application.
- Train control, signalling control, automatic route setting, or other safety-critical control-system commands.
- Biometric identification, facial recognition, or storage of raw CCTV video.
- Predictive maintenance decisions that automatically remove an asset from service without human approval.
- A microservice per railway capability.
- Replacement of specialized enterprise asset management, signalling, or emergency systems without an approved integration project.
- Hardware-vendor-specific integrations before protocols, credentials, retention, and support ownership are approved.

## 4. Current VSR Baseline

### 4.1 Frontend

The current React Railway workspace provides fixture-backed views for:

- Network overview.
- Routes and timetable.
- Stations.
- Fleet readiness.

The module is registered in `frontend/src/app/moduleRegistry.ts`, loaded through `frontend/src/services/railway/routes.tsx`, rendered by `RailwayWorkspace.tsx`, and shown inside the shared application shell. The module registry remains the source of truth for workspace metadata, routes, loaders, permissions, and availability.

The new product must follow `DESIGN.md`, use semantic tokens from `frontend/src/index.css`, and use canonical primitives from `frontend/src/components/ui`. New asynchronous screens require loading, empty, error, success, offline, and reconnect states.

### 4.2 Backend

The ASP.NET Core backend is maintained in the adjacent `VSRSystemsBackend` repository. VSR currently has no dedicated production Railway backend module. Railway persistence must not be built as frontend-only state or treated as production-ready generic collection data.

The implementation must first establish `Modules/Railway` with matching Domain, Application, Infrastructure, and API ownership. It then integrates with current or planned shared platform services.

### 4.3 Reusable VSR Capabilities

The Railway module will integrate with these VSR capabilities where available:

- JWT identity and role-based authorization.
- Organization and permission boundaries.
- Private file storage and signed URLs.
- Maps and geospatial display.
- Notifications.
- SignalR realtime updates.
- Audit and correlation IDs.
- AI gateway for advisory summaries and forecasts.
- Reports and document generation.
- Feature flags and settings.
- Workflow approvals.
- Transactional outbox and background jobs.

Organization persistence, full audit, workflow, outbox, reports, and background dispatch are production prerequisites if they are not complete when Railway implementation starts. A Railway vertical slice may supply the minimum shared contract, but it must not create an incompatible duplicate platform.

## 5. Architecture Decision

Use a modular monolith with one deployable Railway backend module and three bounded capabilities:

- Inspection and Defects.
- Crowd Operations.
- Maintenance Work Management.

Shared Railway master data is owned once and referenced by all capabilities. Cross-capability effects use domain events published through a transactional outbox. Capabilities do not update one another's tables directly.

This decision avoids premature distributed-system complexity while preserving clear extraction seams. Crowd ingestion or analytics may become a separate deployable component later only after capacity tests or production telemetry demonstrate the need.

## 6. High-Level Components

### 6.1 Web And Field PWA

The React application provides desktop command-center views and responsive field workflows from the existing Railway workspace.

Responsibilities:

- Route composition and permission-aware navigation.
- Dashboard and operational query rendering.
- Guided inspection and work-order forms.
- Camera, file, QR/barcode, and browser geolocation access where supported.
- IndexedDB offline storage and an explicit sync queue.
- SignalR subscriptions and reconnect recovery.
- Accessibility at 375 px, 768 px, and 1280 px.

### 6.2 Railway API

The ASP.NET Core API provides:

- Authenticated REST commands and queries.
- Tenant, division, station, and assignment authorization.
- Validation, idempotency, optimistic concurrency, and transition policies.
- Signed evidence upload initiation and finalization.
- Offline batch synchronization.
- Sensor-ingestion endpoints and adapter authentication.
- SignalR Railway hub groups.

### 6.3 Railway Application And Domain

Application handlers coordinate use cases and transactions. Domain models enforce lifecycle invariants. Each capability owns its commands, queries, policies, event handlers, and persistence mappings.

No controller or background job may bypass application authorization and domain transition policies.

### 6.4 PostgreSQL And PostGIS

The existing PostgreSQL/Supabase deployment stores transactional Railway data. PostGIS is enabled for track geometry, asset position, inspection location, and station-zone queries.

Persistence rules:

- UUID primary keys.
- UTC timestamps and explicit operating timezone metadata.
- Mandatory organization ownership and applicable division ownership.
- Foreign keys include or validate tenant ownership.
- Optimistic version columns on mutable operational records.
- Unique idempotency keys within their owner and operation scope.
- Immutable history for submitted inspections, acknowledged alerts, approvals, and completed work.
- Retention or soft retirement instead of destructive deletion where audit history is required.

### 6.5 Private Evidence Storage

Photos, videos, reports, permits, and supporting documents use the private VSR storage provider.

The browser requests a signed upload target, uploads directly, and finalizes metadata with the API. The backend verifies owner scope, MIME type, size, checksum, malware-scan status, and business-record linkage before evidence becomes available.

### 6.6 Realtime And Background Processing

SignalR delivers live crowd observations, alert state, work-order assignment changes, and dashboard invalidations. Clients join only authorized organization, division, station, or assignment groups.

Background workers process:

- Outbox publication.
- Recurring inspection generation.
- Work-order SLA warnings and escalations.
- Stale crowd-source health alerts.
- Import processing.
- Aggregate crowd calculations and forecasts.
- Notifications and reports.
- Retention and archival policies.

## 7. Frontend Information Architecture

The existing `/railway` route remains the entry point.

### 7.1 Shared Routes

- `/railway` - integrated network overview.
- `/railway/routes` - route and timetable context.
- `/railway/stations` - station master data and readiness.
- `/railway/fleet` - fleet and asset readiness.

### 7.2 Inspection Routes

- `/railway/inspections` - inspection dashboard and due work.
- `/railway/inspections/plans` - recurring plans and calendar.
- `/railway/inspections/templates` - versioned checklist templates.
- `/railway/inspections/assignments` - planner and supervisor queue.
- `/railway/inspections/my-work` - offline-ready field assignments.
- `/railway/inspections/runs/:runId` - guided inspection runner or review.
- `/railway/defects` - filterable defect register.
- `/railway/defects/:defectId` - defect history and linked work.

### 7.3 Crowd Routes

- `/railway/crowd` - multi-station command overview.
- `/railway/crowd/stations/:stationId` - station zone map and live risk.
- `/railway/crowd/alerts` - acknowledgement and escalation queue.
- `/railway/crowd/incidents/:incidentId` - response timeline and actions.
- `/railway/crowd/sources` - source health and adapter configuration.
- `/railway/crowd/imports` - staged CSV import and validation.
- `/railway/crowd/analytics` - historical trends and forecast quality.

### 7.4 Maintenance Routes

- `/railway/maintenance` - maintenance readiness and SLA dashboard.
- `/railway/maintenance/work-orders` - list and triage queue.
- `/railway/maintenance/board` - status board.
- `/railway/maintenance/calendar` - schedule and team capacity.
- `/railway/maintenance/my-work` - offline-ready technician assignments.
- `/railway/maintenance/work-orders/:workOrderId` - execution and history.
- `/railway/maintenance/verification` - supervisor closure queue.
- `/railway/maintenance/plans` - preventive maintenance plans.

Navigation is grouped as Network, Inspection, Crowd Operations, Maintenance, and Administration. Routes and required permissions are registered through the module registration source of truth and projected into the shell.

## 8. Shared Railway Master Data

### 8.1 Organizational Scope

- `Organization` - top-level tenant supplied by the VSR organization platform.
- `Division` - zone, division, operator subdivision, or contracted operating unit.
- `Team` - inspection, station operations, or maintenance team.
- `RailwayUserProfile` - Railway-specific qualification and division references linked to platform identity.

### 8.2 Network And Asset Scope

- `Corridor` - named operational corridor.
- `Route` - service route context.
- `TrackSegment` - geospatial segment between controlled points.
- `Station` - station master record and operating timezone.
- `StationZone` - concourse, gate, footbridge, platform, entrance, or configurable area.
- `Platform` - platform master record linked to a station and optional zone.
- `AssetType` - track, turnout, signal-support asset, bridge, escalator, lift, rolling-stock unit, or configured type.
- `Asset` - identifiable inspectable/maintainable item with status, criticality, location, and optional QR/barcode.

Master-data APIs support authorized import, validation, effective dating, and retirement. Operational records retain references to retired master data.

## 9. Track And Asset Inspection Capability

### 9.1 Primary Entities

- `InspectionTemplate` - named checklist definition.
- `InspectionTemplateVersion` - immutable published version.
- `InspectionChecklistItem` - typed question, limits, instructions, and evidence requirements.
- `InspectionPlan` - recurring frequency, target selection, team, and review policy.
- `InspectionAssignment` - one target and due window assigned to a user or team.
- `InspectionRun` - execution instance with draft, submitted, accepted, rejected, or amended state.
- `InspectionResponse` - answer, measurement, condition, notes, and validation result.
- `InspectionEvidence` - private stored evidence and capture metadata.
- `Defect` - actionable finding linked to source, target, severity, and lifecycle.
- `DefectAssessment` - auditable supervisor triage and risk decision.

### 9.2 Rules

- Published template versions are immutable.
- Assignments pin the template version used for execution.
- Required checklist items and evidence must pass validation before submission.
- Safety-critical measurements outside configured limits require a finding or explicit supervisor-reviewed justification.
- Submitted runs cannot be edited in place; corrections create an auditable amendment.
- GPS accuracy and capture time are stored when location is required, but lack of device permission follows a configured exception workflow.
- Defect severity and safety impact determine acknowledgement and work-order policy.

### 9.3 Workflow

1. A planner publishes a checklist and creates a recurring or one-time plan.
2. The scheduler generates assignments for a segment, station zone, platform, or asset.
3. The field user downloads assigned work and required reference data.
4. The user completes checks, measurements, notes, and evidence online or offline.
5. Sync validates the pinned template and target versions.
6. A supervisor accepts, rejects, or requests an auditable amendment.
7. Findings create defects; configured severities draft or require a work order.
8. Closure of linked work updates defect state and asset health without rewriting inspection history.

## 10. Station Crowd Management Capability

### 10.1 Primary Entities

- `CrowdSource` - manual, CSV, gate, CCTV analytics, Wi-Fi aggregate, or IoT source.
- `CrowdSourceCredential` - secret reference and rotation metadata, never a plaintext secret.
- `CrowdObservation` - normalized aggregate count for one station zone and time window.
- `CrowdThresholdPolicy` - effective-dated thresholds by zone, schedule, event, or service condition.
- `CrowdRiskSnapshot` - calculated occupancy, flow, confidence, trend, and risk level.
- `CrowdAlert` - threshold breach requiring acknowledgement or action.
- `CrowdIncident` - managed operational event.
- `ResponsePlaybook` - versioned recommended action sequence.
- `ResponseAction` - acknowledged, assigned, completed, skipped, or escalated action.
- `CrowdImportBatch` - staged CSV upload, validation, approval, and result summary.

### 10.2 Privacy And Data Rules

- Store aggregate counts, flow direction, confidence, and source health by default.
- Do not store faces, biometric templates, device identifiers, or raw CCTV streams.
- Vendor adapters must document their own processing boundary and retention.
- Manual overrides retain the original computed value, author, reason, and expiry.
- Threshold changes are effective-dated and audited.
- Low-confidence or stale data is displayed as degraded, not as authoritative normal status.

### 10.3 Ingestion Contract

All sources normalize to an observation containing:

- Organization, division, station, and zone identity.
- Source identity and source event ID.
- Observation start and end time.
- Count, optional inflow/outflow, confidence, and quality flags.
- Received time and adapter version.

The ingestion service authenticates the adapter, validates ownership and time windows, deduplicates the source event ID, rejects replayed or future-invalid payloads, quarantines malformed batches, and records source health.

### 10.4 Workflow

1. Manual entry, approved CSV, or an adapter submits observations.
2. The application validates and persists normalized observations.
3. A background calculation updates zone and station risk snapshots.
4. SignalR publishes authorized dashboard invalidations or updates.
5. A policy breach creates or updates an alert and starts acknowledgement timing.
6. The station controller acknowledges, follows a playbook, and dispatches actions.
7. Escalation may create an incident and a linked maintenance work order.
8. Closure records outcomes, timings, evidence, and lessons for analytics.

## 11. Maintenance And Defect Work Order Capability

### 11.1 Primary Entities

- `MaintenancePlan` - preventive schedule and target rules.
- `WorkOrder` - central maintenance instruction and lifecycle.
- `WorkOrderTask` - ordered or parallel execution step.
- `WorkAssignment` - team or technician responsibility and time window.
- `LaborLog` - auditable time and activity record.
- `MaterialUsage` - material reference, quantity, and optional external inventory reference.
- `Permit` - required safety or access authorization and evidence.
- `WorkEvidence` - before, during, after, and verification evidence.
- `WorkOrderApproval` - approval decision and policy context.
- `WorkOrderStatusHistory` - immutable transition history.
- `ClosureVerification` - independent completion check where required.

### 11.2 Work Order Sources

- Inspection defect.
- Crowd incident or failed station asset.
- Preventive maintenance plan.
- Manual operational request.
- Approved external integration.

### 11.3 Status Model

Valid principal states are:

- Draft.
- Triaged.
- Approved.
- Scheduled.
- In Progress.
- Blocked.
- Awaiting Verification.
- Completed.
- Cancelled.

Transitions are explicit commands. Policies determine required role, reason, evidence, approval, permit, and closure verification. A completed work order is not reopened in place; follow-up work creates a linked order.

### 11.4 Workflow

1. A source creates a draft work order with target, priority, safety class, and SLA.
2. A planner triages, approves, and schedules it according to policy.
3. A dispatcher assigns a qualified team or technician.
4. The technician downloads the work pack, performs tasks, and records labor, materials, permits, notes, and evidence online or offline.
5. Blocking conditions pause SLA treatment only when policy permits and a reason is recorded.
6. The technician submits for verification.
7. A supervisor verifies completion or returns the work with findings.
8. Completion updates linked defect resolution and asset health through domain events.

## 12. Cross-Capability Events

Events are persisted with the originating transaction and published through the outbox. Consumers use event IDs for idempotency.

Initial events include:

- `InspectionAssignmentCreated`.
- `InspectionSubmitted`.
- `InspectionAccepted`.
- `DefectRaised`.
- `CriticalDefectRaised`.
- `DefectTriaged`.
- `CrowdThresholdBreached`.
- `CrowdAlertAcknowledgementOverdue`.
- `CrowdIncidentCreated`.
- `WorkOrderCreated`.
- `WorkOrderAssigned`.
- `WorkOrderSlaAtRisk`.
- `WorkOrderOverdue`.
- `WorkOrderCompleted`.
- `AssetHealthChanged`.

Example policy:

1. `CriticalDefectRaised` creates a critical-priority draft work order.
2. It notifies the division controller and maintenance planner.
3. It updates the integrated Railway overview.
4. It does not automatically change operational route or signalling state.

## 13. API Architecture

All resources are rooted under `/api/railway`. Exact request and response schemas are defined during implementation and versioned compatibly.

### 13.1 Shared Resources

- `/master-data/divisions`
- `/master-data/corridors`
- `/master-data/routes`
- `/master-data/track-segments`
- `/master-data/stations`
- `/master-data/station-zones`
- `/master-data/platforms`
- `/master-data/asset-types`
- `/master-data/assets`
- `/timetable-services`

### 13.2 Inspection Resources

- `/inspection-templates`
- `/inspection-plans`
- `/inspection-assignments`
- `/inspection-runs`
- `/defects`

### 13.3 Crowd Resources

- `/crowd-sources`
- `/crowd-observations`
- `/crowd-alerts`
- `/crowd-incidents`
- `/crowd-imports`
- `/crowd-risk`

### 13.4 Maintenance Resources

- `/maintenance-plans`
- `/work-orders`
- `/work-orders/{id}/assignments`
- `/work-orders/{id}/tasks`
- `/work-orders/{id}/transitions`
- `/work-orders/{id}/verification`

### 13.5 Supporting Resources

- `/evidence/uploads`
- `/offline-sync`
- `/dashboard`
- `/reports`
- `/search`

### 13.6 Contract Rules

- List APIs use server-side filtering, sorting, and pagination.
- Stable cursors are used where realtime insertion could invalidate offset pages.
- Commands carry an idempotency key.
- Mutable resources carry a version or ETag.
- Validation responses identify stable error codes and fields.
- Dates and times are ISO 8601 UTC; station operating timezone is supplied separately for display and schedule interpretation.
- Authorization scope comes from the authenticated server context, not trusted client organization IDs.
- Export and report endpoints create background jobs for large results.

## 14. Offline PWA Architecture

### 14.1 Offline Data

IndexedDB stores only the authenticated user's authorized field pack:

- Assigned inspections and pinned template versions.
- Assigned work orders and tasks.
- Required target and reference metadata.
- Draft responses, logs, and pending evidence.
- Outbound commands and sync results.

The cache is user- and organization-scoped and encrypted where browser support and platform policy allow. Logout, expiry, or access revocation clears downloaded server assignments/reference packs and locks user-authored records. Unsynchronized drafts, evidence, and queued/conflicted commands remain encrypted and recoverable only after the same user reauthenticates, until successful sync or an explicit authorized discard. Voluntary logout offers sync or confirmed discard but never silently deletes authored work.

### 14.2 Sync Protocol

Each offline command contains:

- Client command ID and idempotency key.
- Aggregate ID and expected server version.
- Command type and validated payload.
- Device capture timestamp.
- Evidence references and checksums.

The batch sync response returns each command as accepted, duplicate, rejected, or conflicted. Accepted commands include the authoritative version. Rejected and conflicted commands remain visible and recoverable; the UI never silently discards field work.

Evidence uploads resume independently. A business command that requires evidence is not finalized until the required upload is verified.

## 15. Realtime Architecture

The Railway SignalR hub uses authorization on connection and group membership.

Group scopes include:

- Organization.
- Division.
- Station.
- Crowd incident.
- Inspection assignment.
- Work assignment.

Realtime messages contain minimal event identifiers and display-safe summaries. They do not replace REST authorization or authoritative reads. After reconnecting, the client fetches missed state using current query endpoints or a server watermark.

The application registers exactly one root-scoped `/sw.js` service worker. PWA caching/update behavior and Firebase Cloud Messaging are composed into that registration; Railway must not register a competing worker URL or query-string variant.

## 16. Authorization Model

Initial roles:

- Railway administrator.
- Network controller.
- Station controller.
- Inspection planner.
- Inspector.
- Maintenance planner.
- Technician.
- Supervisor/verifier.
- Read-only auditor.

Representative permissions:

- `railway.master-data.read`
- `railway.master-data.manage`
- `railway.inspections.plan`
- `railway.inspections.execute`
- `railway.inspections.submit`
- `railway.inspections.review`
- `railway.defects.raise`
- `railway.defects.triage`
- `railway.crowd.read`
- `railway.crowd.ingest`
- `railway.crowd.acknowledge`
- `railway.crowd.manage-incident`
- `railway.work-orders.create`
- `railway.work-orders.approve`
- `railway.work-orders.assign`
- `railway.work-orders.execute`
- `railway.work-orders.verify`
- `railway.reports.generate`
- `railway.admin.manage`

Every API operation enforces permission plus resource scope. Scope may include organization, division, station, target, team assignment, and user assignment. Frontend permission gates improve navigation and affordances but never substitute for backend authorization.

## 17. Error Handling And Resilience

### 17.1 API And User Errors

- Use stable machine-readable error codes and safe human-readable messages.
- Return field errors for validation failures.
- Return concurrency conflicts with the current resource version and safe comparison data.
- Do not reveal whether an unauthorized cross-tenant resource exists.
- Include correlation IDs in responses and support views.

### 17.2 Retry Policy

- Retry only safe or idempotent operations.
- Use bounded exponential backoff with jitter.
- Respect provider retry guidance and circuit breakers.
- Do not retry validation, authorization, or deterministic transition failures.

### 17.3 Sensor Failure

- One failed source cannot block other sources or manual operation.
- Stale and degraded sources are visible on the command center.
- Malformed batches enter quarantine with diagnostics.
- Dead-letter replay requires authorization and remains idempotent.

### 17.4 Background Failure

- Outbox messages remain pending until successfully handled or moved to an operator-visible dead-letter state.
- Workers use leases so a crashed process can safely resume work.
- Notification failure does not roll back the committed operational command.
- Safety-relevant notification failures trigger observability alerts and alternate escalation policy where configured.

## 18. Security, Privacy, And Audit

- Validate JWT issuer, audience, signature, expiry, and revocation policy.
- Enforce least privilege and server-derived tenant scope.
- Use TLS for all network traffic and encryption at rest from managed providers.
- Store secrets in the approved secret manager, not application settings or source control.
- Use short-lived signed file URLs and validate content before release.
- Apply API, login, upload, and ingestion rate limits.
- Protect sensor ingestion against replay and credential misuse.
- Log every safety-critical transition, approval, override, acknowledgement, assignment, evidence change, export, and permission change.
- Keep audit entries append-only and include actor, effective scope, timestamp, correlation ID, previous state, new state, and reason where applicable.
- Define per-record retention and legal-hold rules before production use.
- Keep crowd analytics aggregate-only unless a separately approved privacy and security design changes this rule.

## 19. AI Usage

AI features are advisory and use the existing VSR AI gateway.

Allowed first uses:

- Summarize inspection findings and evidence metadata.
- Group recurring defects for supervisor review.
- Draft maintenance or handover briefs.
- Forecast crowd pressure from approved aggregate observations and schedules.
- Explain risk drivers and data confidence.

Rules:

- Display source records, generation time, model/provider metadata, and confidence or limitations.
- Require human approval before creating or changing operational work.
- Never send secrets, raw private evidence, biometric data, or data outside approved provider policy.
- Never issue signalling, route-control, evacuation, asset-isolation, or return-to-service commands.
- Record accepted operational use in audit history.

## 20. Observability

Use current VSR correlation and OpenTelemetry conventions.

Required telemetry includes:

- API latency, error rate, and authorization failures by operation without leaking tenant data.
- PostgreSQL health, slow queries, lock waits, and connection saturation.
- Outbox age, retry count, and dead-letter count.
- Worker job duration and failure.
- Crowd source freshness, confidence, rejection, and ingestion lag.
- SignalR connections, reconnects, fan-out delay, and failures.
- Offline sync accepted, duplicate, rejected, and conflict counts.
- File upload failures, checksum failures, and malware-scan outcomes.
- Inspection completion and overdue rates.
- Defect severity and ageing.
- Work-order SLA risk, overdue, blocked, and verification duration.
- Crowd alert acknowledgement and incident response times.

Operational dashboards and alert ownership must be documented before production launch.

## 21. Deployment Architecture

### 21.1 Frontend

- React 19, TypeScript, Vite, and the existing shared shell.
- Netlify deployment using the current frontend release process.
- Service worker and web manifest for PWA installation and controlled cache updates.
- Environment configuration for API, SignalR, storage provider, and enabled Railway capabilities.

### 21.2 Backend

- ASP.NET Core modular monolith on Render.
- Railway API and background workers may run in separate Render process types from the same versioned codebase.
- Health and readiness endpoints cover database, required storage, outbox, and worker dependencies.
- Secured WebSocket support for SignalR.

### 21.3 Data And Storage

- Supabase PostgreSQL with PostGIS.
- Private object storage through the current VSR storage abstraction.
- Controlled, forward-compatible database migrations during release.
- Point-in-time recovery or provider-supported backups with tested restore procedures.

### 21.4 Release Safety

- Backward-compatible API and event changes during rolling releases.
- Database expansion before application cutover; destructive contraction only in a later verified release.
- Feature flags for each capability and external adapter.
- Seed data is isolated from production organizations.
- Rollback instructions account for migrations and already-published events.

## 22. Testing Strategy

### 22.1 Domain Tests

- Inspection submission, amendment, and defect rules.
- Threshold policy evaluation and alert state.
- Work-order transitions, approvals, SLA, blocking, and closure.
- Tenant, division, station, and assignment ownership policies.

### 22.2 Backend Integration Tests

- PostgreSQL mappings, constraints, transactions, PostGIS queries, and migrations.
- Outbox atomicity, idempotent consumers, retries, and dead letters.
- REST validation, authorization, idempotency, pagination, and concurrency.
- Signed uploads and evidence finalization.
- Offline batch partial success and conflict recovery.
- SignalR authorization and group isolation.

### 22.3 Adapter Contract Tests

- Manual and CSV normalization.
- Duplicate, replayed, malformed, late, stale, and low-confidence observations.
- Vendor fixture suites for every enabled live adapter.
- Credential rotation and source disablement.

### 22.4 Frontend Tests

- Route and permission visibility.
- Loading, empty, error, offline, conflict, reconnect, and success states.
- Guided inspection and technician workflows at 375 px.
- Command-center keyboard and screen-reader behavior.
- IndexedDB isolation, queue persistence, evidence resume, and logout cleanup.
- SignalR reconnect followed by authoritative refresh.

### 22.5 End-To-End Tests

- Plan to offline inspection to sync to defect to work-order completion.
- Crowd observation to threshold breach to acknowledgement to incident closure.
- Preventive plan to assignment to offline execution to verification.
- Cross-tenant and cross-division access denial.
- Backup restoration and deployment smoke paths.

### 22.6 Capacity And Reliability Tests

- Sustained and burst crowd ingestion.
- Risk calculation backlog recovery.
- SignalR fan-out across authorized station groups.
- Large evidence uploads and resumable failure.
- Outbox and notification provider outage recovery.
- Offline clients reconnecting after long disconnection.

## 23. Acceptance And Production Gates

A release is production-ready only when:

- No tested path permits cross-organization access.
- Division, station, team, and assignment restrictions work as configured.
- Safety-relevant actions and overrides have complete audit history.
- Offline inspection and work-order workflows recover without silent data loss.
- Outbox failures recover without lost committed events.
- Crowd data freshness and source degradation are visible.
- Manual crowd operation remains available when adapters fail.
- Critical workflows are usable at 375 px and accessible by keyboard.
- Production migrations, backups, restore, rollback, incident response, and adapter runbooks are verified.
- API, worker, database, storage, realtime, and source-health alerts have named owners.
- AI output remains advisory and traceable.
- Frontend build, lint, chunk, and legacy-UI checks pass.
- Backend build, unit, integration, authorization, migration, and smoke checks pass.

## 24. Delivery Sequence

### Phase 1: Railway Foundation

- Establish the backend Railway module boundary.
- Add organization/division authorization and Railway permissions.
- Add master data for network, stations, zones, platforms, and assets.
- Add audit, outbox, background worker, evidence, and realtime foundations.
- Replace fixture overview queries incrementally.

### Phase 2: Inspection And Defect Loop

- Templates, plans, assignments, field PWA, evidence, review, and defects.
- Offline queue and conflict handling.
- Dashboard and notification integration.

### Phase 3: Maintenance Work Loop

- Work orders, policies, approvals, assignments, field execution, verification, SLA, and asset history.
- Defect-to-work-order and completion-to-defect integration.

### Phase 4: Crowd Command Center

- Station zones, policies, manual entry, CSV import, source health, risk snapshots, alerts, playbooks, incidents, and realtime views.
- Incident-to-work-order integration.

### Phase 5: External Adapters And Hardening

- Approved gate, CCTV-analytics, Wi-Fi aggregate, and IoT adapters.
- Capacity tuning, security review, retention validation, disaster-recovery exercise, and production runbooks.

### Phase 6: Analytics And Advisory AI

- Historical performance, recurring-defect analysis, crowd forecasting, and operational brief generation.
- Model evaluation, provenance, approval controls, and drift monitoring.

Each phase is a deployable vertical slice. Existing Railway views remain available until persisted replacements satisfy their acceptance criteria.

## 25. Repository Targets

### 25.1 Frontend

```text
frontend/src/services/railway/
  routes.tsx
  RailwayWorkspace.tsx
  shared/
  inspection/
  crowd/
  maintenance/
```

Shared cross-service primitives remain under `frontend/src/components/ui` or the appropriate `frontend/src/platform` capability. Railway-specific concepts remain under `services/railway`.

### 25.2 Backend

```text
VSRSystemsBackend.Api/Modules/Railway/
  Domain/
    Shared/
    Inspection/
    CrowdOperations/
    Maintenance/
  Application/
    Shared/
    Inspection/
    CrowdOperations/
    Maintenance/
  Infrastructure/
    Persistence/
    Storage/
    Realtime/
    Ingestion/
    BackgroundJobs/
  API/
    Controllers/
    Contracts/
    Hubs/
```

Actual backend placement must follow the adjacent repository's current module conventions. The capability boundaries and ownership rules in this document remain unchanged if physical folder conventions differ.

## 26. Architecture Invariants

The following decisions must not be weakened during implementation without an approved architecture revision:

1. The three capabilities remain under one VSR Railway product and one Railway backend boundary.
2. Every operational record is organization-scoped and applicable records are division-scoped.
3. Capabilities communicate through application contracts and outbox-backed events, not direct cross-capability table updates.
4. Submitted inspections and completed work are changed only through auditable follow-up records.
5. Offline conflicts are visible and recoverable; user work is never silently discarded.
6. Crowd data is aggregate-only by default.
7. AI is advisory and cannot perform safety-critical control actions.
8. Sensor failure cannot disable manual crowd operations.
9. Frontend route guards never replace backend resource authorization.
10. Existing fixture screens are retired only after persisted replacements are verified.
