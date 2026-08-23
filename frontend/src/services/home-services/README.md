# Home Services

- Purpose: service catalog, bookings, professionals, pricing, and operations.
- Routes: `/home-services/*`, owned by `routes.tsx`; API and state stay in `homeServicesApi.ts` and `homeServicesStore.ts`.
- Backend boundary: `HomeServices`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
