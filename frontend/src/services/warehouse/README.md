# Warehouse

- Purpose: inventory, procurement, orders, fulfilment, staff, and projects.
- Routes: `/warehouse/*`, owned by `routes.tsx`.
- Backend boundary: `Warehouse`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
