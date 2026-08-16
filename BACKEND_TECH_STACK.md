# Backend Tech Stack - LuxInfra

## Overview
The backend for LuxInfra is a **.NET 10 Web API** project that lives on a separate Git branch (`luxinfrabackend` / `dotnet-backend`). The local `backend/` folder currently contains only build artifacts (`bin/`, `obj/`, `_buildcheck/`) — the actual source code is not checked out on the current `luxinfra-frontend` branch.

---

## Repository Structure (on `luxinfrabackend` branch)

```
backend/
├── LuxInfra.Api/          # Web API entry point
├── LuxInfra.Core/         # Models, Repositories, Services
├── data/
│   └── luxinfra.db3       # SQLite single-file database
└── Dockerfile             # Container build for Render
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | .NET 10 (ASP.NET Core Web API) |
| **Language** | C# |
| **Database** | SQLite (`data/luxinfra.db3`) — optional **Turso** cloud mirror |
| **ORM / Data Access** | Custom repositories in `LuxInfra.Core` |
| **Authentication** | JWT / Firebase Auth integration |
| **API Style** | RESTful controllers (19 controllers) |
| **Containerization** | Docker |
| **Deployment** | Render (via `render.yaml`) |
| **Branch** | `luxinfrabackend` (auto-deploy enabled) |

---

## API Controllers (19 Total)

| Controller | Domain |
|------------|--------|
| `AuthController` | Authentication & authorization |
| `BillingController` | Billing & payments |
| `ProjectsController` | Project management |
| `InteriorDesignController` | Interior design modules |
| `ModulesController` | Dynamic module system |
| `InsightsController` | Business insights |
| `AnalyticsController` | Analytics & reporting |
| `ReportsController` | Report generation |
| `BroadcastController` | Notifications/broadcasts |
| `PushController` | Push notifications (FCM) |
| `WeatherController` | Weather integration (Open-Meteo) |
| `FirebaseController` | Firebase operations |
| `BackupController` | Backup & restore (Google Drive) |
| `IntegrationsController` | Third-party integrations |
| `AssistantController` | AI assistant (DeepSeek/OpenRouter) |
| `DashboardController` | Dashboard data aggregation |
| `ActivityController` | Activity logging |

---

## Integrations (Conditional — No-op when unconfigured)

| Integration | Purpose |
|-------------|---------|
| **DeepSeek / OpenRouter** | AI/LLM features |
| **Razorpay + UPI** | Payments |
| **Google Drive** | Backup storage |
| **Email / WhatsApp / GST e-invoice** | Communications & compliance |
| **FCM (Firebase Cloud Messaging)** | Push notifications |
| **Open-Meteo** | Weather data |

---

## Frontend-Backend Contract

The frontend (`luxinfra-frontend` branch) maintains a **TypeScript API client** (`frontend/src/lib/api.ts`, ~700 lines) that mirrors the full backend surface:

```typescript
// Namespaces
api.auth
api.billing
api.projects
api.modules          // ~30 interior-design endpoints
api.insights
api.analytics
api.reports
api.broadcast
api.push
api.weather
api.firebase
api.backup
api.integrations
api.assistant
api.dashboard
api.activity
```

---

## How to Work on Backend

```bash
# Switch to backend branch
git checkout luxinfrabackend

# Or the alternative backend branch
git checkout dotnet-backend

# The backend source will now be available in ./backend/
# Run locally:
cd backend
dotnet run --project LuxInfra.Api
```

---

## Deployment

- **Platform**: Render
- **Config**: `render.yaml` in repo root
- **Branch**: `luxinfrabackend`
- **Auto-deploy**: Enabled on push to `luxinfrabackend`
- **Container**: Docker (multi-stage build)

---

## Notes

- The backend is **decoupled** from the frontend repo — they share only the API contract (`api.ts`).
- Frontend uses **Firebase Auth** for client-side auth; backend validates JWTs.
- SQLite file (`luxinfra.db3`) is committed to `data/` for local development.
- Turso (libSQL) is configured as an optional cloud replica for production.
- All integrations are **feature-flagged** via environment variables — they no-op gracefully when not configured.

---

## Related Branches

| Branch | Purpose |
|--------|---------|
| `luxinfra-frontend` | Current frontend (React 19 + Vite + Tailwind 4) |
| `luxinfrabackend` | **Backend source — deploy branch** |
| `dotnet-backend` | Alternative backend branch |
| `luxinfra` | Legacy monolith branch |

---

*Last updated: 2026-08-16 — Based on session analysis from `ses_ffdff8511ffeBtZ6wCvpFAGazI`*