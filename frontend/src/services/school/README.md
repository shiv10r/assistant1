# School

- Purpose: students, academics, attendance, fees, staff, and administration.
- Routes: `/school/*`, owned by `routes.tsx`.
- Backend boundary: `School`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
