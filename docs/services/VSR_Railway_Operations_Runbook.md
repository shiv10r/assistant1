# VSR Railway Operations Runbook

## Status

Railway backend modules (Inspection, Maintenance, Crowd Operations) and frontend
API/offline layer are implemented on feature branches. Backend persistence wiring,
migrations, and production deployment are pending user approval.

## Feature Flags

| Variable | Default | Purpose |
|---|---|---|
| `RAILWAY_ENABLED` | `false` | Master switch for all Railway endpoints |
| `RAILWAY_INSPECTION_ENABLED` | `true` | Inspection/defect capability |
| `RAILWAY_MAINTENANCE_ENABLED` | `true` | Work order capability |
| `RAILWAY_CROWD_ENABLED` | `true` | Crowd operations capability |
| `RAILWAY_LIVE_ADAPTERS_ENABLED` | `false` | Live crowd ingestion adapters |
| `RAILWAY_OFFLINE_PACK_MAX_AGE_HOURS` | `72` | Offline field pack expiry |

## API Endpoints

- `GET/POST /api/railway/inspections` — inspection runs and findings
- `GET/POST/PATCH /api/railway/defects` — defect register and triage
- `GET/POST /api/railway/work-orders` — work order lifecycle (approve, complete)
- `GET/POST /api/railway/maintenance/plans` — preventive plans and generation
- `GET/POST /api/railway/crowd/*` — observations, alerts, incidents, ingestion

## Rollback

Disable capabilities via the `RAILWAY_*_ENABLED` flags. No destructive data changes.

## Known Limitations

- EF Core persistence registration for Railway entities not yet wired into AppDbContext
- Database migrations for Railway tables not yet generated
- HMAC signature verification in ingestion controller is a stub
- SignalR realtime invalidation hub not yet implemented
- Frontend screens consume APIs; until backend is deployed they show explicit error states

## Validation Commands

Backend: `dotnet build src/VSRSystemsBackend.Api/VSRSystemsBackend.Api.csproj`
Frontend: `npm run build && npm run lint`
