# LuxInfra — Project Rules

## Working rules

- **ALWAYS update the todo list after doing tasks.** Mark each item `completed` the moment it is done — never batch, never leave stale. If scope changes, update todos before proceeding.
- Never start implementing unless the user explicitly asks you to. Research/planning is fine; code changes need an explicit request.
- Match existing codebase patterns. Follow the conventions in the file you're editing.
- Fix root causes, not symptoms. Verify with build/tests before claiming done.
- Never suppress type errors with `as any`, `@ts-ignore`, `@ts-expect-error`.
- Only commit/push when explicitly requested.

## Stack

- Backend: .NET (ASP.NET Core) — `backend/`, controllers in `backend/Controllers`, services in `backend/Services` / `backend/LuxInfra.Core/Services`, models in `backend/LuxInfra.Core/Models`, SQLite via sqlite-net.
- Frontend: React + Vite + TypeScript — `frontend/src/pages`, API client `frontend/src/api.ts`, UI kit `frontend/src/ui.tsx` (or `ui.ts`).
- Prod: backend on Render (`assistant1-2.onrender.com`), frontend on Netlify.

## Backups

- Primary: Turso cloud sync + Firebase backup (automatic, background services).
- Secondary: Google Drive backup (`DriveBackupService`) — uploads a full DB snapshot which includes all uploaded files (FileBlob blobs are stored inside SQLite). Exposed on the Backup page and Integrations page.