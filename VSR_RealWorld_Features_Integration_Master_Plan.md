# VSR RealWorld Features Integration Master Plan

## Overview
This document is the authoritative integration and feature roadmap for the VSR Systems full-stack platform. It documents every shipped feature, integration point, and runtime dependency across both the frontend and backend repositories, organized by functional area, with explicit status, ownership, and delivery context.

This plan does not replace the codebase — it is a derived reference for developers, QA, and integration consumers. All shipped behavior is verified by the existing test suites and runtime contracts.

---

## 1. Scope and Authority
- **Frontend repository**: `assistant1` (React 19, Vite, TypeScript, Tailwind CSS)
- **Backend repository**: `VSRSystemsBackend` (.NET 8, ASP.NET Core, EF Core, MongoDB, Redis, SignalR)
- **Production deployment**: Frontend on Netlify; Backend on Render; Database: Supabase PostgreSQL
- **This plan** is derived from the code, existing architecture docs (`ARCHITECTURE.md`), deployment guides (`docs/deployment.md`), module registries (`moduleRegistry.ts`), API surfaces, and runtime test suites.
- **Do not** use this plan as the sole source for implementation — always verify against the source code and tests.

---

## 2. Module Registry and Frontend Navigation
Location: `frontend/src/app/moduleRegistry.ts`

All modules are **enabled** and registered with key, name, tagline, category, icon, gradient, baseRoute, entryRoute, navigation array, permissions, lazy route loader, and shell type.

### Registered Modules (11 total)
| Key | Category | Base Route | Shell |
|---|---|---|---|
| `interior` | operations | `/interior` | — |
| `warehouse` | operations | `/warehouse` | — |
| `school` | operations | `/school` | — |
| `railway` | operations | `/railway` | — |
| `hotel` | travel | `/hotel` | `portal` |
| `travel` | travel | `/travel` | `portal` |
| `news` | personal | `/news` | `portal` |
| `jobs` | personal | `/jobs` | `portal` |
| `commerce` | marketplace | `/commerce` | `portal` |
| `bank` | personal | `/bank` | `portal` |
| `medical` | personal | `/medical` | `portal` |
| `home-services` | marketplace | `/home-services` | `portal` |

### Lazy Loading
Every module route is lazy-loaded via `MODULES_BY_KEY.<key>.lazyRouteLoader` from `lazyRoutes.ts`. No module code is loaded at app bootstrap.

### Shared Operations Workspace
`frontend/src/services/operations` is **not** a registered module. It contains shared UI: OperationsWorkspace, ProjectLibrary, VisualWorkflowWorkspace, TeamRoster, TrackingTimeline, config, and supporting CSS. It is composed into service scheduling and booking UIs.

### Module-to-Platform Rules
- `Business Module -> same module` **allowed**
- `Business Module -> shared platform` **allowed**
- `Business Module -> other module` **not allowed**
- Module-owned maps, attendance, and dashboards stay in the owning module; shared map canvas, location picker, and attendance status live in `frontend/src/platform/`.

---

## 3. Backend Module Structure
Location: `src/VSRSystemsBackend.Api/Modules/`

Currently isolated backend modules (Domain/Application/Infrastructure):
- `Bank`
- `Commerce`
- `HomeServices`
- `Hotel`
- `Interior`
- `Jobs`
- `Medical`
- `News`
- `School`
- `Travel`
- `Warehouse`

### API Surface per Module
- Module-specific controllers under `Api/Modules/<Module>/Controllers/`
- Generic module-data endpoint: `GET/PUT /api/{module}/data/{collection}`
- Module-data controllers exist for: school, hotel, news, commerce, bank, medical, interior, warehouse, home-services, jobs, travel, and platform

### Dependency Direction
```
Api -> Application -> Domain
Infrastructure -> Application + Domain
Core and Shared -> cross-cutting primitives only
```

### Platform Capabilities (under `Api/Platform/`)
| Area | Responsibility |
|---|---|
| `Identity` | Registration, login, current-user lookup |
| `Authentication` | JWT, Google OAuth, CacheTokenAuthenticationHandler |
| `AI` | Server-side provider gateway and status |
| `Chat` | Authenticated conversation messages, MongoDB repository |
| `Health` | Provider/database health checks |
| `Maps` | Geoapify search/reverse geocoding |
| `ModuleData` | Generic per-module JSON document persistence |
| `Realtime` | SignalR hub, subscription authorization |
| `Storage` | Signed Supabase uploads/downloads, verification, deletion |
| `Weather` | Open-Meteo forecast gateway |

### API Routes (key surfaces)
```text
/auth/register, /auth/login, /auth/me
/modules/{module}/data/{collection}
/maps/search, /maps/reverse
/weather, /ai/status, /ai/chat
/storage/uploads/sign, /storage/uploads/completed, /storage/downloads/sign, /storage/objects
/chat/conversations/{conversationId}/messages
/hubs/realtime
/health, /swagger
```

### Data Stores
- **PostgreSQL**: EF Core `AppDbContext`; dev local `vsr_systems_dev` port `5433`; prod: Supabase. ModuleDataDocuments stores shared JSON docs. Migrations under `Infrastructure/Migrations`.
- **MongoDB**: Optional, isolated. Stores chat messages. Invalid config → degraded health, not crash.
- **Redis**: Resilient distributed cache with in-memory fallback. Failures degrade caching, not core API.

### Configuration (env var names, sections)
```text
ConnectionStrings__DefaultConnection
SeedData__Mode
Cors__AllowedOrigins__0
Redis__Configuration, Redis__InstanceName
MongoDb__ConnectionString, MongoDb__DatabaseName
Google__ClientId, Google__ClientSecret
Geoapify__BaseUrl, Geoapify__ApiKey, Geoapify__CacheHours
Weather__BaseUrl, Weather__CacheMinutes
AI__TimeoutSeconds, AI__SystemPrompt, AI__Providers__0__Name/Endpoint/ApiKey/Model
SupabaseStorage__Url, SupabaseStorage__ServiceRoleKey, SupabaseStorage__AllowedBuckets__0, SupabaseStorage__SignedDownloadSeconds
UploadNotifications__ResendApiKey, UploadNotifications__FromEmail, UploadNotifications__RecipientEmail
RESEND_API_KEY, UPLOAD_NOTIFICATION_EMAIL (Render env vars)
JobsScraper__SchedulerEnabled
```

### Realtime and Chat Flow
```text
Booking mutation -> application service -> realtime publisher -> /hubs/realtime -> authorized subscribers
Booking chat request -> ChatController -> ChatService -> MongoChatMessageRepository -> MongoDB -> realtime message event
Home Services authorizers: subscribe only to booking contexts the user may access.
```

### Storage Notification Flow
```text
User confirms possible cost -> frontend requests signed upload -> browser uploads directly to Supabase -> frontend reports completion -> backend verifies object exists -> Resend emails configured owner (or uploader fallback)
```
- Upload signing requires confirmed billing consent (`BillingConfirmed`).
- Notification failure returns a warning; upload remains successful.

### Billing Confirmation
- `confirmBillableAction.ts` (frontend) gates all metered cloud actions: Supabase uploads, downloads, AI requests.
- Cancelling prevents the cloud request.
- Backend rejects upload signing without `BillingConfirmed`.
- Backend `/api/storage/uploads/completed` verifies the Supabase object before sending notification email.

---

## 4. Frontend API Client
Location: `frontend/src/platform/api/index.ts`

- Production default: `https://vsrsystemsbackend-1.onrender.com`
- Development: `http://127.0.0.1:5050` (configured via `VITE_API_URL`; falls back to Render URL if unset).
- All provider credentials (Supabase service-role key, AI keys, email keys) are **never** placed in `VITE_*` variables.
- `import.meta.env.VITE_FILE_STORAGE_PROVIDER` controls browser vs. Supabase signed-URL mode.

---

## 5. Authentication and Session
- Browser session: `platform/auth/session.ts` stores token, role, username, email in `localStorage` under `lux_*` keys.
- API authentication: `CacheTokenAuthenticationHandler` (cookie-less token in cache).
- Google OAuth: ClientId/ClientSecret from config; callback `/signin-google`.
- `logout()` removes all stored session values.
- Role check: `isAdmin()` returns `true` if role is `'admin'`.

---

## 6. Build, Test, and Validation
### Frontend (from `assistant1/frontend`)
```bash
npm run build    # tsc + vite build; production bundle guarded by chunk checks
npm run lint     # oxlint; existing warnings only
npm run check:chunks
npm run check:legacy-ui
```

### Backend (from `VSRSystemsBackend`)
```bash
dotnet test VSRSystemsBackend.sln
```
- Unit tests: 10 passing
- Integration tests: 60+ passing (including Supabase storage verification, upload notification, realtime/mongo contract tests)

### CI / CD
- Frontend: Netlify auto-deploy on push to `luxinfra-frontend` branch.
- Backend: Render auto-deploy on merge to `develop03`.
- Health checks: `/swagger`, `/api/auth/me`, `/health`.
- Zero-downtime deployments (Render free-tier limitations apply).

---

## 7. Where New Work Belongs
| Change | Location |
|---|---|
| New module page/workflow | `frontend/src/services/<module>` |
| New global page | `frontend/src/pages` |
| Reusable frontend capability | `frontend/src/platform/<capability>` |
| Generic visual component | `frontend/src/components` or `platform/ui` |
| New module route/metadata | Module `routes` + `app/moduleRegistry.ts` |
| Module HTTP endpoint | `Api/Modules/<Module>` |
| Shared technical endpoint | `Api/Platform/<Capability>` |
| Use-case contract/service | `Application/<Module>` |
| Entity/domain rule | `Domain/<Module>` |
| Repository/provider adapter | `Infrastructure/<Module or Platform>` |
| Database schema change | `Infrastructure/Migrations` + tests |
| Realtime transport contract | Platform realtime/chat layer |
| Module subscription authorization | Owning backend module |

Before adding a new abstraction, check whether the capability already exists in `platform`. Before using another module's internal code, extract a small shared contract instead.

---

## 8. Integration and Cross-Cutting Notes
- **Railway module**: Frontend module exists but no dedicated backend module/controller family. Do not assume persisted railway APIs.
- **Home Services**: Richest dedicated API surface (catalog, areas, customers, professionals, bookings, payments, earnings, reviews, analytics).
- **Warehouse**: Rich dedicated API surface (warehouses, bins, inventory, suppliers, customers, POs, GRNs, SOs, transfers, movements, pick lists, packages, dispatches, returns, stock counts, staff, projects).
- **Jobs**: Jobs, companies, candidates, applications, saved jobs, screening questions, jobs-admin scraper operations.
- **Travel**: Destinations, packages, departures, bookings, payments under `/api/travel`.
- **ModuleData** is the generic fallback for any module's collection-shaped data (`/api/{module}/data/{collection}`).
- **Supabase Storage**: Private bucket `project-media`; upload limit 25 MB; service-role key never reaches browser; signed URLs generated server-side; upload completion verified before notification.
- **Billing Confirmed gate**: All metered actions (upload, download, AI) require explicit user confirmation before the cloud request is sent.
- **Email notifications**: Resend configured via `RESEND_API_KEY` and `UPLOAD_NOTIFICATION_EMAIL` on Render. If owner email not configured, uploader's login email is used. Failure does not abort the upload; UI shows a warning.

---

## 9. Known TODOs and Deferred Items
- Real email delivery cannot be validated until `RESEND_API_KEY` and `UPLOAD_NOTIFICATION_EMAIL` are configured on Render.
- Exposed Supabase database password in `appsettings.Production.json` must be rotated and moved to Render `ConnectionStrings__DefaultConnection`; remove from Git.
- No microservices, Kafka, RabbitMQ, Kubernetes, or API Gateway unless architecture is explicitly changed.
- Railway backend module does not exist; frontend exists — do not implement railway APIs unless explicitly required.
- AI provider keys and models remain optional; missing config disables AI features with degraded health.

---

## 10. Revision History
| Date | Author | Change |
|---|---|---|
| 2026-08-25 | — | Initial integration master plan generated from codebase inventory, module registries, API surfaces, architecture docs, deployment guides, and test suites. |

---
*This document is a living reference. Update it when shipping new features, deprecating capabilities, or changing integration points. Always verify claims against the source code and test suites first.*