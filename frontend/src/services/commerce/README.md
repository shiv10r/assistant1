# Commerce

- Purpose: catalog, products, cart, checkout, offers, and wishlist.
- Routes: `/commerce/*`, owned by `routes.tsx`; state stays in `commerceStore.ts`.
- Backend boundary: `Commerce`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
