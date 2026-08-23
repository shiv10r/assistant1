# News

- Purpose: news discovery, categories, articles, search, and bookmarks.
- Routes: `/news/*`, owned by `routes.tsx`.
- Backend boundary: `News`.
- Shared dependencies must come from `src/platform`; never import another service's business code.
- Verify with `npm run build`, `npm run lint`, and `npm run check:chunks`.
