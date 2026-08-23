# Travel

- Purpose: destinations, packages, departures, bookings, and trips.
- Routes: `/travel/*`, owned by `routes.tsx`; API access stays in `travelApi.ts`.
- Backend boundary: `Travel`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
