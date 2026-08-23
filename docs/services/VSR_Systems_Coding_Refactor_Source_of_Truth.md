# VSR Systems — Coding Refactor Source of Truth

> **Purpose:** This file is the implementation guide for restructuring the current large VSR Systems codebase without changing the current free-tier deployment model.
>
> **Priority:** Reduce code coupling, agent context size, build risk, and future maintenance cost.
>
> **Do not redesign the products. Do not rewrite working features. Refactor structure incrementally.**

---

# 1. Non-Negotiable Deployment Model

Keep the current deployment exactly as one system:

```text
ONE React frontend        -> Netlify
ONE ASP.NET Core backend  -> Render
ONE production database   -> Supabase PostgreSQL
```

Repository promotion rule:

```text
Frontend production      -> merge/push to luxinfra-frontend
Backend integration      -> raise a PR targeting develop03
```

Do not push backend feature work directly to another deployment branch unless the user explicitly changes this rule.

MVP configuration rule:

```text
Shared non-secret defaults  -> appsettings.json
Local PostgreSQL/settings  -> appsettings.Development.json
Cloud credentials/settings -> appsettings.Production.json
Phase 3 secret storage      -> Azure Key Vault
```

ASP.NET Core environment variables may override either environment file during deployment.

Do NOT introduce now:

```text
Microservices
Multiple Render services
Multiple Netlify apps
Multiple Supabase projects
Kafka
RabbitMQ
Kubernetes
API Gateway
Service Discovery
```

Future extraction must remain possible, but it is not part of this refactor.

---

# 2. Architecture

Use:

> **Module-Isolated Modular Monolith**

Meaning:

```text
ONE deployable application
        +
many internally isolated product modules
        +
a small shared platform
```

Current business modules:

```text
home-services
warehouse
school
hotel
travel
jobs
news
commerce
banking
healthcare
interior-design
```

Golden rule:

```text
Business Module -> Platform      ALLOWED
Business Module -> Same Module   ALLOWED
Business Module -> Other Module  NOT ALLOWED
```

Example:

```text
School -> Platform/Maps          OK
School -> Warehouse              NO
Hotel -> Travel internals        NO
Jobs -> Commerce internals       NO
```

---

# 3. IMPORTANT: Do Not Perform a Massive Rename

The current frontend already uses:

```text
frontend/src/services/<business-service>
```

Keep this path for now.

Do NOT move the entire codebase from:

```text
src/services/
```

to:

```text
src/modules/
```

in one operation.

Treat every folder inside `src/services/` as a **business module**.

Target frontend:

```text
frontend/src/
│
├── app/
│   ├── router/
│   ├── providers/
│   ├── config/
│   └── moduleRegistry.ts
│
├── platform/                 # shared reusable capabilities
│   ├── api/
│   ├── auth/
│   ├── permissions/
│   ├── layout/
│   ├── ui/
│   ├── dashboard/
│   ├── maps/
│   ├── attendance/
│   ├── notifications/
│   ├── documents/
│   ├── tables/
│   ├── charts/
│   ├── forms/
│   ├── search/
│   ├── audit/
│   ├── settings/
│   └── utils/
│
└── services/                 # business modules
    ├── home-services/
    ├── warehouse/
    ├── school/
    ├── hotel/
    ├── travel/
    ├── jobs/
    ├── news/
    ├── commerce/
    ├── banking/
    ├── healthcare/
    └── interior-design/
```

This gives the required architecture without unnecessary file churn.

---

# 4. Standard Frontend Module Structure

When a business module is changed, move it gradually toward:

```text
services/<module>/
│
├── index.ts
├── routes.tsx
├── navigation.ts
├── permissions.ts
│
├── pages/
├── features/
├── components/
├── api/
├── hooks/
├── types/
├── schemas/
└── utils/
```

Example:

```text
services/school/
├── pages/
├── features/
│   ├── admissions/
│   ├── students/
│   ├── academics/
│   ├── attendance/
│   ├── exams/
│   ├── fees/
│   └── transport/
└── api/
```

Do not refactor untouched features merely for folder consistency.

---

# 5. Shared Platform — What Belongs There

Create `frontend/src/platform/`.

Only genuinely reusable code goes there.

## Shared UI

```text
Button
Input
Select
Modal
Drawer
Tabs
DataTable
Pagination
StatusBadge
Stepper
LoadingState
EmptyState
ErrorState
```

## Dashboard

```text
DashboardShell
KpiCard
WidgetGrid
ChartPanel
QuickActionCard
DateRangeFilter
```

The dashboard UI is shared.

The KPI business logic is NOT shared.

Example:

```text
School owns:
- student count
- attendance %
- pending fees

Warehouse owns:
- stock value
- low stock
- pending GRN

Home Services owns:
- bookings
- revenue
- active professionals
```

## Maps

Shared:

```text
MapCanvas
LocationPicker
Marker
MarkerCluster
RoutePolyline
GeofenceEditor
CurrentLocation
```

Module-owned:

```text
School -> bus routes
Home Services -> service zones/professional tracking
Warehouse -> warehouse/project sites
Travel -> destination/trip maps
```

## Attendance

Shared:

```text
AttendanceCalendar
AttendanceStatus
CheckIn UI
CheckOut UI
GeoCheckIn UI
Shift UI
AttendanceSummary
```

Module-owned:

```text
School -> student/class attendance
Warehouse -> worker attendance
Home Services -> professional arrival/job start
Hotel -> employee shift attendance
```

Do NOT create one giant universal attendance domain model.

---

# 6. Module Registry

Create:

```text
frontend/src/app/moduleRegistry.ts
```

Every module registers:

```text
key
name
baseRoute
navigation
permissions
lazy route loader
enabled flag
```

The registry should drive:

```text
service switcher
module navigation
lazy routes
module visibility
```

Do not scatter this everywhere:

```ts
if (service === "school") ...
if (service === "warehouse") ...
```

---

# 7. Lazy Loading — Mandatory

All business modules must be route-level lazy loaded.

Required:

```text
React.lazy()
dynamic import()
route-based code splitting
```

Goal:

```text
Open School
-> load Platform + School

Do not open Banking
-> Banking code should not be loaded
```

Also lazy load heavy capabilities:

```text
maps
charts
rich editors
PDF viewers
3D/AI screens
large admin pages
```

---

# 8. Backend — Keep Current Clean Architecture

Do NOT rewrite the backend into many deployable APIs.

Keep the current layered solution:

```text
VSRSystemsBackend.Api
VSRSystemsBackend.Application
VSRSystemsBackend.Domain
VSRSystemsBackend.Infrastructure
```

Inside each layer, isolate code by business module.

Target:

```text
Domain/
├── Platform/
└── Modules/
    ├── School/
    ├── Warehouse/
    ├── HomeServices/
    ├── Hotel/
    ├── Travel/
    ├── Jobs/
    ├── News/
    ├── Commerce/
    ├── Banking/
    ├── Healthcare/
    └── InteriorDesign/
```

Use the same pattern inside:

```text
Application/
Infrastructure/
Api/
```

Existing folders do not need to be moved all at once.

When touching an area, place NEW code in the target structure and migrate nearby code only when safe.

---

# 9. Backend Dependency Rule

Allowed:

```text
Module.Application -> Module.Domain
Module.Infrastructure -> Module.Application/Domain
API -> Module.Application
Module -> Platform abstractions
```

Not allowed:

```text
School.Domain -> Warehouse.Domain
Hotel.Application -> Travel.Infrastructure
HomeServices -> School repositories
```

For required cross-module communication, use a small interface or in-process event.

Do not directly access another module's repository.

---

# 10. Platform Backend

Global capabilities only:

```text
Identity
Authentication
Users
Roles
Permissions
Organizations/Tenants
Feature Flags
Settings
File Storage
Notification Delivery
Audit
Branding
```

Do NOT put product business logic into Platform.

---

# 11. Database Strategy

Keep:

```text
ONE Supabase PostgreSQL database
```

Do NOT create separate databases.

## Phase 1

Do not perform a dangerous full database migration just for architecture.

Keep existing tables working.

For NEW module-owned tables, prefer module ownership and naming/schema conventions.

## Target

Logical PostgreSQL schemas:

```text
platform
school
warehouse
home_services
hotel
travel
jobs
news
commerce
banking
healthcare
interior_design
```

Existing public-schema tables can be migrated gradually.

Never move all production tables in one refactor.

---

# 12. DbContext Strategy

Current working `AppDbContext` may remain during the first refactor.

Do NOT split every entity into multiple DbContexts immediately.

Target over time:

```text
PlatformDbContext
SchoolDbContext
WarehouseDbContext
HomeServicesDbContext
HotelDbContext
TravelDbContext
...
```

Migration rule:

```text
New isolated module -> module DbContext allowed
Existing stable module -> migrate only when that module is actively refactored
```

Never block feature work just to complete DbContext separation.

---

# 13. API Routes

New APIs must follow module ownership:

```text
/api/platform/...

/api/school/...
/api/warehouse/...
/api/home-services/...
/api/hotel/...
/api/travel/...
/api/jobs/...
/api/news/...
/api/commerce/...
/api/banking/...
/api/healthcare/...
/api/interior-design/...
```

Do not break existing public API routes merely to rename them.

Old endpoints may remain until safely migrated.

---

# 14. Common Extraction Rule

Do NOT move code into `platform/` just because two files look similar.

Use this rule:

```text
Used once       -> keep inside module
Used twice      -> duplication is acceptable
Used 3+ times   -> consider platform extraction
```

Extract only when behavior is truly the same.

Avoid:

```text
common/
shared2/
helpers-new/
misc/
utils-everything/
```

Use explicit folders such as:

```text
platform/maps/
platform/dashboard/
platform/tables/
```

---

# 15. Refactor Execution Order

Do not refactor all services together.

Use this order.

## Phase 0 — Safety

Before structural changes:

```text
1. Ensure frontend builds.
2. Ensure backend builds.
3. Record existing routes.
4. Record existing API endpoints.
5. Do not change functional behavior.
```

Acceptance:

```text
npm build passes
dotnet build passes
existing login works
existing service switcher works
```

## Phase 1 — Platform Foundation

Create only:

```text
frontend/src/platform/
frontend/src/app/moduleRegistry.ts
```

Move only clearly shared, low-risk code:

```text
UI primitives
tables
charts
layout
API client
auth helpers
permissions helpers
loading/error states
```

Do NOT touch product business logic yet.

## Phase 2 — Lazy Routing

Convert service routes to lazy loading.

Do one module at a time.

Acceptance:

```text
All current URLs continue to work.
Initial frontend bundle decreases.
Unused modules are not loaded on first page.
```

## Phase 3 — Home Services Boundary

Refactor structural coupling only.

Do NOT rebuild features.

Tasks:

```text
organize routes
organize API layer
remove cross-service imports
move generic UI to platform
keep Home Services business logic local
```

Run tests/build.

## Phase 4 — Warehouse Boundary

Same rules.

## Phase 5 — School Boundary

Same rules.

## Phase 6+

Repeat one service at a time:

```text
Hotel
Jobs
News
Commerce
Interior Design
Healthcare
Banking
Travel
```

Do not process multiple large services in one coding-agent session.

---

# 16. Coding-Agent Token Rules

These rules are mandatory.

Before changing a feature:

```text
1. Read this architecture file.
2. Read the target module README if present.
3. Read only target feature files.
4. Read platform files imported by that feature.
5. Do NOT scan every service.
6. Do NOT load all architecture documents.
7. Do NOT rewrite unrelated files.
```

Example task:

```text
Change School Attendance
```

Agent should inspect primarily:

```text
frontend/src/services/school/**attendance**
frontend/src/platform/attendance/
backend/**/School/**Attendance**
```

Agent should NOT inspect:

```text
travel/
banking/
news/
commerce/
home-services/
```

unless a compile-time dependency proves it is necessary.

---

# 17. Per-Task Agent Workflow

For every coding task:

```text
STEP 1
Identify owning module.

STEP 2
Identify whether requirement is:
A. module-specific
B. genuinely shared

STEP 3
Modify the smallest possible file set.

STEP 4
Preserve existing APIs/routes unless change is requested.

STEP 5
Build/test target area.

STEP 6
Run full frontend/backend build before completion.

STEP 7
Report only:
- files changed
- behavior changed
- migrations added
- tests/build result
```

Do not produce long explanations unless requested.

---

# 18. Module README

Create one short README per business module only when that module is refactored.

Example:

```text
frontend/src/services/school/README.md
```

Maximum useful content:

```text
Purpose
Base route
Main feature folders
Main APIs
Permissions
Platform dependencies
Forbidden cross-module dependencies
```

Keep each README concise so coding agents can use it as context.

---

# 19. What Must NOT Change During Structural Refactor

Unless explicitly requested:

```text
UI design
business workflows
database values
existing URLs
existing API response contracts
authentication behavior
permissions behavior
production environment variables
Netlify config
Render config
Supabase project
```

Architecture refactoring must not become product rewriting.

---

# 20. Definition of Done

The architecture migration is successful when:

```text
[ ] One React app still deploys to Netlify.
[ ] One .NET API still deploys to Render.
[ ] One Supabase database remains.
[ ] Every business service has a clear code boundary.
[ ] No service imports another service's business code.
[ ] Shared UI/capabilities live in platform/.
[ ] Business rules remain inside the owning service.
[ ] Routes are lazy loaded.
[ ] Existing functionality still works.
[ ] Coding agents can work on one module without reading the entire repository.
[ ] Future service extraction is possible without current microservice overhead.
```

---

# 21. Final Rule for All Future Development

When adding a new feature, decide its owner first.

```text
Is it specific to School?
-> School

Specific to Warehouse?
-> Warehouse

Specific to Home Services?
-> Home Services

Generic UI/technical capability used widely?
-> Platform
```

Never place a feature in Platform because it "may be useful later."

---

# 22. Immediate First Coding Task

Start only with **Phase 0 + Phase 1**.

Coding-agent instruction:

```text
Refactor VSR Systems toward the Module-Isolated Modular Monolith described in this file.

For this task perform ONLY Phase 0 and Phase 1.

1. Verify current frontend/backend build.
2. Inventory existing shared frontend code.
3. Create frontend/src/platform/.
4. Move only low-risk generic shared code into explicit platform folders.
5. Create app/moduleRegistry.ts using existing services.
6. Do not change business logic.
7. Do not change API contracts.
8. Do not change database schema.
9. Do not move complete business modules.
10. Fix imports.
11. Build frontend and backend.
12. Return a concise list of changed files and build results.

Stop after Phase 1.
```

After Phase 1 is stable, start Phase 2 in a separate coding-agent session.

---

# 23. Current Runtime Contract

As of August 23, 2026:

- Frontend and backend build as separate repositories.
- Every module owns its routes and shared document persistence endpoint.
- Missing optional documents return JSON `null` instead of a failed request.
- Home Services catalog responses include package prices needed by the UI.
- Firebase and backup integrations disable cleanly when unconfigured.
- Development uses local PostgreSQL on port 5433 with sample seed mode and local Redis fallback.
- Production uses Supabase with automatic seeding disabled so real data is never overwritten.
- MVP credentials move to Azure Key Vault in Phase 3.
