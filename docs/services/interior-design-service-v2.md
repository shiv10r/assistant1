# VSR Interiors Service Architecture V2

## Product Direction

VSR Interiors is a complete studio operating system for residential and commercial interior work. It connects the full delivery chain instead of treating AI renders as an isolated feature:

```text
Client brief
  -> Project and site setup
  -> Room survey and imagery
  -> AI concept generation
  -> Design comparison and approval
  -> Product specification and estimate
  -> Procurement
  -> Site execution
  -> Handover
```

The service is designed as an interview-ready vertical inside the wider VSR platform. Interior business logic remains inside `frontend/src/services/interior`; cross-service capabilities remain in `frontend/src/platform`.

## Experience Principles

1. Design-first, not admin-first: portfolio imagery, phases, decisions and material stories take priority over generic tables.
2. One visible delivery chain: every concept should connect to a room, project, estimate and execution state.
3. Progressive complexity: simple mode supports core work; advanced mode exposes operational analytics.
4. Actionable analytics: every risk or KPI links to the workspace where it can be resolved.
5. Mobile field utility: site location, navigation, approvals and delivery status remain usable on small screens.
6. Honest product states: simulated concepts are labelled as simulations until a generation provider is integrated.

## Information Architecture

| Area | Route | Responsibility |
|---|---|---|
| Command center | `/interior/dashboard` | Portfolio KPIs, delivery pipeline, studio signals and milestones |
| Projects | `/interior/projects` | Project creation, client brief, site location, rooms and project metadata |
| Project workspace | `/interior/projects/:id` | Rooms, concepts, budget, progress and project actions |
| Room workspace | `/interior/projects/:id/rooms/:roomId` | Survey dimensions, image capture, notes and room concepts |
| AI generator | `/interior/projects/:id/generate` | Room-aware style, palette, brief and budget workflow |
| Design studio | `/interior/designs` | Portfolio-wide concept review, compare, save and share |
| Project designs | `/interior/projects/:id/designs` | Project-scoped concept review |
| Design detail | `/interior/projects/:id/designs/:designId` | Versions, products, modifications and estimate context |
| Product library | `/interior/products` | Searchable and exportable material/product catalogue |
| Estimate | `/interior/projects/:id/quotation` | Saved-design cost composition and budget check |
| Site planner | `/interior/sites` | Geocoding, site pinning, nearest-site ranking and navigation |
| Execution studio | `/interior/execution` | Work board, procurement control and client decisions |

All route pages are lazy loaded from `frontend/src/services/interior/routes.tsx`.

## Implemented Capabilities

### Command Center

- Live-project and managed-budget KPIs.
- Design approval ratio.
- Open work and delivery-risk counters.
- Project phase pipeline chart.
- Procurement commitment breakdown.
- Project progress, target dates and ownership.
- Client-decision, blocked-work and missing-site-input signals.
- Upcoming milestone queue.

### Project and Room Management

- Project, client and lead-designer details.
- Property, area, budget, priority and delivery phase.
- Progress and target handover date.
- Searchable map location with latitude/longitude persistence.
- Multi-room creation with complete dimensions.
- Room photo capture, notes and budget.
- Cascading project and room deletion with confirmation.

### Design Studio

- Project-wide and portfolio-wide concept galleries.
- Style filtering and search.
- Save, favourite, download and share actions.
- Room-aware concept generation stages.
- Deterministic product selection for simulated concepts.
- Version history, comparison and restoration workflow.
- Reliable generation completion for rooms with and without images.

### Site Intelligence

- Shared OpenStreetMap/Leaflet location picker.
- Nominatim place search.
- Browser geolocation.
- Distance-based nearest-site ranking using Haversine distance.
- Google Maps turn-by-turn handoff.
- Project location correction by search or map click.

### Delivery Operations

- Four-state work board: planned, in progress, blocked and completed.
- Task ownership, phase, due date and completion progress.
- Procurement vendor, amount, expected date and status tracking.
- Client approval, change-request and decision due-date tracking.
- Portfolio completion, risk, committed order and approval KPIs.

## Domain Model

### Core Design Records

- `InteriorProject`: client, site, budget, phase, priority, progress and target date.
- `InteriorRoom`: project relation, type, dimensions, image, notes and room budget.
- `InteriorDesign`: room concept, status, saved/favourite state and active version.
- `DesignVersion`: immutable prompt, style, palette, budget and product selection.
- `InteriorProduct`: catalogue category, price, material, dimensions and description.

### Delivery Records

- `InteriorTask`: project, phase, owner, due date, state and progress.
- `InteriorProcurement`: project, product category, vendor, value, ETA and state.
- `InteriorDecision`: project, client/requester, due date and approval state.

New project fields are optional to preserve compatibility with documents created before V2.

## State and Persistence

Current persistence uses the shared `useLocalCollection` boundary:

```text
React page
  -> interior-owned collection hook
  -> browser localStorage fallback
  -> shared module-data API
  -> Supabase PostgreSQL ModuleDataDocuments
```

Collections:

| Key | Remote module/collection |
|---|---|
| `interior:projects` | `interior/projects` |
| `interior:rooms` | `interior/rooms` |
| `interior:designs` | `interior/designs` |
| `interior:products` | `interior/products` |
| `interior:tasks` | `interior/tasks` |
| `interior:procurement` | `interior/procurement` |
| `interior:decisions` | `interior/decisions` |

The current API saves each collection as one JSON document. This is appropriate for an MVP preview but has last-writer-wins concurrency and no tenant isolation. Sensitive customer data must wait for authenticated tenant ownership.

## Shared Platform Boundaries

Interior reuses these global concerns and must not duplicate them:

- Authentication and API transport: `src/platform/auth`, `src/platform/api`.
- UI primitives and notifications: `src/platform/ui`.
- KPI and chart rendering: `src/platform/dashboard`.
- Tables and CSV: `src/platform/tables`.
- Geocoding and map selection: `src/platform/maps`.
- Attendance: `src/platform/attendance` when interior workforce records are introduced.
- Global search, theme, service switching and view mode remain in the application shell.

Interior owns calculations, workflow states, validation, routes, seed fixtures and adapters for those shared capabilities.

## KPI Definitions

| KPI | Formula |
|---|---|
| Managed budget | Sum of budgets for active projects |
| Design approval | Saved completed designs / all completed designs |
| Open work | Tasks not in `completed` |
| Delivery attention | Blocked tasks + delayed procurement items |
| Portfolio completion | Average task progress |
| Committed orders | Sum of procurement amounts |
| Delivered value | Procurement value where status is delivered |
| Pending approvals | Client decisions where status is pending |

## Visual System

Interior keeps the platform component language but adds a studio-specific layer in `interior.css`:

- Charcoal and warm-clay command surfaces.
- Editorial serif display typography paired with the platform sans serif.
- Sand and sage supporting tones.
- Restrained borders, material-like layers and asymmetric hero geometry.
- Responsive command layouts at desktop, tablet and mobile sizes.

The service stylesheet must not override shared platform component contracts.

## Production Evolution

### Next: Trust and Security

- Add authenticated tenant and user ownership to every record.
- Replace public module-data writes with authorized service endpoints.
- Add audit history and optimistic concurrency revisions.
- Move room images from local data URLs to object storage.

### Next: Normalized Interior APIs

- Migrate projects, rooms, designs, tasks, procurement and decisions to normalized PostgreSQL tables.
- Add server-side validation, paging and filtering.
- Retain the current frontend facade while replacing its persistence adapter entity by entity.

### Next: Professional Delivery

- BOQ with measured quantities, labour, tax and contingency.
- Persisted quotations, revisions, PDF generation and client acceptance.
- Vendor comparison, purchase orders and delivery receipts.
- Gantt dependencies, workforce allocation and shared attendance adapter.
- Snag lists, inspections, NCRs and handover packs.

### Later: Spatial Intelligence

- Floor-plan editor and measured wall surfaces.
- Real AI generation provider with queued jobs and generated asset storage.
- 3D scenes, AR placement and photorealistic version comparison.
- Real-time comments, annotations and client portal.

## Quality Gates

Run before merging:

```bash
npm run build
npm run lint
npm run test:jobs
npm run check:chunks
npm run check:legacy-ui
```

Manual checks:

- 375 px, 768 px and 1280 px layouts.
- Project create/edit and map selection.
- Room creation and photo generation flow.
- Global and project design galleries.
- Work-state, procurement and approval persistence.
- Direct URL refresh for every route.
