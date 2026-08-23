# Interior

- Purpose: interior design projects, rooms, products, designs, and quotations.
- Routes: `/interior/*`, owned by `routes.tsx`.
- Backend boundary: `Interior`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
