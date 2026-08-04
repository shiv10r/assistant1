# LuxInfra — Expense Assistant for Interiors Businesses

Chat with it ("site A paint exp = 5k"), it categorizes and stores expenses locally (SQLite), and shows
dashboard/report views. Built as a **React frontend + .NET backend** (separate branches).

## Repository layout (branches)

| Branch | Contains | How to run |
|--------|----------|------------|
| `main` / `upload-main` | Original monolith (`.NET MAUI` + `Blazor`) — the legacy Windows/mobile app | `run-infra.bat` |
| **`dotnet-backend`** | `backend/` — .NET 10 REST API (REST, SQLite, CORS) | `cd backend && dotnet run` |
| **`react-frontend`** | `frontend/` — React + TypeScript + Vite SPA | `cd frontend && npm run dev` |

The `dotnet-backend` and `react-frontend` branches are the **new separated architecture**. The frontend
talks to the backend over HTTP (JSON). No database server needed — everything is a single SQLite file.

## Running locally

Backend first, then frontend (the frontend proxies `/api` → backend on port 5050):

```bash
# terminal 1 — backend on http://localhost:5050
cd backend && dotnet run

# terminal 2 — frontend on http://localhost:5173
cd frontend && npm run dev
```

Open <http://localhost:5173>.

## Backend API

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/assistant/send` | Chat: log expense, totals, summary, undo |
| GET | `/api/dashboard` | Today / month / grand totals + per-site |
| GET | `/api/reports?period=Today\|Week\|Month\|All` | Report data |
| GET | `/api/reports/export/{xlsx\|pdf\|png}` | Download report |
| GET | `/api/billing/*` | Billing KPIs, parties, items, txns, cash |
| GET | `/api/projects`, `/api/projects/{id}` | Projects + details |

## Deploying

### Backend → Render (branch: `dotnet-backend`)
1. Render → New Web Service → GitHub repo `assistant1`, branch **`dotnet-backend`**.
2. **Root Directory = repo root** (`./` — *not* `backend`; the Dockerfile at root needs `LuxInfra.Core`).
3. Runtime **Docker** (root `Dockerfile` is used). Plan Free.
4. Redeploy on each commit. URL: `https://<name>.onrender.com`.

### Frontend → Netlify (branch: `react-frontend`)
1. Netlify → Add new site → Import Git → repo `assistant1`, branch **`react-frontend`**.
2. Configure via `frontend/netlify.toml` (base `frontend`, publish `dist`, SPA rewrite `/* → /index.html`). **Do not** set a conflicting Base directory in the UI.
3. Build command `npm run build`, publish directory `dist`.
4. Add env var **`VITE_API_URL`** = `https://<your-api>.onrender.com` (must be a fresh build to take effect).

## Gotchas

- **CORS** — the backend allows any origin; no change needed when the Netlify domain changes.
- **Config watcher** — the Dockerfile disables config reload (`DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false`)
  because Render's low inotify limit crashes ASP.NET at startup otherwise.
- **Free-tier data** — Render free instances have no persistent disk; the SQLite DB resets on redeploy.
  For real persistent data, add a Render disk (paid) or point the DB path to a mounted volume.
- **Deep links** — Netlify needs the SPA rewrite (`netlify.toml`) so routes like `/dashboard` don't 404.

## Reporting & export

Excel / PDF / PNG downloads are available from the Reports page (`/api/reports/export/{format}`).