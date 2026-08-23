# Medical

- Purpose: doctors, appointments, patients, prescriptions, labs, and records.
- Routes: `/medical/*`, owned by `routes.tsx`; state stays in `medicalStore.ts`.
- Backend boundary: `Medical`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
