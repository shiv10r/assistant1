# LuxInfra — Firebase Persistence Implementation Plan

## Goal
Keep the **SQLite DB as the live, local source of truth** (fast reads/writes, all reports/queries/exports work unchanged) and use **Firebase free tier** purely as a **mirror + recovery copy** so data survives Render free-tier redeploys (which wipe the disk). Users must log in and see the data exactly where they left off — and the app should auto-refresh on login and when data changes.

## Why this design (feasibility)
- Render free tier wipes the local disk on every redeploy → `data/luxinfra.db3` resets → app looks empty ("keeps navigating").
- Firestore documents have a **1 MB limit** — the SQLite file will exceed it, so the whole DB cannot live in a Firestore document.
- **Firebase Storage** (free: 5 GB) is built for binary files → the entire `db3` is uploaded/downloaded as one blob. Most feasible + free.
- A tiny **Firestore `meta/data` document** stores `dataVersion` + `updatedAt` so the frontend can detect changes cheaply.
- Frontend polls `/api/backup/version` every ~20 s and **auto-refreshes the active page** when `dataVersion` changes → live feel without a heavy rewrite. On login, the app always loads fresh anyway.

## Architecture

```
[Browser]  ── REST /api ──▶  [.NET backend]  ── live reads/writes ──▶  [SQLite luxinfra.db3]
    ▲                            │  │
    │ poll /api/backup/version   │  │ FirebaseSyncService (every 30s, only if changed)
    │ every 20s                  ▼  ▼
    └── dataVersion changed? ──  [Firebase Storage: luxinfra.db3]   (5 GB free)
         → auto-refresh page        [Firestore meta/data: {dataVersion, updatedAt}]

Startup / after redeploy:
  local db3 empty/missing?  →  download luxinfra.db3 from Storage  →  restore  →  serve
```

## Backend changes
1. **`backend/LuxInfra.Api.csproj`** — add packages `Google.Cloud.Firestore` (version meta doc) + `Google.Cloud.Storage.V1` (blob upload/download).
2. **`backend/Services/FirebaseSyncService.cs`** (new) — mirrors `TursoSyncService`:
   - Reads `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT` (base64 JSON or path), optional `FIREBASE_BUCKET`.
   - **Reconcile on start**: local empty → restore from Storage; else push.
   - **Periodic**: every 30 s, if the `db3` file's mtime changed → upload to Storage + bump `meta/data.dataVersion`.
   - **`PushNowAsync` / `PullNowAsync` / `StatusAsync`** for the manual endpoints.
3. **`backend/LuxInfra.Core/Services/DatabaseService.cs`** — add a `CloseAndResetAsync()` so the restore path can replace the file while the connection is open.
4. **`backend/Controllers/BackupController.cs`** — add `/api/backup/version` (returns `dataVersion`), plus `firebase-push` / `firebase-pull` routes.
5. **`backend/Program.cs`** — register `FirebaseSyncService` as hosted service; no-op when env vars unset.

## Frontend changes
6. **`frontend/src/api.ts`** — add `backupVersion()` call + `BackupVersion` type.
7. **`frontend/src/App.tsx`** (or a small `useDataVersion` hook) — poll `backupVersion()` every ~20 s; when `dataVersion` changes, bump a `refreshKey` passed to `<Routes key={refreshKey}>` so the active page remounts and re-fetches (auto-refresh on data change). Login already mounts the app fresh.

## What is required from you (setup)
1. Create a **Firebase project** (free Spark plan) at https://console.firebase.google.com.
2. Enable exactly **two** services in that project:
   - **Cloud Storage for Firebase** — holds the `luxinfra.db3` backup blob (Build → Storage → Get started). Bucket becomes `<project-id>.appspot.com`.
   - **Cloud Firestore** — holds the `meta/data` version doc (Build → Firestore Database → Create database, production mode).
   - *Not needed:* Authentication, Realtime Database, Firebase Hosting.
3. Generate a **service account JSON** (Project settings → Service accounts → Generate new private key). Save it.
4. On Render, set these env vars (restart/redeploy after adding):
   - `FIREBASE_PROJECT_ID` = your Firebase project id
   - `FIREBASE_SERVICE_ACCOUNT` = base64 of the JSON file (easiest on Render), **or** path to the JSON
   - `FIREBASE_BUCKET` = optional; defaults to `<project_id>.appspot.com`
5. After the first deploy, hit **Backup → Firebase → Upload to Firebase** once to upload the current DB. From then on every change auto-syncs and survives redeploys.

## Env var summary
| Variable | Required | Purpose |
|---|---|---|
| `FIREBASE_PROJECT_ID` | yes | Which Firebase project to use |
| `FIREBASE_SERVICE_ACCOUNT` | yes | base64 service-account JSON (or file path) |
| `FIREBASE_BUCKET` | no | Storage bucket; defaults to `<project_id>.appspot.com` |

## Notes / trade-offs
- No data-layer rewrite: SQLite stays the live DB; Firebase is backup + recovery.
- Login system is unchanged for now (admin/staff token auth stays).
- "Realtime" = periodic push every ~30 s + frontend auto-refresh poll every ~20 s. Near-realtime and free; a true WebSocket/onSnapshot upgrade can come later.
- Firestore free: 20k writes/day (1 meta doc update/push is negligible). Storage free: 5 GB.
- If the DB file grows beyond ~1 GB the free Storage tier is exceeded — unlikely for this app.
