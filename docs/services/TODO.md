# VSR Real-World Integration TODO

Source: `VSR_RealWorld_Features_Integration_Master_Plan.md`

## Status Summary

| Status | Count |
|---|---:|
| Done | 5 |
| Partially done | 6 |
| Pending | 10 |
| Blocked | 1 |
| **Total** | **22** |

## Done (5)

1. Identity and authentication.
2. Maps, weather, and AI gateways.
3. Shared dashboard, attendance, tables, and UI.
4. Signed storage with billing confirmation.
5. Home Services authorized chat, realtime updates, typing indicators, read receipts, and reconnect history.

## Partially Done (6)

1. Permissions and RBAC.
   - ✅ Backend RBAC: Permission/Role entities, 11 chat context authorizers, unit tests for home-services.
   - ✅ Frontend: PermissionGate component created (`platform/ui/PermissionGate.tsx`), exported from `platform/ui/index.ts`.
   - 🟡 TODO: Frontend PermissionGate integration across module UIs; unit tests for the 10 non-home-services chat authorizers.
2. Notification delivery.
   - ✅ School, Bank, Medical: Notification pages + persisted storage.
   - ✅ Warehouse, Hotel, News, Jobs, Commerce, Travel, Interior: Notification pages + routes added.
   - ✅ Home Services: Notification system in `homeServicesStore` + API.
   - 🟡 TODO: Configure Resend API on Render for email delivery; add unread count badges to module shells; implement notification delivery retries.
3. Documents and storage platform.
   - ✅ Supabase signed URL storage (private bucket `project-media`, 25 MB limit) with browser fallback.
   - ✅ Browser IndexedDB storage (`vsr-workspace-files` DB) as default provider.
   - ✅ `ModuleDataDocument` generic metadata entity; `ChatMessageDocument` for MongoDB chat messages.
   - ✅ Billing confirmation gate (`confirmBillableAction`) centralizes cost-aware upload/download gates.
   - ✅ Operations workspace (OperationsWorkspace, ProjectLibrary) uses `fileStorage` with supabase opt-in.
   - 🟡 TODO: Integrate document metadata platform across remaining modules; add per-module document UI; ensure VITE_FILE_STORAGE_PROVIDER works consistently; add document routing per module.
4. Settings, branding, and feature flags.
   - ✅ Backend configuration contracts and feature-flag service baseline added.
   - 🟡 TODO: Persist settings by organization; add authorized settings APIs and frontend controls; enforce module visibility from the organization configuration.
5. Observability and resilience.
   - ✅ Correlation IDs, structured logging context, OpenTelemetry instrumentation, optional OTLP export, and standard resilience for map, weather, and job-scraper clients added.
   - ✅ Correlation middleware tests added.
   - 🟡 TODO: Configure production telemetry export and dashboards; add service-level alerts and resilience coverage where retry semantics are safe.
6. Product deepening.
   - ✅ Interior client registry and explicit client-to-project links added as the first workflow slice.
   - 🟡 TODO: Complete the remaining module workflows and backend persistence sequences defined in the master plan.

## Pending (10)

1. Organizations and tenancy.
2. Platform audit engine.
3. Import/export engine.
4. Reports and PDF infrastructure.
5. Workflow and approval engine.
6. Domain events and transactional outbox.
7. Background job dispatcher.
8. Global and module search platform.
9. Support and ticketing platform.
10. Railway backend module.

## Blocked (1)

1. Configure and validate email delivery using Render `RESEND_API_KEY` and `UPLOAD_NOTIFICATION_EMAIL`. Requires Render configuration access.

## Status Rules

- Mark an item done only after its definition of done is satisfied and tests pass.
- Keep partial items in this file until every required backend, frontend, authorization, and test path is complete.
- Update the totals whenever an item changes status.
