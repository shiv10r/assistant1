# VSR Railway Top Three Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the organization- and division-scoped Track and Asset Inspection, Station Crowd Management, and Maintenance and Defect Work Order capabilities inside the existing VSR Railway workspace.

**Architecture:** Extend the existing Railway card with one React PWA and one ASP.NET Core Railway modular-monolith boundary. Inspection, Crowd Operations, and Maintenance own separate domain/application areas, share Railway master data, PostgreSQL/PostGIS, signed evidence storage, SignalR, audit, and authorization, and communicate through outbox-backed events.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, IndexedDB, SignalR, ASP.NET Core, Entity Framework Core, PostgreSQL/PostGIS, Supabase private storage, xUnit, Vitest, React Testing Library, Netlify, and Render.

**Spec:** `docs/services/VSR_Railway_Top_3_Modules_Architecture.md`

## Progress Tracker

**Last updated:** 2026-08-26

| Total tasks | Done | In progress | Pending | Blocked | Progress |
|---:|---:|---:|---:|---:|---:|
| 14 | 0 | 3 | 11 | 0 | 0% |

| # | Task | Status |
|---:|---|---|
| 1 | Railway backend boundary and tenant scope | In Progress |
| 2 | Frontend Railway contract, tests, and route shell | In Progress |
| 3 | Shared Railway master data | In Progress |
| 4 | Events, evidence scanning, offline sync, and realtime | Pending |
| 5 | Inspection, review, and defect backend | Pending |
| 6 | Offline inspection PWA | Pending |
| 7 | Maintenance and work-order backend | Pending |
| 8 | Maintenance planning and technician screens | Pending |
| 9 | Crowd ingestion, risk, alerts, and incidents backend | Pending |
| 10 | Station crowd command center | Pending |
| 11 | Secure live crowd adapter contracts | Pending |
| 12 | Cross-capability automation, reports, and advisory AI | Pending |
| 13 | Security, observability, migrations, and deployment | Pending |
| 14 | Release acceptance, fixture retirement, and pull requests | Pending |

Update this tracker whenever a task starts, completes, or becomes blocked. Mark a task Done only after its required tests and quality checks pass. Recalculate progress as `Done / 14 x 100`, rounded to the nearest whole percent.

## Global Constraints

- Keep one registered `VSR Railway` workspace; do not create separate launcher cards.
- Treat `frontend/src/app/moduleRegistry.ts` as the source of truth for module metadata, routes, permissions, loaders, and availability.
- Follow `DESIGN.md`, semantic CSS tokens, shared UI primitives, and responsive validation at 375 px, 768 px, and 1280 px.
- Every operational record is organization-scoped and applicable records are division-scoped.
- Backend authorization must enforce organization, division, station, team, and assignment ownership; frontend guards are not security boundaries.
- Keep submitted inspections, acknowledged alerts, approvals, overrides, and completed work auditable and immutable except through follow-up records.
- Use PostgreSQL/PostGIS for production Railway state; do not use generic module-data collections or browser storage as authoritative persistence.
- Use aggregate crowd observations only; do not store faces, biometric templates, device identifiers, or raw CCTV streams.
- Offline conflicts must remain visible and recoverable; never silently discard field data or evidence.
- AI is advisory and cannot issue signalling, route-control, evacuation, asset-isolation, or return-to-service commands.
- Sensor failures must not disable manual crowd operations.
- Generate frontend Railway DTO types from the backend OpenAPI document and fail contract tests when the checked-in schema is stale.
- Feature `*.types.ts` files may define view state and generated-type aliases but must not duplicate backend request/response DTOs.
- Every Railway OpenAPI operation has a stable operation ID, JWT security metadata, standard Problem Details errors, and documented idempotency/ETag headers where applicable.
- Create descriptive feature branches in the frontend and adjacent backend repositories; never work directly on protected or deployment branches.
- Commit and push only after a major tested chunk or the complete plan; open pull requests to `luxinfra-frontend` for frontend and `develop03` for backend; never merge them.
- Run repository CLI checks only. Browser interaction and visual validation remain with the user unless the user explicitly authorizes automated browser sessions.

## Target File Structure

### Frontend

```text
frontend/src/services/railway/
  api/
    railwayApi.ts
    railwayApi.types.ts
    railway.generated.ts
  shared/
    RailwayPageState.tsx
    RailwayStatusBadge.tsx
    railwayPermissions.ts
  master-data/
    MasterDataPage.tsx
    masterData.types.ts
  inspection/
    InspectionDashboard.tsx
    InspectionTemplates.tsx
    InspectionPlans.tsx
    InspectionAssignments.tsx
    InspectionRunner.tsx
    InspectionReview.tsx
    DefectRegister.tsx
    inspection.types.ts
  crowd/
    CrowdCommandCenter.tsx
    CrowdStationView.tsx
    CrowdAlerts.tsx
    CrowdSources.tsx
    CrowdImports.tsx
    CrowdAnalytics.tsx
    crowd.types.ts
  maintenance/
    MaintenanceDashboard.tsx
    WorkOrderList.tsx
    MaintenanceCalendar.tsx
    MaintenancePlans.tsx
    MaintenanceVerification.tsx
    WorkOrderDetail.tsx
    MyMaintenanceWork.tsx
    maintenance.types.ts
  offline/
    railwayOfflineDb.ts
    railwaySync.ts
    railwayOffline.types.ts
  realtime/
    useRailwayRealtime.ts
  routes.tsx
  RailwayWorkspace.tsx
  railway.css
frontend/tests/railway/
```

### Backend

Backend paths are relative to the adjacent `VSRSystemsBackend` repository. If its test project name differs, keep that project name and use the same `Modules/Railway` relative hierarchy shown here.

```text
VSRSystemsBackend.Api/Modules/Railway/
  Domain/Shared/
  Domain/Inspection/
  Domain/CrowdOperations/
  Domain/Maintenance/
  Application/Shared/
  Application/Inspection/
  Application/CrowdOperations/
  Application/Maintenance/
  Infrastructure/Persistence/
  Infrastructure/Storage/
  Infrastructure/Realtime/
  Infrastructure/Ingestion/
  Infrastructure/BackgroundJobs/
  API/Controllers/
  API/Contracts/
  API/Hubs/
VSRSystemsBackend.Api.Tests/Modules/Railway/
```

---

### Task 1: Establish The Railway Backend Boundary And Tenant Scope

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/RailwayModule.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Shared/RailwayEntity.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/IRailwayScopeAccessor.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/IRailwayFeatureGate.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/RailwayDbContext.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/RailwayScopeAccessor.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayCapabilitiesController.cs`
- Modify: `VSRSystemsBackend.Api/Program.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayScopeTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayModuleRegistrationTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayOpenApiContractTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayOpenApiExportTests.cs`
- Create: `scripts/export-railway-openapi.ps1`
- Create: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayTestData.cs`
- Create: `VSRSystemsBackend.Api.Tests/Platform/RailwayPlatformCompatibilityTests.cs`
- Modify: `VSRSystemsBackend.Api.Tests/VSRSystemsBackend.Api.Tests.csproj`
- Create: `VSRSystemsBackend.Api/Modules/Railway/PLATFORM_COMPATIBILITY.md`

**Interfaces:**
- Consumes: Existing JWT identity, organization claims, permission, audit, outbox, background-job, private-storage, feature-flag, PostgreSQL, and correlation services.
- Produces: `RailwayScope`, `IRailwayScopeAccessor.GetRequiredScope()`, `IRailwayFeatureGate`, `RailwayEntity`, `RailwayDbContext`, `/api/railway/capabilities`, `AddRailwayModule(...)`, and `MapRailwayEndpoints(...)`.
- Produces for tests: deterministic `RailwayTestData` scope, asset, track segment, template, inspection run, work order, crowd observation, and domain-event builders used by later Railway tests.

- [ ] **Checklist 1: Characterize and gate shared platform prerequisites**

Create a compatibility test that resolves and exercises the existing organization scope, permission checker, append-only audit writer, transactional outbox, background dispatcher, private file storage, feature-flag reader, correlation context, and PostgreSQL registration. Record the concrete implementation and registration path for each in `VSRSystemsBackend.Api/Modules/Railway/PLATFORM_COMPATIBILITY.md`.

Run: `dotnet add VSRSystemsBackend.Api.Tests package Testcontainers.PostgreSql`

Create the shared Railway test fixture with image `postgis/postgis:16-3.4`, a random host port, an explicit test-only connection string, `CREATE EXTENSION IF NOT EXISTS postgis`, and automatic container disposal. Refuse to start migration or capacity tests unless the database host and port match the active fixture container.

If a capability is absent, implement it once under the corresponding shared `VSRSystemsBackend.Api/Platform/Organizations`, `Permissions`, `Audit`, `Outbox`, `BackgroundJobs`, `Storage`, or `FeatureFlags` boundary and add platform tests before Railway code consumes it. Do not create a Railway-only replacement for missing generic infrastructure.

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~RailwayPlatformCompatibilityTests"`

Expected: PASS with all required shared services resolved and the compatibility document naming each registration.

- [ ] **Checklist 2: Write failing scope, capabilities, and registration tests**

```csharp
[Fact]
public void GetRequiredScope_rejects_a_user_without_organization_claim()
{
    var accessor = RailwayScopeTestFactory.Create(organizationId: null, divisionIds: []);
    Assert.Throws<UnauthorizedAccessException>(() => accessor.GetRequiredScope());
}

[Fact]
public void Railway_entities_require_organization_ownership()
{
    var entity = new TestRailwayEntity(Guid.Empty, null);
    Assert.Throws<ArgumentException>(() => entity.ValidateOwnership());
}

[Fact]
public async Task Capabilities_are_scoped_by_organization_flags_and_permissions()
{
    var result = await fixture.GetCapabilitiesAsync(OrganizationA, UserA);
    Assert.Equal(OrganizationA, result.OrganizationId);
    Assert.False(result.LiveCrowdAdaptersEnabled);
    Assert.DoesNotContain("railway.admin.manage", result.Permissions);
}
```

The OpenAPI test enumerates every `/api/railway` operation and fails when an operation lacks a stable `railway.*` operation ID, bearer security metadata, standard Problem Details responses, or required `Idempotency-Key`/`If-Match` header documentation for state-changing commands. Later backend tasks extend this same test automatically.

`RailwayOpenApiExportTests` boots the API in-process with `WebApplicationFactory`, resolves `ISwaggerProvider`, keeps `/api/railway` paths and referenced schemas, sorts output deterministically, and writes to the path supplied by `RAILWAY_OPENAPI_OUTPUT`. `scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json` sets that variable and runs the focused test; it never opens a listening port.

- [ ] **Checklist 3: Run the focused backend tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~RailwayScopeTests|FullyQualifiedName~RailwayModuleRegistrationTests|FullyQualifiedName~RailwayOpenApiContractTests"`

Expected: FAIL because the Railway module, scope accessor, capability endpoint, entity base, and OpenAPI contract do not exist.

- [x] **Checklist 4: Add the minimum Railway scope, feature-gate contract, and entity base**

```csharp
public sealed record RailwayScope(
    Guid UserId,
    Guid OrganizationId,
    IReadOnlySet<Guid> DivisionIds,
    IReadOnlySet<string> Permissions);

public interface IRailwayScopeAccessor
{
    RailwayScope GetRequiredScope();
}

public sealed record RailwayCapabilities(
    Guid OrganizationId,
    bool RailwayEnabled,
    bool InspectionEnabled,
    bool MaintenanceEnabled,
    bool CrowdEnabled,
    bool LiveCrowdAdaptersEnabled,
    bool AiEnabled,
    int OfflinePackMaxAgeHours,
    IReadOnlySet<string> Permissions);

public interface IRailwayFeatureGate
{
    ValueTask<RailwayCapabilities> GetAsync(RailwayScope scope, CancellationToken cancellationToken);
}

public abstract class RailwayEntity
{
    public Guid Id { get; protected init; }
    public Guid OrganizationId { get; protected init; }
    public Guid? DivisionId { get; protected set; }
    public long Version { get; protected set; }
}
```

Implement claim parsing through the existing identity/organization contracts. Do not create a second JWT parser or trust organization IDs from request bodies. Resolve `RAILWAY_ENABLED`, `RAILWAY_INSPECTION_ENABLED`, `RAILWAY_MAINTENANCE_ENABLED`, `RAILWAY_CROWD_ENABLED`, `RAILWAY_LIVE_ADAPTERS_ENABLED`, and `RAILWAY_AI_ENABLED` through the shared feature-flag service with organization overrides.

- [x] **Checklist 5: Register the module and database boundary**

```csharp
builder.Services.AddRailwayModule(builder.Configuration);
app.MapRailwayEndpoints();
```

Configure all Railway queries with mandatory organization filtering and explicit division authorization in application handlers. Add a migration history location owned by `RailwayDbContext` without creating a second physical database.

- [x] **Checklist 6: Run tests and backend build**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run: `dotnet build VSRSystemsBackend.Api`

Expected: PASS with no warnings introduced by Railway registration.

- [x] **Checklist 7: Commit the backend foundation on its feature branch**

```bash
git add VSRSystemsBackend.Api/Modules/Railway VSRSystemsBackend.Api/Platform VSRSystemsBackend.Api/Program.cs VSRSystemsBackend.Api.Tests/VSRSystemsBackend.Api.Tests.csproj VSRSystemsBackend.Api.Tests/Modules/Railway VSRSystemsBackend.Api.Tests/Platform scripts/export-railway-openapi.ps1
git commit -m "feat(railway): establish tenant-scoped module boundary"
```

### Task 2: Add The Frontend Railway Contract, Test Harness, And Route Shell

**Files:**
- Create: `frontend/src/services/railway/api/railwayApi.types.ts`
- Create: `frontend/src/services/railway/api/railwayApi.ts`
- Create: `frontend/src/services/railway/api/railway.generated.ts`
- Create: `frontend/src/services/railway/shared/railwayPermissions.ts`
- Create: `frontend/src/services/railway/shared/RailwayPageState.tsx`
- Create: `frontend/openapi/railway.json`
- Create: `frontend/scripts/generate-railway-api.mjs`
- Modify: `frontend/src/services/railway/routes.tsx`
- Modify: `frontend/src/services/railway/RailwayWorkspace.tsx`
- Modify: `frontend/src/app/moduleRegistry.ts`
- Modify: `frontend/src/Layout.tsx`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/vite.config.ts`
- Test: `frontend/tests/railway/railwayApi.test.ts`
- Test: `frontend/tests/railway/railwayRoutes.test.tsx`
- Test: `frontend/tests/railway/moduleRegistry.test.ts`

**Interfaces:**
- Consumes: `BASE`, `getToken()`, shared UI primitives, current module registry, and React Router.
- Produces: `railwayRequest<T>()`, `RailwayApiError`, generated DTOs, `PageResult<T>`, Railway permission constants, organization-scoped capability state, structured registry navigation, and lazy route groups for the three capabilities.

- [x] **Checklist 8: Add Vitest and DOM test configuration**

Run: `npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event fake-indexeddb openapi-typescript`

Add these scripts:

```json
{
  "test:railway": "vitest run tests/railway",
  "test:railway:watch": "vitest tests/railway",
  "generate:railway-api": "node scripts/generate-railway-api.mjs",
  "check:railway-api": "node scripts/generate-railway-api.mjs --check"
}
```

Change the config import to `import { defineConfig } from 'vitest/config'`. Configure a `test` block in `vite.config.ts` with `environment: 'jsdom'`, `globals: false`, and a setup file at `tests/railway/setup.ts` that installs `fake-indexeddb`.

- [x] **Checklist 9: Write failing API contract tests**

```ts
it('adds authorization, idempotency, and expected version headers', async () => {
  await railwayRequest('/api/railway/defects', {
    method: 'POST',
    idempotencyKey: 'cmd-1',
    expectedVersion: 3,
    body: { severity: 'Critical' },
  })
  expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
    headers: expect.objectContaining({
      Authorization: 'Bearer test-token',
      'Idempotency-Key': 'cmd-1',
      'If-Match': '"3"',
    }),
  }))
})
```

Also assert that a Problem Details response becomes `RailwayApiError` with `status`, `code`, `fieldErrors`, and `correlationId`.

- [ ] **Checklist 10: Run the frontend tests and confirm failure**

Run: `npm run test:railway`

Expected: FAIL because the Railway API client and test setup are absent.

- [x] **Checklist 11: Implement the shared API types and request boundary**

```ts
export type PageResult<T> = {
  items: readonly T[]
  nextCursor: string | null
  total: number | null
}

export type RailwayRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  idempotencyKey?: string
  expectedVersion?: number
}

export class RailwayApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: Readonly<Record<string, readonly string[]>>,
    readonly correlationId: string | null,
  ) { super(message) }
}
```

Handle `401` through the existing session boundary, preserve correlation IDs, and never send tenant scope from browser storage as an authorization substitute.

- [x] **Checklist 12: Add placeholder-free route shells with explicit unavailable states**

Expand `ModuleRegistration.navigation` from route strings to structured groups and migrate every existing registry entry in the same change:

```ts
export type ModuleNavigationItem = {
  label: string
  to: string
  iconKey: string
  end?: boolean
  permission?: string
}

export type ModuleNavigationGroup = {
  title: string
  items: readonly ModuleNavigationItem[]
}
```

Make `Layout.tsx` render labels, routes, active behavior, and permission visibility from `MODULES_BY_KEY[module].navigation`; its icon resolver may remain visual-only. Delete the hard-coded Railway navigation array. Register `/railway/inspections/*`, `/railway/defects/*`, `/railway/crowd/*`, and `/railway/maintenance/*`. Fetch `/api/railway/capabilities` before enabling a route group. Until a vertical slice is enabled, render `RailwayPageState` with a truthful “not enabled for this organization” or “service unavailable” state rather than fixture data presented as live data.

Export without starting a server, then generate the frontend contract:

```powershell
# From the adjacent VSRSystemsBackend repository
powershell -File scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json

# From this repository's frontend directory
npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json
```

In update mode, the Node script copies the normalized Railway schema to `openapi/railway.json` and generates `railway.generated.ts`. In `--check` mode with `--schema <exported-file>`, it normalizes the exported backend schema, generates TypeScript into temporary files, and compares both directly with the checked-in schema and generated types without writing. A stale schema or stale generated type therefore fails before files are updated, and no running API is required.

Update Railway registration routes and permissions, then project the approved navigation groups into the existing shell.

- [ ] **Checklist 13: Run tests and frontend quality gates**

Run: `npm run test:railway`

Run: `npm run build`

Run: `npm run lint -- --deny-warnings`

Run: `npm run check:chunks`

Run: `npm run check:legacy-ui`

Run: `npm run check:railway-api`

Expected: all commands PASS.

### Task 3: Implement Shared Railway Master Data End To End

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Shared/RailwayMasterData.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/MasterDataHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/Configurations/RailwayMasterDataConfiguration.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayMasterDataController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Contracts/RailwayMasterDataContracts.cs`
- Create: `VSRSystemsBackend.Api.Tests/Modules/Railway/MasterDataTests.cs`
- Create: `frontend/src/services/railway/master-data/masterData.types.ts`
- Create: `frontend/src/services/railway/master-data/MasterDataPage.tsx`
- Modify: `frontend/src/services/railway/RailwayWorkspace.tsx`
- Test: `frontend/tests/railway/masterData.test.tsx`

**Interfaces:**
- Consumes: Task 1 scope and database; Task 2 API client and shared states.
- Produces: Division, corridor, route, timetable-service, track-segment, station, zone, platform, asset-type, and asset query contracts used by all later tasks and existing Railway views.

- [x] **Checklist 14: Write failing tenant, geospatial, and retirement tests**

```csharp
[Fact]
public async Task Asset_query_never_returns_another_organization_record()
{
    await fixture.InsertAsync(
        RailwayTestData.CreateAsset(OrganizationA, DivisionA, "ASSET-A"),
        RailwayTestData.CreateAsset(OrganizationB, DivisionB, "ASSET-B"));
    var result = await handler.Handle(new ListAssetsQuery(), RailwayTestData.Scope(OrganizationA, DivisionA));
    Assert.Collection(result.Items, item => Assert.Equal("ASSET-A", item.Code));
}

[Fact]
public async Task Retired_asset_remains_linkable_from_historical_records()
{
    var asset = RailwayTestData.CreateAsset(OrganizationA, DivisionA, "ASSET-A");
    await fixture.InsertAssetAndHistoricalReferenceAsync(asset);
    asset.Retire(FixedNow, UserA);
    await fixture.SaveChangesAsync();
    Assert.NotNull(await fixture.FindAssetIgnoringRetirementFilterAsync(asset.Id));
}

[Fact]
public void Track_segment_requires_valid_linestring_geometry()
{
    Assert.Throws<ArgumentException>(() => RailwayTestData.CreateTrackSegmentWithPointGeometry());
}
```

- [ ] **Checklist 15: Run tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~MasterDataTests"`

Expected: FAIL because master-data entities and handlers do not exist.

- [x] **Checklist 16: Implement the master-data aggregates and mappings**

Use these stable identifiers and relationships:

```csharp
public sealed record AssetSummary(
    Guid Id,
    Guid OrganizationId,
    Guid DivisionId,
    Guid AssetTypeId,
    string Code,
    string Name,
    string Criticality,
    string Status,
    double? Latitude,
    double? Longitude,
    long Version);
```

Add PostGIS mappings for `TrackSegment.Geometry` and point locations. Model `Route` as corridor/station context and `TimetableService` as an effective-dated service, departure window, platform assignment, and operating status. Enforce unique codes within organization and applicable division scope. Use retirement timestamps for records referenced by operations.

- [x] **Checklist 17: Implement paginated APIs and permission checks**

Expose the master-data routes plus `/api/railway/timetable-services`. Require read permission for queries and manage permission for create/update/retire. Validate every referenced parent belongs to the same organization.

- [x] **Checklist 18: Write and implement the frontend master-data view**

Test that filters remain in the URL, primary columns survive at 375 px, loading/errors are explicit, and unauthorized manage actions are absent. Implement server-paginated tables with detail drawers using shared UI primitives. Replace fixture-backed route, station, and fleet reads with the generated route/timetable, station, and asset contracts while preserving their current URLs.

- [ ] **Checklist 19: Add and verify the migration**

Run: `dotnet ef migrations add AddRailwayMasterData --project VSRSystemsBackend.Api`

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run from `frontend`: `npm run test:railway && npm run build`

Run from the backend: `powershell -File scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json`

Run from `frontend`: `npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json && npm run check:railway-api`

Expected: migration applies to an empty PostgreSQL test database and all focused tests PASS.

- [ ] **Checklist 20: Commit the deployable master-data slice in each repository**

Backend commit: `feat(railway): add scoped network and asset master data`

Frontend commit: `feat(railway): add persisted master data workspace`

### Task 4: Add Events, Evidence Scanning, Offline Sync, And Railway Realtime

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Shared/RailwayDomainEvent.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/RailwayEventPublisher.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/RailwayCommandReceipt.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Storage/RailwayEvidenceService.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/BackgroundJobs/RailwayEvidenceScanWorker.cs`
- Create: `VSRSystemsBackend.Api/Platform/Storage/IFileMalwareScanner.cs`
- Create: `VSRSystemsBackend.Api/Platform/Storage/ClamAvFileMalwareScanner.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/RailwayOfflineSyncHandler.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/RailwayOfflineCommandRegistry.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Realtime/RailwayRealtimePublisher.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Hubs/RailwayHub.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayEvidenceController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayOfflineSyncController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Contracts/RailwayOfflineSyncContracts.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayInfrastructureTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayOfflineSyncTests.cs`
- Create: `frontend/src/services/railway/realtime/useRailwayRealtime.ts`
- Test: `frontend/tests/railway/railwayRealtime.test.tsx`

**Interfaces:**
- Consumes: Task 1's verified shared audit, transactional outbox, private storage, SignalR, correlation, feature flags, and background dispatcher.
- Produces: Versioned `IRailwayDomainEvent`, `IRailwayEventPublisher`, `IRailwayEvidenceService`, fail-closed malware scanning, `/api/railway/offline-sync`, command receipts, `IRailwayRealtimePublisher`, signed upload contracts, and authorized realtime subscriptions.

- [ ] **Checklist 21: Write failing transactional and isolation tests**

```csharp
[Fact]
public async Task Domain_change_and_outbox_message_commit_atomically()
{
    await Assert.ThrowsAsync<ForcedRollbackException>(() => fixture.ExecuteFailingDomainTransactionAsync());
    Assert.Equal(0, await fixture.CountRailwayEntitiesAsync());
    Assert.Equal(0, await fixture.CountOutboxMessagesAsync());
}

[Fact]
public async Task Railway_hub_rejects_subscription_outside_authorized_division()
{
    var hub = fixture.CreateHub(RailwayTestData.Scope(OrganizationA, DivisionA));
    await Assert.ThrowsAsync<HubException>(() => hub.SubscribeToRailwayStation(StationInDivisionB));
}

[Fact]
public async Task Evidence_finalization_rejects_checksum_or_owner_mismatch()
{
    var result = await fixture.FinalizeEvidenceAsync(OrganizationA, RecordOwnedByOrganizationB, "wrong-sha256");
    Assert.Equal(HttpStatusCode.Forbidden, result.StatusCode);
    Assert.Null(result.EvidenceId);
}

[Fact]
public async Task Evidence_remains_quarantined_when_scanner_is_unavailable()
{
    scanner.ReturnUnavailable();
    var evidence = await fixture.UploadAndFinalizeEvidenceAsync(OrganizationA, RecordOwnedByOrganizationA);
    await scanWorker.RunOnceAsync(CancellationToken.None);
    Assert.Equal(EvidenceScanStatus.Quarantined, await fixture.GetEvidenceStatusAsync(evidence.Id));
}
```

- [x] **Checklist 22: Run tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~RailwayInfrastructureTests|FullyQualifiedName~RailwayOfflineSyncTests"`

Expected: FAIL because event publishing, evidence scanning, offline sync, and Railway hub contracts are absent.

- [x] **Checklist 23: Implement atomic outbox dispatch and idempotent consumption**

```csharp
public interface IRailwayDomainEvent
{
    Guid EventId { get; }
    string EventName { get; }
    int SchemaVersion { get; }
    Guid OrganizationId { get; }
    DateTimeOffset OccurredAt { get; }
    string CorrelationId { get; }
    Guid? CausationId { get; }
}
```

Adapt Railway domain events to the shared transactional outbox verified in Task 1. Persist each event with aggregate changes in one transaction. Use the shared dispatcher leases, attempts, and operator-visible dead-letter state; do not create a Railway outbox table or worker.

- [x] **Checklist 24: Implement signed evidence initiation and finalization**

Initiation validates record ownership, permission, file size, allowed MIME type, and evidence category. Finalization verifies object metadata, checksum, and owner linkage, then leaves evidence quarantined. `RailwayEvidenceScanWorker` streams the object through the platform `IFileMalwareScanner`; only a clean result releases it. Scanner timeout, unavailability, malformed response, or detected malware fails closed and remains quarantined with audit/alert state. Configure the production adapter for ClamAV through `MALWARE_SCANNER_HOST` and `MALWARE_SCANNER_PORT`.

- [x] **Checklist 25: Implement authorized partial-success offline sync**

```csharp
public sealed record RailwayOfflineCommandEnvelope(
    Guid CommandId,
    string IdempotencyKey,
    Guid AggregateId,
    long ExpectedVersion,
    string CommandType,
    JsonElement Payload,
    DateTimeOffset CapturedAt,
    IReadOnlyList<Guid> EvidenceIds);

public enum RailwayOfflineCommandStatus { Accepted, Duplicate, Rejected, Conflicted }

public interface IRailwayOfflineCommandHandler
{
    string CommandType { get; }
    ValueTask<RailwayOfflineCommandResult> HandleAsync(
        RailwayScope scope,
        RailwayOfflineCommandEnvelope command,
        CancellationToken cancellationToken);
}
```

The registry rejects duplicate command-type registrations and unknown command types. The sync handler derives owner scope from authentication, resolves an `IRailwayOfflineCommandHandler`, dispatches commands in per-aggregate order, and stores a receipt keyed by organization/user/idempotency key. It returns one result per command and continues unrelated aggregates after a rejection. Duplicate results return the original authoritative version. Conflict results return safe current-version comparison data. Add tests for duplicate/unknown registrations, mixed batch outcomes, duplicate retry, stale version, cross-tenant IDs, unauthorized assignment, missing evidence, and rollback of only the failed command.

- [x] **Checklist 26: Implement scoped Railway realtime subscriptions**

Expose explicit methods such as `SubscribeToRailwayStation(Guid stationId)` and `SubscribeToRailwayAssignment(Guid assignmentId)`. Check authorization on every subscription and publish minimal invalidation envelopes:

```ts
export type RailwayRealtimeEvent = {
  eventId: string
  type: string
  resourceId: string
  occurredAt: string
}
```

The frontend hook must re-fetch authoritative queries after reconnect.

- [ ] **Checklist 27: Verify infrastructure behavior**

Run backend Railway tests twice to catch non-idempotent consumers.

Run from `frontend`: `npm run test:railway && npm run build`

Expected: atomicity, access isolation, malware quarantine/release, offline partial success/idempotency/conflict, reconnect refresh, and evidence tests PASS.

### Task 5: Build Inspection, Review, And Defect Backend Workflows

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Inspection/InspectionTemplate.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Inspection/InspectionPlan.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Inspection/InspectionRun.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Inspection/Defect.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Inspection/InspectionHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Inspection/DefectHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/Configurations/InspectionConfiguration.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/BackgroundJobs/InspectionScheduleWorker.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayInspectionsController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayDefectsController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Contracts/InspectionContracts.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/InspectionDomainTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/InspectionApiTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/InspectionSchedulingTests.cs`

**Interfaces:**
- Consumes: Master-data target IDs, scope, outbox, evidence, audit, and realtime.
- Produces: Versioned templates, plans, assignments, runs, reviews, defects, `DefectRaised`, and `CriticalDefectRaised`.

- [x] **Checklist 28: Write failing domain-policy tests**

```csharp
[Fact]
public void Published_template_version_is_immutable()
{
    var template = RailwayTestData.CreatePublishedTemplate();
    Assert.Throws<InvalidOperationException>(() => template.Rename("Changed"));
}

[Fact]
public void Submit_rejects_missing_required_evidence()
{
    var run = RailwayTestData.CreateInspectionRunWithRequiredEvidence();
    run.AnswerRequiredItem("item-1", "Pass", evidenceIds: []);
    Assert.Throws<InspectionValidationException>(() => run.Submit(UserA, FixedNow));
}

[Fact]
public void Accepted_run_is_corrected_only_by_amendment()
{
    var run = RailwayTestData.CreateAcceptedInspectionRun();
    Assert.Throws<InvalidOperationException>(() => run.ChangeAnswer("item-1", "Fail"));
    var amendment = run.CreateAmendment(UserA, FixedNow);
    Assert.Equal(run.Id, amendment.AmendsInspectionRunId);
}

[Fact]
public void Critical_finding_raises_critical_defect_event()
{
    var run = RailwayTestData.CreateInspectionRunWithCriticalFinding();
    run.Submit(UserA, FixedNow);
    Assert.Single(run.DomainEvents.OfType<CriticalDefectRaised>());
}
```

- [ ] **Checklist 29: Run domain tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~InspectionDomainTests"`

Expected: FAIL because inspection aggregates are absent.

- [x] **Checklist 30: Implement the minimum domain state machines**

```csharp
public enum InspectionRunStatus { Draft, Submitted, Accepted, Rejected, Amended }
public enum DefectSeverity { Low, Medium, High, Critical }
public enum DefectStatus { Open, Triaged, WorkPlanned, Resolved, Verified, Closed, Rejected }
```

Pin each assignment to an immutable template version. Validate typed checklist responses, configured limits, evidence requirements, location exceptions, review decisions, and amendment linkage inside domain methods.

- [x] **Checklist 31: Write failing API authorization and idempotency tests**

Assert that an inspector can execute only assigned work, a reviewer cannot review outside scope, duplicate submit commands return the original result, and another organization receives a non-disclosing denial.

- [x] **Checklist 32: Implement handlers and APIs**

Implement create/publish template, create plan, generate/list assignments, start/save/submit run, review run, amend run, list/detail defects, and triage defect. Register and test `inspection.start`, `inspection.save-response`, `inspection.attach-evidence`, and `inspection.submit` handlers in `RailwayOfflineCommandRegistry`; each reuses the same authorized application command as the online API. `InspectionScheduleWorker` leases due plan occurrences and creates one assignment per plan/target/due-window idempotency key; tests cover recurring timezone boundaries, disabled plans, missed-run catch-up policy, worker restart, and duplicate execution. Emit outbox events and audit safety-relevant decisions.

- [x] **Checklist 33: Add migration and run the Railway backend suite**

Run: `dotnet ef migrations add AddRailwayInspections --project VSRSystemsBackend.Api`

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run from the backend: `powershell -File scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json`

Run from `frontend`: `npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json && npm run check:railway-api`

Expected: all inspection domain, API, persistence, tenant, and outbox tests PASS.

- [ ] **Checklist 34: Commit the inspection backend slice**

```bash
git add VSRSystemsBackend.Api/Modules/Railway VSRSystemsBackend.Api.Tests/Modules/Railway
git commit -m "feat(railway): add inspection and defect workflows"
```

### Task 6: Build The Offline Inspection PWA Workflow

**Files:**
- Create: `frontend/src/services/railway/inspection/inspection.types.ts`
- Create: `frontend/src/services/railway/inspection/InspectionDashboard.tsx`
- Create: `frontend/src/services/railway/inspection/InspectionTemplates.tsx`
- Create: `frontend/src/services/railway/inspection/InspectionPlans.tsx`
- Create: `frontend/src/services/railway/inspection/InspectionAssignments.tsx`
- Create: `frontend/src/services/railway/inspection/InspectionRunner.tsx`
- Create: `frontend/src/services/railway/inspection/InspectionReview.tsx`
- Create: `frontend/src/services/railway/inspection/DefectRegister.tsx`
- Create: `frontend/src/services/railway/offline/railwayOffline.types.ts`
- Create: `frontend/src/services/railway/offline/railwayOfflineDb.ts`
- Create: `frontend/src/services/railway/offline/railwaySync.ts`
- Modify: `frontend/src/services/railway/api/railwayApi.ts`
- Modify: `frontend/src/services/railway/routes.tsx`
- Modify: `frontend/src/platform/auth/session.ts`
- Create: `frontend/src/platform/api/baseUrl.ts`
- Modify: `frontend/src/platform/api/index.ts`
- Modify: `frontend/src/firebase.ts`
- Create: `frontend/src/service-worker.js`
- Delete: `frontend/public/firebase-messaging-sw.js`
- Create: `frontend/public/pwa/railway-192.png`
- Create: `frontend/public/pwa/railway-512.png`
- Create: `frontend/public/pwa/railway-maskable-512.png`
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/package-lock.json`
- Test: `frontend/tests/railway/inspectionRunner.test.tsx`
- Test: `frontend/tests/railway/railwayOfflineDb.test.ts`
- Test: `frontend/tests/railway/railwaySync.test.ts`
- Test: `frontend/tests/railway/serviceWorker.test.ts`

**Interfaces:**
- Consumes: Inspection APIs, signed uploads, current session, shared states, and Task 2 route shell.
- Produces: `RailwayOfflineDb`, `queueRailwayCommand()`, `syncRailwayQueue()`, and complete inspection field/review screens.

- [ ] **Checklist 35: Write failing offline isolation and recovery tests**

```ts
it('isolates cached assignments by user and organization', async () => {
  await db.putAssignment(scopeA, assignmentA)
  await db.putAssignment(scopeB, assignmentB)
  expect(await db.listAssignments(scopeA)).toEqual([assignmentA])
})

it('keeps rejected and conflicted commands with their evidence references', async () => {
  await db.queue(scopeA, commandWithEvidence)
  await syncRailwayQueue(scopeA, fakeApi.withConflict(commandWithEvidence.commandId))
  expect(await db.getCommand(scopeA, commandWithEvidence.commandId)).toMatchObject({
    state: 'conflicted', evidence: commandWithEvidence.evidence,
  })
})

it('clears railway cache when the authenticated session logs out', async () => {
  await db.putAssignment(scopeA, assignmentA)
  logout()
  await db.whenIdle()
  expect(await db.listAssignments(scopeA)).toEqual([])
})

it('locks authored work on logout and restores it only for the same reauthenticated user', async () => {
  await db.queue(scopeA, commandWithEvidence)
  logout()
  expect(await db.listRecoverableCommands(scopeB)).toEqual([])
  await db.unlockForSession(scopeA)
  expect(await db.listRecoverableCommands(scopeA)).toHaveLength(1)
})

it('purges a field pack after its 72 hour maximum age', async () => {
  await db.putAssignment(scopeA, { ...assignmentA, cachedAt: '2026-08-20T00:00:00Z' })
  await db.purgeExpired(scopeA, new Date('2026-08-23T00:00:01Z'))
  expect(await db.listAssignments(scopeA)).toEqual([])
})

it('retains old unsynchronized user-authored work during reference-pack purge', async () => {
  await db.queue(scopeA, { ...commandWithEvidence, capturedAt: '2026-08-20T00:00:00Z' })
  await db.purgeExpired(scopeA, new Date('2026-08-23T00:00:01Z'))
  expect(await db.getCommand(scopeA, commandWithEvidence.commandId)).not.toBeNull()
})
```

- [ ] **Checklist 36: Run tests and confirm failure**

Run: `npm run test:railway -- railwayOfflineDb railwaySync`

Expected: FAIL because offline storage and sync do not exist.

- [ ] **Checklist 37: Implement the IndexedDB boundary**

```ts
export type OfflineRailwayCommand = {
  commandId: string
  idempotencyKey: string
  aggregateId: string
  expectedVersion: number
  type: string
  payload: unknown
  capturedAt: string
  evidence: readonly { localId: string; sha256: string }[]
  state: 'pending' | 'syncing' | 'accepted' | 'rejected' | 'conflicted'
}
```

Use separate stores for server-derived assignments/reference packs and user-authored drafts, evidence blobs, outbound commands, and sync results. Keys must include user and organization scope. Encrypt authored records with AES-GCM and a non-extractable per-user CryptoKey; Railway DB APIs require the active authenticated user/organization to match that key scope. Set the default `RAILWAY_OFFLINE_PACK_MAX_AGE_HOURS` to 72; at startup and before reads, purge only expired server-derived assignments/reference data and display expiry before download. Retain unsynchronized drafts, evidence, and pending/rejected/conflicted commands until successful sync or an explicit discard requiring current authorization and confirmation. Modify `clearAuthToken()` and `logout()` to dispatch one `vsr:session-cleared` event; the Railway DB listener clears server-derived packs and locks authored stores without deleting their keys/data. The logout UI detects authored work and offers sync, cancel logout, or confirmed discard. On token expiry, authored work remains locked until the same user reauthenticates. After an online permission refresh, remove revoked server packs but keep inaccessible authored records encrypted and offer export/discard through an authorized recovery workflow. Never cache secrets or raw crowd-video data.

- [ ] **Checklist 38: Implement sync with per-command outcomes**

Upload required evidence, call `/api/railway/offline-sync`, record authoritative versions for accepted/duplicate results, and retain error/conflict details for rejected/conflicted results. Retry only network failures and idempotent operations.

- [ ] **Checklist 39: Write failing runner interaction tests**

Test required-item validation, measurement-limit findings, camera/file evidence references, denied geolocation exception reason, draft recovery, offline submission, sync status, review rejection, and accessible field labels.

- [ ] **Checklist 40: Implement inspection pages and PWA configuration**

Run: `npm install --save-dev vite-plugin-pwa`

Use `vite-plugin-pwa` in `injectManifest` mode with `frontend/src/service-worker.js` as the only root-scoped worker. Move the existing Firebase background-message initialization and notification-click handler into that worker and inject the versioned static-asset precache manifest. Extract the current `BASE` resolution into `frontend/src/platform/api/baseUrl.ts`; both the application API and worker consume the same build-time `VITE_API_URL` with the existing production fallback. Change `ensureServiceWorker()` to get or register exactly `/sw.js` without a query string. Add tests for a cross-origin `VITE_API_URL`, that only `/sw.js` is registered, and that each generated manifest icon resolves. Use manifest icons `/pwa/railway-192.png` (`192x192`), `/pwa/railway-512.png` (`512x512`), and `/pwa/railway-maskable-512.png` (`512x512`, purpose `maskable`). Use `registerType: 'prompt'`, navigation fallback limited to application routes, and no caching of authenticated API responses. IndexedDB owns field data.

Implement the template editor/version publisher, plan calendar, assignment planner, “My inspections,” runner, review queue, and defect register routes defined by the architecture; do not leave these as route-shell unavailable states after this task.

- [ ] **Checklist 41: Run frontend checks**

Run: `npm run test:railway`

Run: `npm run build`

Run: `npm run lint -- --deny-warnings`

Expected: all tests and build checks PASS. User validates install, camera, GPS, 375 px layout, and offline/reconnect behavior manually.

- [ ] **Checklist 42: Commit the inspection frontend slice**

```bash
git add frontend/src/services/railway frontend/src/platform/auth/session.ts frontend/src/platform/api frontend/src/firebase.ts frontend/src/service-worker.js frontend/public/firebase-messaging-sw.js frontend/public/pwa frontend/src/app/moduleRegistry.ts frontend/src/Layout.tsx frontend/vite.config.ts frontend/package.json frontend/package-lock.json frontend/tests/railway
git commit -m "feat(railway): add offline inspection workspace"
```

### Task 7: Build Maintenance And Work Order Backend Workflows

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Maintenance/MaintenancePlan.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Maintenance/WorkOrder.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/Maintenance/WorkOrderPolicy.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Maintenance/WorkOrderHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Maintenance/DefectEventHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Persistence/Configurations/MaintenanceConfiguration.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/BackgroundJobs/MaintenanceScheduleWorker.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayWorkOrdersController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Contracts/MaintenanceContracts.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/WorkOrderDomainTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/WorkOrderApiTests.cs`

**Interfaces:**
- Consumes: Defect events, master data, qualifications, evidence, audit, scope, workers, and outbox.
- Produces: Maintenance plans, work orders, assignments, tasks, logs, permits, verification, SLA events, and completion events.

- [x] **Checklist 43: Write failing transition and policy tests**

```csharp
[Theory]
[InlineData(WorkOrderStatus.Draft, WorkOrderStatus.InProgress)]
[InlineData(WorkOrderStatus.Completed, WorkOrderStatus.InProgress)]
public void Invalid_transition_is_rejected(WorkOrderStatus from, WorkOrderStatus to)
{
    var order = RailwayTestData.CreateWorkOrder(from);
    Assert.Throws<InvalidWorkOrderTransitionException>(() => order.TransitionTo(to, UserA, FixedNow, "test"));
}

[Fact]
public void Safety_classified_work_requires_approval_permit_and_independent_verifier()
{
    var order = RailwayTestData.CreateSafetyClassifiedWorkOrder();
    Assert.Throws<WorkOrderPolicyException>(() => order.Start(UserA, FixedNow));
    order.Approve(SupervisorA, FixedNow);
    order.AttachPermit(PermitA, SupervisorA, FixedNow);
    Assert.Throws<WorkOrderPolicyException>(() => order.Verify(UserA, FixedNow));
}

[Fact]
public async Task Critical_defect_event_creates_one_critical_priority_draft_order()
{
    var message = RailwayTestData.CreateCriticalDefectEvent();
    await handler.Handle(message, CancellationToken.None);
    await handler.Handle(message, CancellationToken.None);
    var order = Assert.Single(await repository.ListBySourceEventAsync(message.EventId));
    Assert.Equal(WorkOrderPriority.Critical, order.Priority);
}
```

- [ ] **Checklist 44: Run tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~WorkOrderDomainTests"`

Expected: FAIL because maintenance aggregates and handlers do not exist.

- [x] **Checklist 45: Implement the explicit work-order lifecycle**

```csharp
public enum WorkOrderStatus
{
    Draft, Triaged, Approved, Scheduled, InProgress,
    Blocked, AwaitingVerification, Completed, Cancelled
}
```

Domain methods own transitions and require actor, timestamp, reason where applicable, expected version, and policy evidence. Completion creates immutable history and a follow-up order is required for new work.

- [ ] **Checklist 46: Implement maintenance plans, scheduling, SLA, and event handlers**

Generate work idempotently from preventive plans. Calculate SLA from priority and safety class. Pausing SLA requires an allowed block reason. A critical defect automatically creates one critical-priority draft order; a high defect creates one high-priority draft order; medium and low defects remain in the triage queue until a planner explicitly creates work. Event handlers never directly update Inspection tables.

- [ ] **Checklist 47: Implement APIs and authorization tests**

Cover create, triage, approve, schedule, assign, start, block/unblock, task completion, labor/material logging, permit attachment, submit verification, verify, reject verification, cancel, and history. Register and test `work-order.start`, `work-order.complete-task`, `work-order.log-labor`, `work-order.use-material`, `work-order.attach-permit`, `work-order.attach-evidence`, `work-order.block`, `work-order.unblock`, and `work-order.submit-verification` handlers in `RailwayOfflineCommandRegistry`; each reuses the online application command and assignment authorization. Enforce assignment for technician execution and separate verifier policy.

- [ ] **Checklist 48: Add migration and run tests**

Run: `dotnet ef migrations add AddRailwayMaintenance --project VSRSystemsBackend.Api`

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run from the backend: `powershell -File scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json`

Run from `frontend`: `npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json && npm run check:railway-api`

Expected: all Railway tests PASS, including duplicate defect-event delivery.

- [ ] **Checklist 49: Commit the maintenance backend slice**

```bash
git add VSRSystemsBackend.Api/Modules/Railway VSRSystemsBackend.Api.Tests/Modules/Railway
git commit -m "feat(railway): add maintenance work order lifecycle"
```

### Task 8: Build Maintenance Planning And Offline Technician Screens

**Files:**
- Create: `frontend/src/services/railway/maintenance/maintenance.types.ts`
- Create: `frontend/src/services/railway/maintenance/MaintenanceDashboard.tsx`
- Create: `frontend/src/services/railway/maintenance/WorkOrderList.tsx`
- Create: `frontend/src/services/railway/maintenance/MaintenanceCalendar.tsx`
- Create: `frontend/src/services/railway/maintenance/MaintenancePlans.tsx`
- Create: `frontend/src/services/railway/maintenance/MaintenanceVerification.tsx`
- Create: `frontend/src/services/railway/maintenance/WorkOrderDetail.tsx`
- Create: `frontend/src/services/railway/maintenance/MyMaintenanceWork.tsx`
- Modify: `frontend/src/services/railway/offline/railwayOffline.types.ts`
- Modify: `frontend/src/services/railway/offline/railwaySync.ts`
- Modify: `frontend/src/services/railway/routes.tsx`
- Test: `frontend/tests/railway/workOrderLifecycle.test.tsx`
- Test: `frontend/tests/railway/maintenanceOffline.test.ts`

**Interfaces:**
- Consumes: Work-order APIs, offline queue, signed evidence, realtime invalidations, and Railway permissions.
- Produces: Planner list/board/calendar surfaces and offline-ready technician execution.

- [ ] **Checklist 50: Write failing role and transition tests**

Test that planners see triage/approval/scheduling actions, technicians see only assigned execution actions, verifiers cannot verify their own safety-classified work, invalid transitions are absent, and server conflicts display comparison/recovery controls.

- [ ] **Checklist 51: Write failing offline technician tests**

```ts
it('retains labor, materials, permit, tasks, and evidence after reconnect conflict', async () => {
  await db.queue(scopeA, executionPackCommand)
  await syncRailwayQueue(scopeA, fakeApi.withConflict(executionPackCommand.commandId))
  expect(await db.getCommand(scopeA, executionPackCommand.commandId)).toMatchObject({
    state: 'conflicted', payload: executionPackCommand.payload, evidence: executionPackCommand.evidence,
  })
})

it('prevents final submission until required permit and evidence are synced', async () => {
  render(<MyMaintenanceWork order={orderWithPendingPermit} />)
  expect(screen.getByRole('button', { name: 'Submit for verification' })).toBeDisabled()
  expect(screen.getByText('Permit upload is still pending')).toBeVisible()
})
```

- [ ] **Checklist 52: Run focused tests and confirm failure**

Run: `npm run test:railway -- workOrderLifecycle maintenanceOffline`

Expected: FAIL because maintenance screens and command types do not exist.

- [ ] **Checklist 53: Implement planner and supervisor views**

Add URL-backed filters, server pagination, status board, team-capacity calendar, preventive-maintenance plan editor, work-order detail, immutable history, SLA indicators, assignment, approval, and a dedicated verification queue. Use status text/icons in addition to color. Implement every maintenance route listed in the architecture; this task removes the maintenance route-shell unavailable states.

- [ ] **Checklist 54: Extend offline packs and sync for technician commands**

Support start, task completion, labor log, material usage, permit, evidence, block/unblock, and submit-verification commands. Preserve command order per aggregate while allowing unrelated aggregate queues to continue.

- [ ] **Checklist 55: Verify frontend quality**

Run: `npm run test:railway`

Run: `npm run build`

Run: `npm run lint -- --deny-warnings`

Expected: all checks PASS. User manually validates 375 px technician execution and desktop planner density.

- [ ] **Checklist 56: Commit the maintenance frontend slice**

```bash
git add frontend/src/services/railway frontend/tests/railway
git commit -m "feat(railway): add maintenance planning and field work"
```

### Task 9: Build Crowd Ingestion, Risk, Alerts, And Incidents Backend

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/CrowdOperations/CrowdSource.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/CrowdOperations/CrowdObservation.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/CrowdOperations/CrowdThresholdPolicy.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/CrowdOperations/CrowdAlert.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Domain/CrowdOperations/CrowdIncident.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/CrowdOperations/CrowdHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Ingestion/ManualCrowdAdapter.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Ingestion/CsvCrowdAdapter.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/BackgroundJobs/CrowdRiskWorker.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayCrowdController.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Contracts/CrowdContracts.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/CrowdDomainTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/CrowdApiTests.cs`

**Interfaces:**
- Consumes: Station zones, scope, audit, outbox, background jobs, realtime, and evidence/import storage.
- Produces: Normalized observations, source health, risk snapshots, threshold alerts, incidents, response actions, and `CrowdThresholdBreached`.

- [ ] **Checklist 57: Write failing privacy, normalization, and threshold tests**

```csharp
[Fact]
public void Observation_contract_contains_no_person_or_device_identifier()
{
    var names = typeof(NormalizedCrowdObservation).GetProperties().Select(property => property.Name).ToHashSet();
    Assert.DoesNotContain("PersonId", names);
    Assert.DoesNotContain("DeviceId", names);
    Assert.DoesNotContain("Face", names);
    Assert.DoesNotContain("Video", names);
}

[Fact]
public async Task Duplicate_source_event_is_idempotent()
{
    var observation = RailwayTestData.CreateObservation(sourceEventId: "source-event-1");
    await handler.Handle(observation, CancellationToken.None);
    await handler.Handle(observation, CancellationToken.None);
    Assert.Equal(1, await repository.CountBySourceEventIdAsync("source-event-1"));
}

[Fact]
public void Stale_low_confidence_data_is_degraded_not_normal()
{
    var snapshot = calculator.Calculate([RailwayTestData.CreateStaleLowConfidenceObservation()]);
    Assert.Equal(CrowdDataQuality.Degraded, snapshot.DataQuality);
}

[Fact]
public void Threshold_breach_creates_one_open_alert_and_event()
{
    var state = RailwayTestData.CreateCrowdRiskState();
    state.Apply(CriticalSnapshot, FixedNow);
    state.Apply(CriticalSnapshot with { Count = CriticalSnapshot.Count + 5 }, FixedNow.AddMinutes(1));
    Assert.Single(state.OpenAlerts);
    Assert.Single(state.DomainEvents.OfType<CrowdThresholdBreached>());
}
```

- [ ] **Checklist 58: Run tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~CrowdDomainTests|FullyQualifiedName~CrowdApiTests"`

Expected: FAIL because Crowd Operations does not exist.

- [ ] **Checklist 59: Implement source, observation, policy, alert, and incident models**

```csharp
public sealed record NormalizedCrowdObservation(
    Guid OrganizationId,
    Guid DivisionId,
    Guid StationId,
    Guid StationZoneId,
    Guid SourceId,
    string SourceEventId,
    DateTimeOffset WindowStart,
    DateTimeOffset WindowEnd,
    int Count,
    int? Inflow,
    int? Outflow,
    decimal Confidence,
    IReadOnlySet<string> QualityFlags);
```

Use effective-dated threshold policies and auditable overrides. Keep original and override values. Store aggregate observations only.

- [ ] **Checklist 60: Implement manual and staged CSV ingestion**

Manual input uses authenticated operator permissions. CSV upload parses into staging rows, returns row-level errors, and requires approval before observations become authoritative. Duplicate source event IDs are harmless.

- [ ] **Checklist 61: Implement risk, alert, and incident workflows**

Calculate occupancy, trend, freshness, confidence, and risk level by zone/station. Create/update alerts, acknowledgement timers, escalation, versioned playbooks, response actions, incidents, and closure. Publish minimal realtime invalidations.

- [ ] **Checklist 62: Add migration and run tests**

Run: `dotnet ef migrations add AddRailwayCrowdOperations --project VSRSystemsBackend.Api`

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run from the backend: `powershell -File scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json`

Run from `frontend`: `npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json && npm run check:railway-api`

Expected: all Railway tests PASS, including stale data and source isolation.

- [ ] **Checklist 63: Commit the crowd backend slice**

```bash
git add VSRSystemsBackend.Api/Modules/Railway VSRSystemsBackend.Api.Tests/Modules/Railway
git commit -m "feat(railway): add crowd operations and alerting"
```

### Task 10: Build The Station Crowd Command Center

**Files:**
- Create: `frontend/src/services/railway/crowd/crowd.types.ts`
- Create: `frontend/src/services/railway/crowd/CrowdCommandCenter.tsx`
- Create: `frontend/src/services/railway/crowd/CrowdStationView.tsx`
- Create: `frontend/src/services/railway/crowd/CrowdAlerts.tsx`
- Create: `frontend/src/services/railway/crowd/CrowdSources.tsx`
- Create: `frontend/src/services/railway/crowd/CrowdImports.tsx`
- Create: `frontend/src/services/railway/crowd/CrowdAnalytics.tsx`
- Modify: `frontend/src/services/railway/routes.tsx`
- Modify: `frontend/src/services/railway/railway.css`
- Test: `frontend/tests/railway/crowdCommandCenter.test.tsx`
- Test: `frontend/tests/railway/crowdImports.test.tsx`

**Interfaces:**
- Consumes: Crowd APIs, station/zone data, map capability, realtime hook, and permission constants.
- Produces: Multi-station overview, station-zone risk view, source health, alert queue, incident response, manual entry, and CSV import UI.

- [ ] **Checklist 64: Write failing command-center state tests**

Test normal/warning/critical/degraded states, data age and confidence display, realtime invalidation followed by REST refresh, alert acknowledgement, overdue escalation, manual entry, and failed-source fallback.

- [ ] **Checklist 65: Write failing import tests**

Test upload validation summary, row-level errors, approval permission, idempotent retry, and rejection without publishing observations.

- [ ] **Checklist 66: Run tests and confirm failure**

Run: `npm run test:railway -- crowdCommandCenter crowdImports`

Expected: FAIL because crowd screens do not exist.

- [ ] **Checklist 67: Implement command and station views**

Show station selector, zone map, occupancy/flow, freshness, confidence, trend, active alerts, acknowledgement timer, incident timeline, response playbook, and team actions. Use existing map primitives and a table/list fallback so information is not map-only.

- [ ] **Checklist 68: Implement source and import administration**

Show source status, last observation, lag, confidence, rejection rate, enabled state, and credential rotation metadata without exposing secrets. Add manual count, staged CSV, and historical analytics/forecast-quality workflows. Manual entry remains available when live adapters are disabled or degraded. Implement every Crowd route listed in the architecture; this task removes the Crowd route-shell unavailable states except vendor-specific adapter configuration gated by `RAILWAY_LIVE_ADAPTERS_ENABLED`.

- [ ] **Checklist 69: Verify frontend checks**

Run: `npm run test:railway`

Run: `npm run build`

Run: `npm run lint -- --deny-warnings`

Run: `npm run check:chunks`

Expected: all checks PASS. User manually validates desktop command density, mobile incident response, keyboard navigation, and map/list equivalence.

- [ ] **Checklist 70: Commit the crowd frontend slice**

```bash
git add frontend/src/services/railway frontend/tests/railway
git commit -m "feat(railway): add station crowd command center"
```

### Task 11: Add Secure Live Crowd Adapter Contracts

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/CrowdOperations/ICrowdObservationAdapter.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Ingestion/CrowdAdapterAuthenticator.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Ingestion/CrowdIngestionService.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/Ingestion/CrowdQuarantineRecord.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayCrowdIngestionController.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/CrowdAdapterContractTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/CrowdIngestionSecurityTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/CrowdIngestionCapacityTests.cs`

**Interfaces:**
- Consumes: Normalized observation handler, source registry, secret manager, rate limiting, correlation, and audit.
- Produces: One stable adapter interface for approved gate, CCTV-analytics, Wi-Fi aggregate, and IoT providers.

- [ ] **Checklist 71: Write failing adapter contract and security tests**

```csharp
public interface ICrowdObservationAdapter
{
    string AdapterType { get; }
    ValueTask<IReadOnlyList<NormalizedCrowdObservation>> NormalizeAsync(
        CrowdAdapterEnvelope envelope,
        CancellationToken cancellationToken);
}
```

Test invalid signature, expired timestamp, replayed nonce, disabled source, wrong organization, excessive rate, malformed payload, future-invalid observation, and valid credential rotation overlap.

- [ ] **Checklist 72: Run tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~CrowdAdapterContractTests|FullyQualifiedName~CrowdIngestionSecurityTests"`

Expected: FAIL because live ingestion contracts are absent.

- [ ] **Checklist 73: Implement the provider-neutral ingestion boundary**

Authenticate source credentials independently from user JWTs. Verify HMAC signature, timestamp, nonce, body digest, source state, and owner scope. Normalize provider payloads through registered adapters and submit through the same application handler used by manual/CSV inputs.

- [ ] **Checklist 74: Implement quarantine and replay tooling**

Quarantine malformed batches with safe diagnostics and redacted payload metadata. Authorized replay uses the original source event IDs and remains idempotent. Expose source health and quarantine counts, not raw secrets.

- [ ] **Checklist 75: Run tests and capacity probe**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run the capacity test against a local disposable PostgreSQL/SignalR environment:

```powershell
$env:RUN_RAILWAY_CAPACITY_TESTS='true'
dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~CrowdIngestionCapacityTests"
```

The test uses Task 1's guarded Testcontainers PostgreSQL/PostGIS fixture and an in-process SignalR test server. It sends 100 synthetic aggregate observations per second for 10 minutes across 20 stations. It asserts p95 accepted-ingestion latency below 1 second, risk backlog age below 30 seconds, SignalR invalidation delay below 5 seconds, and zero lost accepted source event IDs. Record measured values in the Railway runbook.

Expected: security and idempotency tests PASS; the capacity test meets all four thresholds with no unbounded queue growth.

- [ ] **Checklist 76: Commit the adapter framework**

```bash
git add VSRSystemsBackend.Api/Modules/Railway VSRSystemsBackend.Api.Tests/Modules/Railway
git commit -m "feat(railway): add secure crowd adapter framework"
```

### Task 12: Connect Cross-Capability Automation, Notifications, Reports, And Advisory AI

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/RailwayIntegrationEventHandlers.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/RailwayNotificationPolicies.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/RailwayReportService.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Application/Shared/RailwayAiAdvisoryService.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/API/Controllers/RailwayReportsController.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayIntegrationFlowTests.cs`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayAiSafetyTests.cs`
- Modify: `frontend/src/services/railway/RailwayWorkspace.tsx`
- Create: `frontend/src/services/railway/shared/RailwayActivityFeed.tsx`
- Test: `frontend/tests/railway/railwayOverview.test.tsx`

**Interfaces:**
- Consumes: Outbox events, work-order commands, notifications, reports, AI gateway, and all three capability query APIs.
- Produces: Incident-to-work-order commands, work-completion-to-defect updates, integrated overview, notifications, reports, and advisory summaries. Task 7's `DefectEventHandlers` remains the sole owner of defect-to-work-order creation.

- [ ] **Checklist 77: Write failing end-to-end application-flow tests**

```csharp
[Fact]
public async Task Critical_defect_creates_one_order_notifies_roles_and_updates_overview()
{
    var message = RailwayTestData.CreateCriticalDefectEvent();
    await dispatcher.PublishTwiceAsync(message);
    Assert.Single(await workOrders.ListBySourceEventAsync(message.EventId));
    Assert.Contains(await notifications.ListAsync(), item => item.Type == "railway.critical-defect");
    Assert.Equal(1, (await dashboard.GetAsync(OrganizationA, DivisionA)).CriticalDefects);
}

[Fact]
public async Task Completed_order_resolves_but_does_not_rewrite_source_defect_history()
{
    var before = await defects.GetHistoryAsync(DefectA);
    await dispatcher.PublishAsync(RailwayTestData.CreateWorkOrderCompletedEvent(DefectA));
    var after = await defects.GetHistoryAsync(DefectA);
    Assert.Equal(before.Count + 1, after.Count);
    Assert.Equal(DefectStatus.Resolved, after[^1].Status);
}

[Fact]
public async Task Crowd_incident_can_create_a_linked_order_through_application_command()
{
    var result = await handler.CreateWorkOrderAsync(CrowdIncidentA, UserA, CancellationToken.None);
    var order = await workOrders.GetAsync(result.WorkOrderId);
    Assert.Equal(CrowdIncidentA, order.SourceId);
    Assert.Equal(WorkOrderSource.CrowdIncident, order.SourceType);
}
```

- [ ] **Checklist 78: Write failing AI safety tests**

Reject prompts or tool requests that attempt signalling, route control, evacuation execution, isolation, or return-to-service. Assert that responses include source references, generated time, provider/model metadata, and advisory status.

- [ ] **Checklist 79: Run tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~RailwayIntegrationFlowTests|FullyQualifiedName~RailwayAiSafetyTests"`

Expected: FAIL because cross-capability policies and advisory boundary are absent.

- [ ] **Checklist 80: Implement idempotent event handlers and policies**

Keep one owner per effect. `DefectEventHandlers` from Task 7 alone consumes `CriticalDefectRaised`/`DefectRaised` to create work orders. `RailwayIntegrationEventHandlers` consumes `WorkOrderCompleted` to call the Defect resolution command. Crowd incident work is created by an explicit authorized application command. Notification handlers may consume the same events but cannot create work. All handlers call target capability commands, never write another capability's tables, and store consumed event IDs. Delivery failure never rolls back operational state.

- [ ] **Checklist 81: Implement reports and advisory AI**

Generate inspection, defect ageing, work-order SLA, crowd incident, and source-health reports as background jobs with signed private outputs. Send only approved, minimized data to AI and store provenance plus human acceptance when advice affects work.

- [ ] **Checklist 82: Implement the persisted integrated overview**

Replace fixture KPI and activity values with one scoped dashboard query for due inspections, critical defects, crowd risk, active incidents, overdue work, asset health, and recent auditable activity. Keep existing routes/stations/fleet available while converting their values to persisted APIs.

- [ ] **Checklist 83: Verify integration and frontend checks**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~Railway"`

Run from `frontend`: `npm run test:railway && npm run build && npm run check:chunks`

Expected: all checks PASS and duplicate event delivery causes no duplicate work or notifications.

### Task 13: Harden Security, Observability, Migrations, And Deployment

**Files:**
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/RailwayTelemetry.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/RailwayHealthChecks.cs`
- Create: `VSRSystemsBackend.Api/Modules/Railway/Infrastructure/RailwayRateLimitPolicies.cs`
- Create: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwaySecurityTests.cs`
- Create: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayMigrationTests.cs`
- Modify: `VSRSystemsBackend.Api/appsettings.json`
- Modify: `VSRSystemsBackend.Api/Program.cs`
- Modify: `render.yaml` in the backend repository
- Modify: `netlify.toml` (the repository-root file declares `base = "frontend"` and is the active Netlify configuration)
- Create: `docs/services/VSR_Railway_Operations_Runbook.md`

**Interfaces:**
- Consumes: Current OpenTelemetry, health, logging, secret, rate-limit, Netlify, Render, Supabase, and feature-flag conventions.
- Produces: Railway metrics/traces, readiness checks, rate limits, secure headers, migration verification, rollback steps, alerts, and operator ownership.

- [ ] **Checklist 84: Write failing security boundary tests**

Cover cross-organization IDs in routes and bodies, cross-division resources, station and assignment ownership, permission combinations, export access, SignalR groups, evidence URLs, source credentials, replay, and non-disclosing forbidden/not-found behavior.

- [ ] **Checklist 85: Write failing migration and health tests**

Use the Task 1 Testcontainers fixture only. Apply all migrations to a fresh `postgis/postgis:16-3.4` container, upgrade a previous Railway schema snapshot in a second container, verify PostGIS extension plus required indexes/constraints, and assert readiness fails for required database/outbox dependencies while liveness remains process-only. The test aborts before migration if the connection does not match the fixture container host and random port.

- [ ] **Checklist 86: Run focused tests and confirm failure**

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~RailwaySecurityTests|FullyQualifiedName~RailwayMigrationTests"`

Expected: FAIL until policies, checks, and migration assertions are complete.

- [ ] **Checklist 87: Add Railway telemetry and alertable metrics**

Record API latency/error, database pressure, outbox age/dead letters, worker failures, crowd freshness/lag/confidence, realtime reconnect/fan-out, sync outcomes, upload failures, overdue inspections, defect ageing, SLA risk, and alert acknowledgement. Do not put tenant identifiers, evidence content, secrets, or personal data in metric dimensions.

- [ ] **Checklist 88: Add production configuration and runbook**

Document current platform connection/JWT/storage variables without renaming them. Configure Netlify `VITE_API_URL` with the deployed Render API origin and verify both the application API client and generated `/sw.js` resolve Firebase configuration against that origin in a production build. Add and document `RAILWAY_ENABLED`, `RAILWAY_INSPECTION_ENABLED`, `RAILWAY_MAINTENANCE_ENABLED`, `RAILWAY_CROWD_ENABLED`, `RAILWAY_LIVE_ADAPTERS_ENABLED`, `RAILWAY_AI_ENABLED`, `RAILWAY_OUTBOX_BATCH_SIZE`, `RAILWAY_OUTBOX_POLL_SECONDS`, `RAILWAY_CROWD_STALE_SECONDS`, `RAILWAY_OFFLINE_PACK_MAX_AGE_HOURS` with default `72`, `RAILWAY_MAX_EVIDENCE_BYTES`, `RAILWAY_ALLOWED_EVIDENCE_TYPES`, `MALWARE_SCANNER_HOST`, and `MALWARE_SCANNER_PORT`. Return the offline-pack maximum age through `/api/railway/capabilities`; do not expose scanner details.

Add a private, non-public `vsr-malware-scanner` Render service using image `clamav/clamav:1.4` on internal TCP port `3310`, with signature updates enabled and the backend's `MALWARE_SCANNER_HOST` bound to the private service hostname. Railway readiness fails when evidence uploads are enabled and the scanner cannot accept a health probe. Deployment smoke tests upload the EICAR test file and assert quarantine, then upload a clean fixture and assert release. Rollback disables new evidence uploads through a feature flag; it never bypasses scanning or releases quarantined evidence. Updating the Render blueprint does not deploy it until the user explicitly approves deployment.

Document secret source, PostGIS setup, worker process, WebSocket support, storage bucket, migration command, health URLs, dashboards, alert owners, credential rotation, source disablement, dead-letter replay, backup restore, rollback, and incident escalation. Include exact safe commands used by the repositories.

- [ ] **Checklist 89: Verify release candidates locally**

Backend:

```bash
dotnet restore
dotnet build --no-restore
dotnet test --no-build
dotnet test VSRSystemsBackend.Api.Tests --no-build --filter "FullyQualifiedName~RailwayMigrationTests"
powershell -File scripts/export-railway-openapi.ps1 -OutputPath artifacts/openapi/railway.json
```

Frontend:

```bash
npm ci
npm run check:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json
npm run test:railway
npm run build
npm run lint -- --deny-warnings
npm run check:chunks
npm run check:legacy-ui
```

Expected: all commands PASS against disposable development infrastructure.

- [ ] **Checklist 90: Commit the hardening chunk in each repository**

Backend commit: `chore(railway): harden production operations`

Frontend/docs commit: `chore(railway): add production deployment controls`

### Task 14: Complete Release Acceptance, Fixture Retirement, Pull Requests, And Handoff

**Files:**
- Modify: `frontend/src/services/railway/RailwayWorkspace.tsx`
- Modify: `frontend/src/services/railway/railway.css`
- Modify: `frontend/src/app/moduleRegistry.ts`
- Modify: `frontend/src/Layout.tsx`
- Modify: `docs/services/TODO.md`
- Modify: `docs/services/VSR_Railway_Operations_Runbook.md`
- Test: `VSRSystemsBackend.Api.Tests/Modules/Railway/RailwayAcceptanceTests.cs`
- Test: `frontend/tests/railway/railwayAcceptance.test.tsx`

**Interfaces:**
- Consumes: Every previous task and production-like test configuration.
- Produces: Verified release candidates, truthful Railway overview, no authoritative fixtures, updated status documentation, and open frontend/backend pull requests.

- [ ] **Checklist 91: Add backend acceptance scenarios**

Automate these API/application scenarios:

1. Organization A cannot read or mutate Organization B data.
2. Plan to offline inspection sync to review to defect to work-order completion.
3. Preventive plan to assignment to execution to independent verification.
4. Manual crowd observation to breach to acknowledgement to incident closure.
5. Crowd incident to linked work order.
6. Duplicate commands and events create no duplicate state.
7. Outbox outage recovers without losing committed events.
8. Backup-restored database passes Railway health and data-integrity checks.

- [ ] **Checklist 92: Add frontend acceptance tests**

Assert route availability by permission, URL-backed filters, explicit async states, offline conflict recovery, realtime refresh, accessible labels, no raw fixture KPIs presented as live, and primary field actions usable in a 375 px DOM viewport.

- [ ] **Checklist 93: Run all automated verification**

Run all backend tests and migration checks from Task 13.

Run all frontend checks from Task 13.

Run: `git diff --check`

Expected: all commands PASS with no whitespace errors.

- [ ] **Checklist 94: Perform user-owned manual validation**

Provide the user a checklist for 375 px, 768 px, and 1280 px layouts; keyboard navigation; screen-reader names; PWA install/update; camera; GPS permission denial; offline/reconnect; large evidence upload; crowd source failure; desktop command-center density; and map/list parity. Record results and defects in the runbook. Do not launch browser automation without explicit user approval.

- [ ] **Checklist 95: Retire only replaced Railway fixtures**

Remove `routeRows`, `stations`, `fleet`, and static KPI/activity data only after their persisted query paths pass acceptance. Keep clearly labelled demonstration seed data in development database migrations or seed tools, never embedded as production UI truth.

- [ ] **Checklist 96: Update status documents accurately**

Mark the Railway backend item complete in `docs/services/TODO.md` only when backend persistence, authorization, frontend integration, deployment checks, and tests pass. Recalculate status totals. Record limitations such as adapter vendors not yet approved without describing the core Railway module as complete if production gates remain open.

- [ ] **Checklist 97: Inspect and commit final intended changes**

In each repository run:

```bash
git status
git diff
git log --oneline -10
```

Stage only intended Railway, test, runbook, and updated Markdown files. Commit remaining changes with concise repository-style messages. Do not amend, force-push, or include unrelated worktree changes.

- [ ] **Checklist 98: Push feature branches and create pull requests**

Push the frontend feature branch and open a pull request targeting `luxinfra-frontend`.

Push the backend feature branch and open a pull request targeting `develop03`.

Each PR description must include scope, architecture link, migrations, environment changes, validation command results, manual validation still required, security/privacy notes, adapter limitations, rollback steps, and known risks. Leave both PRs open and unmerged for user approval.

## Completion Definition

The plan is complete only when all 14 tasks are checked, automated repository checks pass, user-owned manual validation is recorded, the architecture and runbook match shipped behavior, and the two feature-branch pull requests are open and unmerged.
