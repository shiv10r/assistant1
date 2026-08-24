# Engineering Log

This file records major completed engineering work across the VSR frontend. Add dated entries; do not use it as a backlog.

## 2026-08-24

### Deployment and Runtime

- Aligned the Netlify deployment branches with the current modular frontend.
- Corrected the production API host to `vsrsystemsbackend-1.onrender.com`.
- Removed unsupported shell polling that generated background 404 requests.
- Verified deployed frontend artifacts, Render health endpoints, module APIs and CORS.
- Preserved the local PostgreSQL development environment and Supabase production separation.

### Shared Persistence

- Verified GET and PUT module-document persistence against Supabase PostgreSQL.
- Documented that current module collections are JSON documents in `ModuleDataDocuments`.
- Confirmed production seeding is disabled while local sample seeding remains enabled.

### VSR Interiors V2

- Reframed the service from a basic AI-design MVP into a studio delivery workspace.
- Added a studio command center with portfolio, approval, work, risk, pipeline, spend and milestone analytics.
- Added project client, designer, phase, priority, progress, target-date and geolocation metadata.
- Added portfolio-wide Design Studio navigation.
- Added Site Planner with geocoding, location capture, nearest-site ranking and Google Maps navigation.
- Added Execution Studio with work board, procurement tracking and client approvals.
- Added persistent task, procurement and decision collections.
- Fixed AI generation completion for rooms with uploaded images.
- Fixed cascading project/room deletion and missing room-height input.
- Added responsive interior-specific visual styling without duplicating shared platform components.
- Added `docs/services/interior-design-service-v2.md` as the service architecture source.

### Global Frontend Workspace

- Rebuilt the authenticated shell with a responsive workspace sidebar, contextual top bar and consolidated account controls.
- Added persisted cobalt, violet, teal, rose, amber and neutral paper accent choices while preserving semantic status colors.
- Added a metadata-driven operations workspace across interior, warehouse, school, hotel, travel, news, jobs, commerce, bank, medical and home services.
- Tailored portfolio names, KPIs, customers, locations, visits, people roles, starter data and AI prompts to each industry.
- Added shared portfolio CRUD, visit scheduling, location maps, directions, workforce attendance, operational AI briefs and workspace files.
- Kept consumer portals coherent by omitting employee attendance while adapting projects and visits into journeys, care plans, goals, purchases and job targets.
- Added an IndexedDB file provider boundary that can be replaced by managed cloud storage without changing the workspace UI.
- Enabled workspace search, account, plan and weather access consistently for both admin and portal services.
