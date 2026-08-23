# Bank

- Purpose: accounts, transactions, transfers, cards, loans, and administration.
- Routes: `/bank/*`, owned by `routes.tsx`; state stays in `bankStore.ts`.
- Backend boundary: `Bank`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
