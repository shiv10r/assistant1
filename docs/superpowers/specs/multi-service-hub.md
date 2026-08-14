# LuxInfra Multi-Service Hub — Design Spec

**Status:** Draft — awaiting user approval gate
**Author:** Sisyphus
**Branch:** `luxinfra` (shell) + per-service feature branches

---

## 1. Goal

Turn the single LuxInfra app into a **multi-service platform hub**. After login the user lands on an **animated service chooser** and picks one of three services — **Interior Design**, **Warehouse Store**, **School Management** — each with its own navigation, home page, and dedicated features. Some features stay common across all services; some are per-service. Architecture is a **modular monolith now** (one React app + one backend), structured so services can be split into true micro-frontends later.

## 2. Scope guardrails

- **Nothing breaks.** Existing URLs that are bookmarked keep working via redirects. Existing endpoints/DB unchanged this phase.
- **Backend untouched this phase.** Frontend hub only; backend stays a single API with all current controllers.
- **No new dependencies.** Chooser + nav use pure CSS/React.
- **Nothing deploys until merged to a deploy branch** per the AGENTS.md branch rule.

## 3. Service → feature mapping

### Common (all services, shared shell + utility)
Auth, animated service chooser, Layout/shell (service-aware), Users & Roles, Settings, Backup & Sync, Activity, Broadcast, AI Assistant, Reports, Analytics, Video Call, Plans, Profile, Integrations, **Billing** (Transactions, Items & Catalog, Parties, Cash & Bank, Billing Settings — stays top-level, available to all services; interior invoices clients and warehouse sells goods from the same billing module).

### Warehouse — `/warehouse/*`
- **Dashboard** (stock overview, low-stock alerts, recent activity)
- **Inventory / Stock** — reuses Catalog + stock fields (existing `/billing/items`)
- **Purchase Orders** (new)
- **GRN** — goods received note (new)
- **Suppliers** — reuses Parties (existing `/billing/parties`)
- **Low-stock alerts** (new; surfaces on dashboard + inventory)

### Interior — `/interior/*`
- **Dashboard**
- **Projects** — all existing project sub-pages (`/projects`, `/projects/:id`, tasks, txn, site, attendance, material, mom, design, files, payroll, party, workspace)
- **Interior Design** module (existing `/interior` → new location)
- **Modules** (existing `/modules`)
- **Site Map** (existing `/map`)
- **AI Vision Progress** (existing `/vision`)
- **Video Call** — could stay common; currently listed common. (existing `/video`)

### School — `/school`
- **Stub page** "Coming soon" this phase. Students/Classes/Fees/Attendance deferred to a later phase.

## 4. Frontend restructure

```
frontend/src/
  common/
    ServiceChooser.tsx      (animated, full-screen, 3 cards)
    Layout.tsx              (service-aware nav; "Switch service" button)
    ... shared pages: Settings, Users, Backup, Activity, Broadcast, Assistant,
        Reports, Analytics, VideoCall, Plans, Account, Integrations
  services/
    interior/    → pages/Projects*, InteriorDesign, Modules, Vision, Map
    warehouse/   → pages/billing/*, Catalog (reorganized), + new PO/GRN/low-stock pages
    school/      → SchoolHome.tsx (stub)
  App.tsx        → hub routing: / → chooser, /warehouse/*, /interior/*, /school, common routes
  api.ts         → unchanged (endpoints reused)
```

- **Backward-compat redirects**: old URLs (`/billing/*`, `/projects/*`, `/interior`, `/map`, `/modules`, `/vision`, `/video`) 301-redirect to their owning service so nothing breaks.
- **Layout** becomes service-aware: reads active service from URL, renders that service's nav + shared "Common" group. "Switch service" button returns to chooser.

## 5. Animated chooser (common component)

- Full-screen, 3 large cards: **Interior Design**, **Warehouse Store**, **School Management**.
- Icons, hover lift + glow, entrance animation (fade/slide), "Enter {service}" button per card.
- Pure CSS (no new deps).
- **Remember last service**: on explicit "Switch service" show chooser; on first login show chooser; optional "go straight to last service" toggle.

## 6. Branch topology

```
luxinfra             ← source of truth — hub shell builds here first
  feature/interior-hub   ← interior reorg work
  feature/warehouse-hub  ← warehouse pages + new features
  feature/school-hub     ← school stub
```

Workflow per AGENTS.md: develop on feature branch → merge to `luxinfra` → sync FE to `luxinfra-frontend` (Netlify), BE to `luxinfrabackend` (Render). Nothing deploys until merged.

## 7. Build order

1. Hub shell on `luxinfra`: chooser + service-aware Layout + routing + redirects + folder restructure.
2. Create the 3 feature branches.
3. Warehouse hub on `feature/warehouse-hub` (Inventory/Stock, PO, GRN, Suppliers, Low-stock, Dashboard).
4. Interior reorg on `feature/interior-hub`.
5. School stub on `feature/school-hub`.

## 8. Decisions (resolved with user)

1. **Billing stays common** — Transactions/Catalog/Parties/Cash-Bank/Billing-Settings remain top-level, available to all services. Interior invoices clients and Warehouse sells goods from the same module.
2. **Utility pages stay common** — Reports, Analytics, Integrations, Video Call are single shared pages in every service's sidebar. No per-service versions this phase.
3. **Shell first, then branches** — build the hub shell (chooser + routing + service-aware Layout + redirects + restructure) on `luxinfra` first, then branch per service.
4. **Deploy incrementally** — as each service branch merges to `luxinfra`, sync FE to `luxinfra-frontend` and deploy. Warehouse ships when done, interior when done, school stub when done.

## 9. Out of scope (later phases)

- True micro-frontend split (module federation / separate sites).
- Backend split into per-service controllers/namespaces.
- School Management functional pages (Students/Classes/Fees/Attendance).
- Backup root-cause fixes (Firebase path + Turso reconcile) — backlog per user.