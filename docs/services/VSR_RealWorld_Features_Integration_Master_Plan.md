# VSR Systems — Real-World Features Integration Master Plan

> **Purpose:** Coding-agent-ready implementation plan for turning the current VSR Systems modular monolith into a more commercially usable, real-world platform without changing the current deployment model.
>
> **Primary source of truth:** `ProductArchitecture.txt` / `ARCHITECTURE.md`.
>
> **Current architecture to preserve:**
>
> ```text
> ONE React 19 SPA          -> Netlify
> ONE ASP.NET Core API      -> Render
> ONE PostgreSQL database   -> Supabase
> Optional MongoDB          -> chat/document workloads only
> Redis                     -> distributed cache with memory fallback
> SignalR                   -> realtime transport
> Supabase Storage          -> private object storage
> ```
>
> This plan does **not** introduce microservices, Kafka, RabbitMQ, Kubernetes, API Gateway, or separate deployments.

## Verified Implementation Status (2026-08-25)

Legend: 🟢 implemented and verified, 🟡 partially implemented, ⚪ pending.

| Capability / phase | Status | Verified scope |
|---|---|---|
| Existing identity/authentication | 🟢 | Shared login/session and server authentication exist. |
| Existing maps, weather, AI gateways | 🟢 | Shared server-side provider gateways exist. |
| Existing dashboard, attendance, tables, UI | 🟢 | Shared frontend primitives exist. |
| Signed storage and billing confirmation | 🟢 | Upload/download signing, explicit consent, completion verification, and warning-safe email flow exist. |
| Home Services chat and realtime | 🟢 | Authorized booking chat, history, reconnect sync, typing indicators, and read receipts exist. |
| Phase 0 - Safety baseline | 🟢 | Frontend build and backend tests verified for the current feature branches. |
| Phase 1 - Organization foundation | ⚪ | No organization entities, context, API, migration, or tenant-isolation tests. |
| Phase 2 - Permissions foundation | 🟡 | Existing roles/auth checks only; no organization-aware permission platform or `PermissionGate`. |
| Phase 3 - Notification center | 🟡 | Upload email exists; persistent notification center, unread state, APIs, and first module events are pending. |
| Phase 4 - Audit | ⚪ | Platform audit engine and required module integrations are pending. |
| Phase 5 - Documents platform | 🟡 | Signed storage exists; platform document metadata/contracts and three module integrations are pending. |
| Phase 6 - Import/export | ⚪ | Shared engine and initial School/Warehouse/Interior imports and exports are pending. |
| Phase 7 - Reports/PDF | ⚪ | Shared report job/PDF infrastructure and initial outputs are pending. |
| Phase 8 - Workflow/approval | ⚪ | Shared approval engine and initial module workflows are pending. |
| Phase 9 - Settings/flags/branding | 🟡 | Static settings/module flags exist; organization-scoped platform capability is pending. |
| Phase 10 - Outbox/dispatcher | ⚪ | Domain event outbox, dispatcher, and idempotency marker are pending. |
| Phase 11 - Observability/resilience | 🟡 | Serilog, health checks, and `HttpClientFactory` exist; OpenTelemetry and standard resilience remain pending. |
| Phase 12 - Product deepening | 🟡 | Several module APIs exist, but the listed commercial deepening sequences are not complete. |

Branch names such as `realworld-implementation-phase1` through `phase11` contain incremental chat work; they do not represent completion of phases 1-11 in this document.

---

# 1. Mandatory Architecture Rules

The coding agent must obey these rules before making any change.

```text
Business Module -> Same Module      ALLOWED
Business Module -> Platform         ALLOWED
Business Module -> Other Module     NOT ALLOWED
```

Examples:

```text
School -> Platform/Notifications          OK
Warehouse -> Platform/Audit               OK
Interior -> Platform/Documents            OK

School -> Warehouse repository            NOT OK
Interior -> HomeServices internals         NOT OK
Hotel -> Travel business service           NOT OK
```

Additional rules:

1. Keep one frontend deployment.
2. Keep one backend deployment.
3. Keep one PostgreSQL database.
4. Keep existing public routes/API contracts unless a migration is explicitly required.
5. Add new code in the target structure; do not perform cosmetic big-bang moves.
6. Reusable technical/business infrastructure belongs in `platform`.
7. Domain rules remain inside the owning business module.
8. A shared capability must expose contracts/extensions; it must not contain product-specific rules.
9. Check existing platform capability before creating a new abstraction.
10. Source code + runtime tests + Swagger are authoritative for implemented behavior.

---

# 2. Current Platform Capabilities — Reuse, Do Not Rebuild

The current system already has these shared capabilities.

## Frontend

```text
frontend/src/platform/
  api/
  attendance/
  auth/
  billing/
  dashboard/
  maps/
  realtime/
  tables/
  ui/
```

## Backend

```text
Api/Platform/
  Identity/
  AI/
  Chat/
  Health/
  Maps/
  ModuleData/
  Realtime/
  Storage/
  Weather/
```

## Existing infrastructure

```text
PostgreSQL
MongoDB
Redis
SignalR
Supabase Storage
Geoapify
Open-Meteo
AI providers
Resend
Serilog
FluentValidation
AutoMapper
MediatR
Swagger
Health checks
Unit tests
Integration tests
```

### Important

Do not create:

```text
NotificationSignalR2
CommonFileStorageNew
AnotherAuthStore
SecondMapService
NewRedisWrapper
UniversalModuleService
```

Extend the existing platform boundary instead.

---

# 3. Capability Classification

Every new feature must be classified before implementation.

## Type A — Platform Foundation

Used by almost every product and contains no product business rules.

Examples:

```text
Organizations / Tenants
Users / Roles / Permissions
Feature Flags
Settings
Branding
Audit
Notification Delivery
File Storage
Import / Export Infrastructure
Reporting Infrastructure
Observability
Background Job Infrastructure
Domain Event / Outbox Infrastructure
```

Location:

```text
frontend/src/platform/<capability>/
backend:
  Api/Platform/<Capability>/
  Application/Platform/<Capability>/
  Domain/Platform/<Capability>/
  Infrastructure/Platform/<Capability>/
```

---

## Type B — Shared Business Capability With Module Extensions

The engine/UI primitives are reusable, but each module owns its rules.

Examples:

```text
Dashboard
Attendance
Maps / Geofence
Workflow / Approvals
Documents
Search
Notifications
Tasks / Calendar
Billing primitives
Reports
Support / Ticketing
```

Pattern:

```text
Platform engine
    +
Module-specific configuration/rules
```

Example:

```text
Platform/Workflow
    -> workflow engine, states, approval records

Warehouse
    -> "PO above ₹100,000 requires Finance approval"

School
    -> "Leave request requires Manager approval"

Interior
    -> "Quotation requires Client approval"
```

---

## Type C — Module-Only Feature

Used only by one business domain, or its business meaning is unique enough that sharing would create coupling.

Examples:

```text
Warehouse GRN
School Exam Result
Interior BOQ Revision
Hotel Room Allocation
Travel Departure Inventory
Jobs Scraper
News Editorial Revision
Commerce Cart
Bank Ledger Posting
Medical Clinical Encounter
Home Services Professional Assignment
```

Location:

```text
frontend/src/services/<module>/
backend:
  Api/Modules/<Module>/
  Application/<Module>/
  Domain/<Module>/
  Infrastructure/<Module>/
```

---

# 4. Shared Capability Matrix

Legend:

```text
CORE      = expected for this product
USEFUL    = useful but can be phased later
N/A       = do not add unless a real requirement appears
```

| Shared capability | Interior | Warehouse | School | Hotel | Travel | Jobs | News | Commerce | Bank | Medical | Home Services | Railway |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth / Identity | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Organization / Tenant | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| RBAC / Permissions | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Audit / Activity | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Notifications | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Files / Documents | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Import / Export | CORE | CORE | CORE | USEFUL | USEFUL | CORE | USEFUL | CORE | CORE | CORE | CORE | USEFUL |
| PDF / Reports | CORE | CORE | CORE | CORE | CORE | CORE | USEFUL | CORE | CORE | CORE | CORE | CORE |
| Workflow / Approval | CORE | CORE | CORE | USEFUL | USEFUL | USEFUL | CORE | USEFUL | CORE | CORE | CORE | CORE |
| Dashboard primitives | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Global/module search | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Maps / Location | CORE | USEFUL | CORE | USEFUL | CORE | CORE | USEFUL | USEFUL | USEFUL | USEFUL | CORE | CORE |
| Attendance | CORE | CORE | CORE | CORE | N/A | N/A | N/A | N/A | N/A | USEFUL | USEFUL | CORE |
| Realtime | USEFUL | CORE | USEFUL | CORE | CORE | USEFUL | CORE | USEFUL | CORE | USEFUL | CORE | CORE |
| Support / Tickets | USEFUL | USEFUL | CORE | CORE | CORE | CORE | USEFUL | CORE | CORE | CORE | CORE | CORE |
| Feature Flags | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Branding / Settings | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Background Jobs | USEFUL | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Outbox / Events | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |
| Observability | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE | CORE |

### Railway warning

Railway currently has a frontend module but no dedicated backend module/controller family in the current architecture document.

Therefore:

```text
Do not build Railway business persistence on frontend-only state.

Shared platform UI can be reused,
but Railway-specific backend work must first establish a Railway module boundary.
```

---

# 5. Shared Capability 1 — Organizations / Tenancy

## Scope

Create a minimal organization boundary so multiple businesses can use the same deployed platform safely.

Platform owns:

```text
Organization
OrganizationUser
OrganizationModule
OrganizationSettings
OrganizationBranding
```

Platform does NOT own:

```text
School students
Warehouse stock
Interior projects
Hotel rooms
etc.
```

## Suggested domain model

```text
Organization
  Id
  Name
  Slug
  Status
  TimeZone
  Currency
  CreatedAt
  UpdatedAt

OrganizationUser
  OrganizationId
  UserId
  MembershipStatus
  JoinedAt

OrganizationModule
  OrganizationId
  ModuleKey
  IsEnabled
  ConfigurationJson optional
```

## Integration rule

New module-owned records should gradually support:

```text
OrganizationId
```

Do **not** alter every existing production table in one migration.

### Safe adoption order

```text
1. Create organization platform tables.
2. Create one default VSR/demo organization.
3. Associate existing users with default organization.
4. Add CurrentOrganization context.
5. New shared platform records use OrganizationId.
6. Adopt OrganizationId module-by-module.
7. Start with Interior -> Warehouse -> School.
```

## Backend

```text
Application/Platform/Organizations/
  IOrganizationContext.cs
  IOrganizationService.cs
  DTOs/

Domain/Platform/Organizations/
  Organization.cs
  OrganizationUser.cs
  OrganizationModule.cs

Infrastructure/Platform/Organizations/
  OrganizationRepository.cs

Api/Platform/Organizations/
  OrganizationsController.cs
```

## Frontend

```text
platform/organizations/
  api/
  context/
  hooks/
  types/
  components/
```

## Definition of Done

```text
[ ] Existing demo user still works.
[ ] Default organization exists.
[ ] Current organization is server-authoritative.
[ ] User cannot request arbitrary organization data.
[ ] One module demonstrates tenant-scoped reads/writes.
[ ] Tests prove cross-organization access is denied.
```

---

# 6. Shared Capability 2 — Permissions / RBAC

Existing authentication must be reused.

Do not create module-specific auth stores.

## Platform scope

Platform owns:

```text
Role
Permission
RolePermission
UserRole / OrganizationUserRole
Permission evaluation
Permission-aware route/action helpers
```

Modules own permission definitions.

Examples:

```text
warehouse.inventory.view
warehouse.inventory.adjust
warehouse.po.create
warehouse.po.approve

school.student.view
school.student.edit
school.fees.collect
school.reports.export

interior.project.view
interior.boq.edit
interior.quotation.approve
```

## Frontend

```text
platform/permissions/
  PermissionGate.tsx
  usePermissions.ts
  permission.types.ts
```

## Backend

Prefer policy/permission authorization.

Never rely only on hidden frontend buttons.

## Definition of Done

```text
[ ] Backend rejects unauthorized action.
[ ] Frontend hides/disables action.
[ ] Permissions are organization-aware.
[ ] At least Interior, Warehouse and School have module permission lists.
[ ] Tests cover allow + deny paths.
```

---

# 7. Shared Capability 3 — Notification Center

This should be reusable across every product.

Existing SignalR is the transport; do not rebuild it.

## Platform responsibility

```text
Persist notifications
Read/unread state
Notification preferences
Delivery abstraction
SignalR publishing
Email provider integration
Future SMS/WhatsApp/push adapters
Retry/failure tracking
```

## Module responsibility

Modules decide **when** a notification should exist and **who** should receive it.

Examples:

```text
Warehouse:
  low stock
  PO approved
  GRN completed
  dispatch delayed

School:
  fee due
  student absent
  result published
  leave approved

Interior:
  quotation approved
  site milestone completed
  material delayed
  change order submitted

Home Services:
  booking assigned
  professional on the way
  payment/refund update
```

## Entity

```text
Notification
  Id
  OrganizationId
  UserId
  Type
  Title
  Message
  EntityType
  EntityId
  Severity
  IsRead
  ReadAt
  CreatedAt
```

Optional:

```text
NotificationDelivery
  NotificationId
  Channel
  Status
  AttemptCount
  LastAttemptAt
  FailureReason
```

## Backend flow

```text
Module business event
    ->
Notification Application Service
    ->
PostgreSQL save
    ->
SignalR publish
    ->
Browser updates

Later:
    -> Email / WhatsApp / Push adapters
```

## Frontend

```text
platform/notifications/
  NotificationBell.tsx
  NotificationPanel.tsx
  NotificationList.tsx
  useNotifications.ts
  notification.api.ts
```

## API

```text
GET  /api/platform/notifications
GET  /api/platform/notifications/unread-count
POST /api/platform/notifications/{id}/read
POST /api/platform/notifications/read-all
```

## Definition of Done

```text
[ ] Persistent notification survives refresh.
[ ] SignalR updates unread count without polling.
[ ] Authorization prevents reading another user's notification.
[ ] One Warehouse event works.
[ ] One School event works.
[ ] One Interior event works.
```

---

# 8. Shared Capability 4 — Audit / Activity History

## Platform responsibility

Store immutable business activity metadata.

```text
AuditEntry
  Id
  OrganizationId
  UserId
  ModuleKey
  Action
  EntityType
  EntityId
  OldValuesJson
  NewValuesJson
  CorrelationId
  IpAddress optional
  CreatedAt
```

## Module responsibility

Define meaningful business actions.

Good:

```text
warehouse.po.approved
school.fee.received
interior.quotation.revised
```

Bad:

```text
button_clicked
component_opened
```

## API

```text
GET /api/platform/audit?module=&entityType=&entityId=&userId=&from=&to=
```

## Frontend

```text
platform/audit/
  ActivityTimeline.tsx
  AuditTable.tsx
  AuditFilters.tsx
```

## Definition of Done

```text
[ ] Audit is server-generated.
[ ] Audit rows are not editable by ordinary users.
[ ] Warehouse stock adjustment logs before/after.
[ ] School fee change logs before/after.
[ ] Interior quotation revision logs before/after.
```

---

# 9. Shared Capability 5 — Files / Documents

The current shared file implementation is under:

```text
services/operations/fileStorage.ts
```

This is a cross-product capability and should gradually move behind a platform boundary.

Do not break working storage while refactoring.

## Target frontend

```text
platform/documents/
  api/
  components/
  hooks/
  types/
```

## Target backend

Reuse existing:

```text
Api/Platform/Storage
Supabase signed upload/download
```

Add a provider abstraction in Application/Infrastructure if not already present:

```text
IFileStorage
IFileMetadataRepository
```

## Metadata

```text
Document
  Id
  OrganizationId
  ModuleKey
  EntityType
  EntityId
  FileName
  ContentType
  Size
  StorageProvider
  StoragePath
  Category
  Version
  UploadedBy
  UploadedAt
  DeletedAt optional
```

## Module examples

```text
Interior:
  site photo
  design
  quotation
  invoice

Warehouse:
  supplier invoice
  GRN attachment
  damage photo

School:
  student document
  certificate
  fee receipt
```

## Definition of Done

```text
[ ] Existing signed upload still works.
[ ] No module contains Supabase service-role credentials.
[ ] Module uses platform file API, not provider code.
[ ] Metadata persisted separately from binary.
[ ] Authorization checks entity/module access.
```

---

# 10. Shared Capability 6 — Import / Export

This is a commercial P0 feature.

## Platform owns

```text
CSV parsing
Excel parsing
Column mapping UI
Validation result model
Import preview
Error rows
Import progress
CSV export
Excel export
Common file limits
```

## Modules own

```text
Allowed fields
Business validation
Duplicate rules
Entity creation/update rules
Permission requirements
```

## Architecture

```text
Upload file
   ->
Parse
   ->
Map columns
   ->
Module validator
   ->
Preview valid/invalid rows
   ->
User confirms
   ->
Module import command
   ->
Audit result
```

## Initial module integrations

### School

```text
Students
Staff
Fee opening balances
```

### Warehouse

```text
Products
Suppliers
Opening stock
Customers
```

### Interior

```text
Product catalog
Vendors
BOQ lines
```

## Important

Do not create one universal `ImportAnything()` endpoint.

Use a shared engine + module-owned import handlers.

Example:

```text
POST /api/school/import/students
POST /api/warehouse/import/products
POST /api/interior-design/import/vendors
```

## Definition of Done

```text
[ ] Preview before commit.
[ ] Validation errors downloadable.
[ ] Import is transactional where practical.
[ ] Large imports do not freeze browser.
[ ] Audit logs who imported the file.
[ ] Duplicate strategy is module-owned.
```

---

# 11. Shared Capability 7 — Reporting / PDF / Print

## Platform owns

```text
Report request model
Date-range filters
PDF generation adapter
CSV/Excel export adapters
Common branding/header/footer
Download authorization
Report job status
```

## Modules own report definitions

### Interior

```text
BOQ
Quotation
Project Progress
Material Summary
Milestone Invoice
Project Profitability
```

### Warehouse

```text
PO
GRN
Stock Ledger
Stock Valuation
Dispatch Note
Inventory Aging
```

### School

```text
Fee Receipt
Fee Due
Attendance
Report Card
Student List
Staff Attendance
```

## API shape

```text
POST /api/<module>/reports/<report-key>
GET  /api/platform/reports/jobs/{id}
```

Do not centralize module SQL/report business rules in Platform.

---

# 12. Shared Capability 8 — Workflow / Approval Engine

This capability should be shared, but rules remain module-owned.

## Platform entities

```text
WorkflowDefinition
WorkflowStep
WorkflowInstance
WorkflowAction
WorkflowAssignee
```

## Generic states

```text
Draft
Submitted
InReview
Approved
Rejected
Cancelled
```

Modules can add domain statuses, but approval history should use the shared engine where appropriate.

## Initial use cases

### Interior

```text
Quotation
  -> Client Approval

BOQ
  -> Manager Approval

Purchase Request
  -> Procurement Approval
```

### Warehouse

```text
Purchase Order
  -> Manager
  -> Finance for high value

Stock Adjustment
  -> Supervisor Approval
```

### School

```text
Leave Request
  -> Manager

Expense
  -> Accountant
  -> Principal

Admission
  -> Review
  -> Approval
```

## Rule

Platform does not know:

```text
what a PO means
what a BOQ means
what a student admission means
```

It knows:

```text
workflow
step
assignee
action
approval state
history
```

---

# 13. Shared Capability 9 — Settings, Branding and Feature Flags

## Platform owns

```text
OrganizationSettings
Branding
Module enable/disable
Feature flags
Numbering/prefix configuration
Currency
Time zone
Notification preferences
```

## Examples

```text
ABC Interiors:
  Interior = ON
  Warehouse = ON
  School = OFF

XYZ School:
  School = ON
  Warehouse = USEFUL/optional
  Interior = OFF
```

## Frontend

Use the existing module registry.

Extend module visibility from:

```text
static enabled flag
```

toward:

```text
platform default
+
organization entitlement
+
feature flag
+
permission
```

Do not duplicate module visibility logic in individual pages.

---

# 14. Shared Capability 10 — Search

## Phase 1

Use PostgreSQL/searchable APIs.

Do not add Elasticsearch/OpenSearch yet.

## Platform owns

```text
Search UI
Search query contract
Result grouping
Recent search UI optional
```

## Modules own

```text
what is searchable
authorization
ranking fields
result projection
```

Example global result:

```text
"Ramesh"

School:
  Student — Ramesh Kumar

Warehouse:
  Supplier — Ramesh Electricals

Interior:
  Client Project — Ramesh Residence
```

Only return results from modules the current user may access.

---

# 15. Shared Capability 11 — Support / Tickets

## Platform engine

```text
Ticket
TicketComment
TicketAttachment
TicketAssignment
TicketStatusHistory
```

Statuses:

```text
Open
Assigned
InProgress
Waiting
Resolved
Closed
```

Modules attach context:

```text
BookingId
StudentId
ProjectId
OrderId
etc.
```

Do not create separate ticket engines inside every service.

---

# 16. Shared Capability 12 — Domain Events + Outbox

This is technical infrastructure and should be shared.

## Goal

Business transaction and event record succeed/fail together.

```text
Business state update
    +
OutboxMessage insert
    ->
single PostgreSQL transaction
```

Background dispatcher processes the event later.

## Initial events

```text
Warehouse.LowStockDetected
Warehouse.PurchaseOrderApproved

School.FeeReceived
School.StudentAbsent

Interior.QuotationApproved
Interior.MilestoneCompleted

HomeServices.BookingStatusChanged
```

## Do not add RabbitMQ now.

Initial implementation:

```text
PostgreSQL Outbox
+
BackgroundService dispatcher
```

Later a broker can be added without rewriting domain events.

---

# 17. Shared Capability 13 — Background Jobs

Use for work that should not block HTTP requests.

Examples:

```text
Notification retries
Report generation
Import processing
Reminder schedules
Jobs scraper
Stale-record cleanup
Low-stock checks
Email delivery retries
```

Start with:

```text
BackgroundService
```

or the existing scheduling mechanism when already present.

Do not add a second scheduler framework unless required.

---

# 18. Shared Capability 14 — Observability / Resilience

The current platform already has Serilog and health checks.

Extend, do not replace.

## Add

```text
Correlation ID
OpenTelemetry traces
Request duration
DB dependency timing
Redis dependency timing
External provider timing
Structured error events
Per-module metrics
```

## External clients

Standardize:

```text
IHttpClientFactory
Timeout
CancellationToken
Retry for transient failure
Circuit breaker where appropriate
429 handling
```

Applies to:

```text
Geoapify
Open-Meteo
AI providers
Resend
payment providers
job sources
future WhatsApp/SMS providers
```

---

# 19. Module-Only Feature Matrix

The following features must remain in their owning service.

## Interior Design — module-only

```text
Client Project
Site
Room/space
Design concept/revision
Mood board
BOQ
BOQ version
Quotation
Change Order
Client design approval
Vendor quotation comparison
Site execution milestone
Daily site progress
Snag/defect
Installation/handover
Project profitability rules
```

Shared dependencies:

```text
Documents
Workflow
Notifications
Audit
Maps
Attendance
Reports
Import/Export
Billing primitives
```

---

## Warehouse — module-only

```text
Warehouse
Zone/Rack/Bin
SKU/Product warehouse model
Inventory balance
Stock ledger
Stock adjustment
Batch
Serial number
Expiry
Purchase Order
GRN
Put-away
Stock Transfer
Stock Count / Cycle Count
Sales Order
Reservation
Pick List
Packing
Dispatch
Return
Damage / Quarantine
Reorder rules
Barcode/label business workflow
Stock aging
ABC analysis
```

Shared dependencies:

```text
Notifications
Audit
Documents
Import/Export
Reports
Workflow
Attendance
Maps optional
Realtime
```

### Important

Never move these into `platform/inventory` just because Commerce or School may also have stock.

Warehouse owns warehouse-domain rules.

If a truly generic inventory primitive reaches 3+ real implementations later, extract only the stable primitive.

---

## School — module-only

```text
Admission
Student
Parent/Guardian relationship
Class
Section
Subject
Academic Year
Timetable
Homework
Student Attendance rules
Exam
Question/assessment model
Marks
Result/Report Card
Fee Structure
Fee Collection
Scholarship/Concession
Promotion
Transport route/student assignment
Library rules
Student certificates
Parent Portal rules
Student Portal rules
```

Shared dependencies:

```text
Attendance UI/core primitives
Notifications
Documents
Audit
Workflow
Reports
Import/Export
Maps
Support
```

---

## Hotel — module-only

```text
Property
Room Type
Room
Rate Plan
Reservation
Room Allocation
Check-In
Check-Out
Guest Folio
Housekeeping task rules
Room status lifecycle
Maintenance room blocking
Stay extension
No-show
Guest service request
```

Shared dependencies:

```text
Notifications
Documents
Audit
Workflow
Reports
Realtime
Support
```

---

## Travel — module-only

```text
Destination
Package
Departure
Itinerary
Traveler
Trip Booking
Travel pricing snapshot
Cancellation rules
Voucher/ticket metadata
Supplier/provider mapping
Trip status
```

Shared dependencies:

```text
Maps
Notifications
Documents
Reports
Audit
Support
Realtime
Workflow optional
```

---

## Jobs — module-only

```text
Job
Company
Candidate
Resume profile
Application
Application stage
Recruiter pipeline
Screening questions
Saved Job
Job Alert rules
Job Source
Scraper scheduling rules
Source adapters
Raw ingestion normalization
Deduplication
Job freshness/expiry
Job/resume matching rules
```

Shared dependencies:

```text
Notifications
Documents
Audit
Search
Reports
AI gateway
Background jobs
MongoDB optional for raw payloads
```

---

## News — module-only

```text
Article
Article revision
Editorial status
Category
Topic
Author
Live blog
Live blog entry
Breaking story
Homepage editorial placement
Publication scheduling
```

Shared dependencies:

```text
Workflow
Notifications
Documents/media
Audit
Search
Background jobs
Realtime
```

---

## Commerce — module-only

```text
Catalog
Category
Product
Variant
Price
Cart
Wishlist
Checkout
Order
Order line
Promotion rule
Return
Refund business rules
Customer review
```

Shared dependencies:

```text
Notifications
Documents
Audit
Search
Reports
Workflow optional
```

---

## Bank — module-only

```text
Account
Ledger
Ledger Entry
Beneficiary
Transfer
Transfer Authorization
Card Controls
Deposit
Loan
Statement rules
Risk event
```

Shared dependencies:

```text
Audit
Notifications
Documents
Workflow
Reports
Support
```

### Critical

Never put bank ledger posting into shared billing/payment helpers.

Bank ledger rules remain Bank-owned.

---

## Medical — module-only

```text
Patient
Provider/Doctor
Appointment
Clinical Encounter
Vitals
Diagnosis
Allergy
Medication
Prescription
Lab Order
Lab Result
Consent
Clinical Document rules
```

Shared dependencies:

```text
Documents
Notifications
Audit
Workflow
Reports
Support
```

Clinical authorization must remain module-owned.

---

## Home Services — module-only

```text
Service Category
Service
Package/Add-On
Serviceability Area
Customer Address
Professional
Professional Skill
Professional Availability
Booking
Booking assignment
Booking status machine
Extra work approval
Pricing/commission rules
Professional earnings
Payout
Review
Dispute
Membership
Recurring service
```

Shared dependencies:

```text
Maps
Realtime
Chat
Notifications
Documents
Audit
Workflow
Reports
Support
```

---

## Railway — module-only

Target domain may include:

```text
Route
Station
Fleet/Asset
Movement
Inspection
Defect
Work Order
Field evidence
Maintenance status
```

But current architecture reports no dedicated Railway backend module/controller family.

### Required first

```text
1. Define Railway backend module boundary.
2. Add Railway Domain/Application/Infrastructure/API ownership.
3. Add PostgreSQL persistence.
4. Add authorization.
5. Then add shared platform integrations.
```

Do not treat Railway as a production backend module before this exists.

---

# 20. Recommended Repository Target

## Frontend

```text
frontend/src/
  app/
    moduleRegistry.ts

  platform/
    api/
    auth/
    organizations/       NEW
    permissions/         NEW/EXTEND
    notifications/       NEW
    audit/               NEW
    documents/           NEW
    import-export/       NEW
    reports/             NEW
    workflow/            NEW
    search/              NEW
    support/             NEW
    settings/            NEW
    feature-flags/       NEW
    attendance/          EXISTING
    dashboard/           EXISTING
    maps/                EXISTING
    realtime/            EXISTING
    billing/             EXISTING
    tables/              EXISTING
    ui/                  EXISTING

  services/
    interior/
    warehouse/
    school/
    railway/
    hotel/
    travel/
    news/
    jobs/
    commerce/
    bank/
    medical/
    home-services/
    operations/
```

### Operations warning

`services/operations` remains a shared workspace where appropriate, but generic infrastructure such as storage should migrate behind `platform` contracts when safely touched.

---

## Backend

```text
VSRSystemsBackend.Api/
  Platform/
    Identity/
    Organizations/       NEW
    Permissions/         NEW/EXTEND
    Notifications/       NEW
    Audit/               NEW
    Storage/             EXISTING/EXTEND
    ImportExport/        NEW
    Reports/             NEW
    Workflow/            NEW
    Search/              NEW
    Support/             NEW
    Settings/            NEW
    FeatureFlags/        NEW
    Realtime/            EXISTING
    Chat/                EXISTING
    Maps/                EXISTING
    Weather/             EXISTING
    AI/                  EXISTING
    Health/              EXISTING
    ModuleData/          EXISTING

  Modules/
    Interior/
    Warehouse/
    School/
    Hotel/
    Travel/
    Jobs/
    News/
    Commerce/
    Bank/
    Medical/
    HomeServices/
    Railway/             ADD ONLY WHEN IMPLEMENTING BACKEND
```

Use matching ownership inside:

```text
Application/
Domain/
Infrastructure/
```

---

# 21. API Ownership Rules

Use:

```text
/api/platform/<capability>
```

for shared technical capabilities.

Examples:

```text
/api/platform/notifications
/api/platform/audit
/api/platform/organizations
/api/platform/reports/jobs
```

Use:

```text
/api/<module>/<business-feature>
```

for module business workflows.

Examples:

```text
/api/warehouse/purchase-orders
/api/warehouse/grns
/api/school/students
/api/school/fees
/api/interior-design/quotations
```

Do not create:

```text
/api/platform/purchase-orders
/api/platform/students
/api/platform/interior-boq
```

---

# 22. ModuleData Migration Rule

The current system has generic:

```text
GET /api/{module}/data/{collection}
PUT /api/{module}/data/{collection}
```

Keep it for:

```text
simple module settings
prototype screens
low-risk collection-shaped data
temporary compatibility
```

Graduate business-critical workflows to dedicated APIs when they require:

```text
transactions
permissions
validation
concurrency
audit
workflow
domain events
financial rules
inventory rules
clinical rules
```

### Recommended migration priority

```text
1. Interior critical workflows
2. School critical workflows
3. Keep Warehouse dedicated APIs as source of truth
4. Do not duplicate mature Warehouse APIs in ModuleData
```

---

# 23. Implementation Sequence — Small Coding-Agent Sessions

Do not ask the coding agent to implement the entire plan in one run.

Each phase below is a separate branch/session.

---

## PHASE 0 — Safety Baseline

Agent task:

```text
1. Read ProductArchitecture / ARCHITECTURE.md.
2. Build frontend.
3. Run frontend lint/chunk checks.
4. Run backend test solution.
5. Record current Swagger route families.
6. Record platform folders.
7. Make NO functional changes.
```

Definition of Done:

```text
[ ] Current baseline recorded.
[ ] Current deployments/config untouched.
[ ] Failures documented before feature work.
```

---

## PHASE 1 — Organization Foundation

Scope:

```text
Platform Organizations only.
Do not tenant-migrate all modules.
```

Implement:

```text
Organization
OrganizationUser
OrganizationModule
CurrentOrganization abstraction
Default demo organization
Basic organization APIs
```

Integrate with:

```text
Identity/auth context
module registry visibility later
```

Stop after this phase.

---

## PHASE 2 — Permissions Foundation

Implement:

```text
permission contracts
backend enforcement helpers
frontend PermissionGate
Interior permission list
Warehouse permission list
School permission list
```

Do not rewrite every module role model.

Stop.

---

## PHASE 3 — Notifications

Implement:

```text
Notification tables
Notification API
NotificationBell
NotificationPanel
SignalR notification event
```

First integrations only:

```text
Warehouse PO approved
School fee received / absence
Interior quotation approved
```

Stop.

---

## PHASE 4 — Audit

Implement platform audit engine.

First integrations:

```text
Warehouse stock adjustment
School fee update
Interior quotation revision
```

Stop.

---

## PHASE 5 — Documents / Storage Platform

Refactor existing shared storage behind platform contracts.

Do not replace Supabase.

Integrate:

```text
Interior project/site documents
Warehouse GRN/damage attachments
School student documents
```

Stop.

---

## PHASE 6 — Import / Export

Implement shared import/export engine.

First imports:

```text
Warehouse Products
School Students
Interior Vendors
```

First exports:

```text
Warehouse Inventory
School Student List
Interior BOQ
```

Stop.

---

## PHASE 7 — Reports / PDF

Build report infrastructure.

First outputs:

```text
Warehouse GRN/Stock Report
School Fee Receipt
Interior Quotation
```

Stop.

---

## PHASE 8 — Workflow / Approval

Build generic approval engine.

First workflows:

```text
Warehouse PO approval
School leave/expense approval
Interior quotation/client approval
```

Stop.

---

## PHASE 9 — Settings / Feature Flags / Branding

Implement organization-scoped:

```text
branding
currency/timezone
module visibility
feature flags
```

Connect to existing module registry.

Stop.

---

## PHASE 10 — Outbox + Background Dispatcher

Implement:

```text
DomainEvent
OutboxMessage
BackgroundService dispatcher
Idempotent processing marker
```

Convert one notification path to Outbox.

Stop.

---

## PHASE 11 — Observability / Resilience

Implement:

```text
Correlation ID
OpenTelemetry
request timing
external dependency spans
standard HttpClient resilience
```

Do not change providers.

Stop.

---

## PHASE 12 — Product Deepening

After shared platform is stable, deepen one product at a time.

Recommended order:

```text
1. Interior
2. Warehouse
3. School
4. Home Services
5. Jobs
6. Remaining products only when needed
```

---

# 24. Interior — First Commercial Deepening Plan

Implement after shared platform phases.

## Target E2E workflow

```text
Lead/Client
  ->
Project
  ->
Site
  ->
Design
  ->
BOQ
  ->
Quotation
  ->
Client Approval
  ->
Purchase Request / Vendor
  ->
Site Execution
  ->
Progress / Change Order
  ->
Milestone Invoice
  ->
Payment
  ->
Handover
```

## Build order

```text
I1 Client + Project relationship
I2 BOQ + BOQ versioning
I3 Quotation + PDF
I4 Client approval using Workflow
I5 Vendor + Purchase Request
I6 Site progress/photos using Documents
I7 Change Order + Audit
I8 Milestone billing
I9 Project profitability report
I10 Customer/client portal
```

---

# 25. Warehouse — First Commercial Deepening Plan

Warehouse already has rich dedicated APIs. Do not rebuild them.

## Enhance

```text
W1 Barcode / QR scanning
W2 Batch / serial / expiry
W3 Printable labels
W4 PO approval workflow
W5 Low-stock notifications
W6 Cycle count workflow
W7 Damage / quarantine
W8 Inventory import/export
W9 Stock aging / ABC reports
W10 Vendor performance
```

Keep stock ledger/inventory authority inside Warehouse.

---

# 26. School — First Commercial Deepening Plan

## Target E2E workflow

```text
Admission
  ->
Student
  ->
Class/Section
  ->
Attendance
  ->
Fees
  ->
Exam
  ->
Result
  ->
Parent visibility
```

## Build order

```text
S1 Student import
S2 Parent/guardian relationship
S3 Fee receipt + PDF
S4 Fee reminder notifications
S5 Student attendance notification
S6 Exams/results
S7 Report card PDF
S8 Parent portal
S9 Timetable
S10 Transport integration
```

---

# 27. Coding-Agent Guardrails

Every coding-agent task must follow this workflow.

```text
STEP 1
Read ProductArchitecture / ARCHITECTURE.md.

STEP 2
Identify owner:
  Platform
  or one business module.

STEP 3
Read only:
  target capability/module
  imported platform dependencies
  relevant tests
  relevant migration/config files

STEP 4
Preserve existing:
  routes
  API response contracts
  authentication
  deployment configuration
  working UI

STEP 5
Implement smallest possible scope.

STEP 6
Add tests.

STEP 7
Run:
  frontend build
  frontend lint/checks
  backend tests

STEP 8
Return only:
  files changed
  migrations added
  endpoints added/changed
  tests added
  build/test result
  manual test steps
```

Do not scan/rewrite unrelated modules.

---

# 28. Definition of Done for Any Shared Capability

A shared capability is complete only when:

```text
[ ] It lives under Platform.
[ ] It contains no module-specific business rule.
[ ] At least 2-3 real modules consume it when appropriate.
[ ] Modules do not import one another.
[ ] Authorization is enforced server-side.
[ ] Organization context is respected where adopted.
[ ] Auditability exists for important writes.
[ ] Loading/empty/error UI states exist.
[ ] Tests cover success + forbidden + failure path.
[ ] Existing deployments remain unchanged.
[ ] Existing routes remain compatible.
```

---

# 29. Definition of Done for Any Module-Only Feature

A module feature is complete only when:

```text
[ ] Domain rules live in owning module.
[ ] Dedicated API is used for critical workflow.
[ ] Validation is server-side.
[ ] Authorization is server-side.
[ ] PostgreSQL remains source of truth for transactions.
[ ] Shared platform capability is reused instead of copied.
[ ] No other module repository/service is called directly.
[ ] Module tests exist.
[ ] Demo path works after browser refresh/login.
```

---

# 30. Features Not To Add Now

```text
Microservices
Kafka
RabbitMQ
Kubernetes
API Gateway
Service Discovery
Separate database per module
Separate deployment per module
Second realtime framework
Second cache layer
Another document database for core transactions
A mobile app for every module
Generic AI chatbot in every module
```

Add infrastructure only after a real requirement proves it is needed.

---

# 31. Immediate First Agent Task

Use this exact prompt for the first coding session:

```text
Implement ONLY Phase 0 and prepare Phase 1 for the current VSR Systems codebase.

SOURCE OF TRUTH:
- ProductArchitecture.txt / ARCHITECTURE.md
- Current source/runtime/Swagger override historical plans.

CURRENT ARCHITECTURE MUST REMAIN:
- One React 19 SPA
- One ASP.NET Core backend
- One Supabase PostgreSQL database
- Netlify frontend
- Render backend
- Module-isolated modular monolith

DO:
1. Verify frontend build, lint, chunk and legacy-ui checks.
2. Run backend tests.
3. Inventory existing Platform folders and existing Organization/Tenant-related code, if any.
4. Inventory current User/Auth/Role/Permission entities and APIs.
5. Inventory tables/entities that already carry organization/tenant/service ownership.
6. Record current Swagger endpoints relevant to auth/platform.
7. Produce a concise implementation diff plan for Phase 1 Organization Foundation.

DO NOT:
- Add migrations.
- Change business logic.
- Move modules.
- Change API routes.
- Change auth behavior.
- Change deployment configuration.
- Add microservices or infrastructure.
- Implement Phase 1 yet.

OUTPUT:
- Existing reusable code found
- Gaps
- Files likely to change in Phase 1
- Migration risk
- Test baseline results
- Recommended smallest Phase 1 implementation

STOP after the plan.
```

---

# 32. Phase 1 Agent Prompt — Run Only After Phase 0 Is Reviewed

```text
Implement ONLY the Organization Foundation described in
VSR_RealWorld_Features_Integration_Master_Plan.md.

Requirements:
1. Preserve current login and current users.
2. Add Organization, OrganizationUser and OrganizationModule using the existing architecture/layers.
3. Create one default organization for existing/demo data using the safest migration/seed approach.
4. Add IOrganizationContext or equivalent server-side abstraction.
5. Add basic authenticated organization/current-context API.
6. Do not add OrganizationId to every module table yet.
7. Do not refactor unrelated modules.
8. Add unit/integration tests:
   - current user resolves default organization
   - unauthenticated access denied
   - user cannot request unauthorized organization context
9. Build/test frontend/backend.
10. Report changed files, migration, endpoints and test results.

STOP after Organization Foundation.
```

---

# 33. Final Architecture Principle

The desired direction is:

```text
                         VSR PLATFORM
                              |
        +---------------------+---------------------+
        |                     |                     |
  Notifications             Audit              Documents
  Organizations             RBAC               Workflow
  Reports                   Search              Import/Export
  Settings                  Realtime            Maps
        |                     |                     |
        +---------------------+---------------------+
                              |
       -------------------------------------------------
       |          |         |       |       |          |
    Interior  Warehouse   School   Hotel   Jobs   Home Services
       |          |         |       |       |          |
       -------------------------------------------------
                              |
                    MODULE-OWNED BUSINESS RULES
```

**Platform provides reusable capability.  
Modules provide business meaning.**

That boundary must remain the central rule for all future VSR development.
