# Hotel

- Purpose: reservations, rooms, guests, and housekeeping.
- Routes: `/hotel/*`, owned by `routes.tsx`.
- Backend boundary: `Hotel`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
