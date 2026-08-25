# VSR Real-World Integration TODO

Source: `VSR_RealWorld_Features_Integration_Master_Plan.md`

## Status Summary

| Status | Count |
|---|---:|
| Done | 5 |
| Partially done | 6 |
| Pending | 10 |
| Blocked | 2 |
| **Total** | **23** |

## Done (5)

1. Identity and authentication.
2. Maps, weather, and AI gateways.
3. Shared dashboard, attendance, tables, and UI.
4. Signed storage with billing confirmation.
5. Home Services authorized chat, realtime updates, typing indicators, read receipts, and reconnect history.

## Partially Done (6)

1. Permissions and RBAC.
2. Notification delivery.
3. Documents and storage platform.
4. Settings, branding, and feature flags.
5. Observability and resilience.
6. Product deepening.

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

## Blocked (2)

1. Rotate the exposed Supabase database password and move it to Render `ConnectionStrings__DefaultConnection`. Requires production credential access.
2. Configure and validate email delivery using Render `RESEND_API_KEY` and `UPLOAD_NOTIFICATION_EMAIL`. Requires Render configuration access.

## Status Rules

- Mark an item done only after its definition of done is satisfied and tests pass.
- Keep partial items in this file until every required backend, frontend, authorization, and test path is complete.
- Update the totals whenever an item changes status.
