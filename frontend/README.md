# VSR Systems Frontend

React 19, TypeScript, and Vite client for the VSR Systems modular business platform.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run check:chunks
npm run check:legacy-ui
```

Development runs at `http://127.0.0.1:5173` and proxies `/api` to the ASP.NET Core API at `http://localhost:5050`.

## Structure

- `src/platform/` owns shared technical capabilities and API access.
- `src/services/` owns isolated business modules.
- `src/components/` contains reusable application UI.
- `src/routes/` defines lazy-loaded route boundaries.

Business modules must not import another module's internal code. Shared collections persist through `/api/{module}/data/{collection}` with local fallback only where explicitly supported.
