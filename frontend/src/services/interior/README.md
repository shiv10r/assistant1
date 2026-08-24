# Interior

- Purpose: end-to-end interior studio operations from client brief and AI concepts through procurement, execution, and handover.
- Routes: `/interior/*`, owned by `routes.tsx`.
- Backend boundary: `Interior`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Architecture: `docs/services/interior-design-service-v2.md`.
- Persisted collections: projects, rooms, designs, products, tasks, procurement, and decisions.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
