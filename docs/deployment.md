# LuxInfra — Deployment Guide (current: React + .NET API)

LuxInfra is a web app for a construction/interior business — chat-based expense logging,
billing (parties, items, transactions, cash/bank, cheques), project management (tasks,
materials, attendance, MOM, design files), analytics, reports, and an optional open-source
DeepSeek AI chat. It is a **React frontend + .NET 10 API** backed by SQLite.

## Safety Rule

- Perform only safe development work: inspect and edit project files, and run low-risk static checks or builds only when explicitly permitted by the user.
- Do not unit test, launch, start, configure, or otherwise operate an MCP server or any local server unless the user explicitly asks in the current conversation.
- Do not run local unit tests unless the user explicitly asks to run them. The user may run them independently, or explicitly tell the assistant when to do so.
- Do not install software, packages, extensions, tools, or dependencies without explicit user approval.
- Do not access, browse, scan, or explore external systems, services, websites, networks, or resources without explicit user approval.
- Before any approved action that could alter the device, install software, consume resources, expose data, or otherwise create a risk, warn the user about the specific action and potential impact, then wait for confirmation.

## Solution layout (current branches)

| Branch | Contains | Deployed to |
|---|---|---|
| `luxinfra-frontend` | React + Vite frontend | Netlify |
| `luxinfrabackend` | .NET 10 API (`LuxInfra.Api`) | Render |
| `luxinfra` | combined monorepo (both, kept in sync via cherry-pick) | — |
| `main` / `dotnet-backend` / `react-frontend` / `maui-monolith` | legacy, do not deploy | — |

> Deploy from `luxinfra-frontend` and `luxinfrabackend`. **Do not** use `main` — it is the old
> Blazor/MAUI app. Pushes to those two branches auto-deploy (see config below); you should not
> need to redeploy manually after a push.

---

## 1) Backend → Render (branch `luxinfrabackend`)

1. Render → New → Web Service → connect the GitHub repo `assistant1`.
2. Branch: **`luxinfrabackend`** (not `main`, not `dotnet-backend`).
3. Render auto-detects the repo `render.yaml` (Docker, `autoDeploy: true`).
   - If it doesn't auto-apply, choose Docker + the root `Dockerfile`.
4. Health check: `/` returns 200 with `{ "service": "LuxInfra API" }`.
5. Default login (override via env vars if you want):
   - `AUTH_USER=admin`, `AUTH_PASS=admin123`, `API_TOKEN=lux-admin-token-2024`
6. The app binds `0.0.0.0:$PORT` on Render (handled in `Program.cs`).

### Optional env vars (set in Render dashboard, then Save + Deploy once)
- `TURSO_URL` + `TURSO_TOKEN` — mirrors SQLite to Turso so data survives Render free-tier redeploys.
- `OPENROUTER_API_KEY` — enables the DeepSeek AI chat (free key from openrouter.ai/keys).
- `AUTH_USER` / `AUTH_PASS` — only set if you want non-default login.

---

## 2) Frontend → Netlify (branch `luxinfra-frontend`)

1. Netlify → Add new site → Import Git → repo `assistant1`.
2. **Production branch: `luxinfra-frontend`** (not `main`, not `react-frontend`).
3. Netlify reads `netlify.toml` at the repo root:
   - build base `frontend`, command `npm run build`, publish `dist`, SPA rewrite `/* → /index.html`.
   - Do **not** set a conflicting Base directory in the Netlify UI.
4. The production build already points at the Render API
   (`https://assistant1-2.onrender.com`) — no `VITE_API_URL` needed. Only set it if the
   API URL changes.

---

## 3) Local development

```powershell
# API on http://localhost:5050
dotnet run --project backend -c Release --urls http://localhost:5050

# Frontend on http://localhost:5173 (Vite proxies /api to :5050)
cd frontend; npm install; npm run dev
```

Login locally with `admin` / `admin123`.

---

## Why I don't need to redeploy manually after every push

- **Netlify**: production branch `luxinfra-frontend` → any push to that branch triggers a build+deploy.
- **Render**: `autoDeploy: true` (from `render.yaml`) + service pinned to branch `luxinfrabackend` →
  any push to that branch triggers a build+deploy.
- Keep the two branches in sync by cherry-picking commits from `luxinfra` (combined) to each.

### If the wrong app shows up
The old "AI Chat Assistant" site is the legacy frontend. Fix by setting the Netlify production
branch to **`luxinfra-frontend`** and re-deploying (Deploy → Clear cache & deploy site).

## Troubleshooting
- **401 on every `/api` call** — you need `Authorization: Bearer lux-admin-token-2024` on every
  request except `/api/auth/login`.
- **"Invalid username or password"** — use `admin` / `admin123`. If you set `AUTH_USER`/`AUTH_PASS`
  env vars on Render, use those values instead.
- **Login works locally but not on Render** — Render may still run an old build: push to
  `luxinfrabackend` and let auto-deploy run, or Deploy manually once.
- **Render free-tier disk wipes on redeploy** — enable `TURSO_URL`/`TURSO_TOKEN` to persist data.
- **`DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false`** is set in the Dockerfile so ASP.NET doesn't
  crash under Render's low inotify limit.

if architecture is huge break into chns and code dont plan all simultaneously
