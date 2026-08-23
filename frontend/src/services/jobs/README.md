# Jobs

- Purpose: job discovery, companies, applications, candidate profiles, and saved jobs.
- Routes: `/jobs/*`, owned by `routes.tsx`; candidate state stays in `candidateStore.ts`.
- Backend boundary: `Jobs`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
