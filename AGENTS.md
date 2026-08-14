# LuxInfra — Project Rules

## Working rules

- **ALWAYS update the todo list after doing tasks.** Mark each item `completed` the moment it is done — never batch, never leave stale. If scope changes, update todos before proceeding.
- Never start implementing unless the user explicitly asks you to. Research/planning is fine; code changes need an explicit request.
- Match existing codebase patterns. Follow the conventions in the file you're editing.
- Fix root causes, not symptoms. Verify with build/tests before claiming done.
- Never suppress type errors with `as any`, `@ts-ignore`, `@ts-expect-error`.
- Only commit/push when explicitly requested.
- **Never install anything (packages, tools, SDKs, global CLIs, system software) without explicit approval.** Do not run installs "just in case" — ask first.
- Never take major/risky decisions unilaterally (installs, deletions, force-push, resets, changing infra/config, upgrading dependencies) — always ask before proceeding.
- Don't do anything that could harm or modify the user's device/system outside the project scope without asking first.
- **Budget cap: use a maximum of ~125 credits per task in worst-case scenarios.** Plan and prioritize work to fit this budget — scope down, batch operations, and avoid redundant exploration/tool calls rather than blowing past the cap.

## Branch-deployment rule (MANDATORY)

| Branch | Contains | Deploys to |
|---|---|---|
| `luxinfra-frontend` | frontend only | Netlify |
| `luxinfrabackend` | backend only | Render |
| `luxinfra` | combined monorepo (source of truth) | — |

- **Frontend code (anything under `frontend/`) → push to `luxinfra-frontend`.** Backend code (anything under `backend/`) → push to `luxinfrabackend`. Never commit FE code only on `luxinfra` and call it done — it will never deploy.
- Commit to `luxinfra` (monorepo) as the source of truth AND sync the change to the matching deploy branch. FE changes sync to `luxinfra-frontend`, BE changes sync to `luxinfrabackend`.
- Before pushing a deploy branch, build/typecheck it and verify it deploys (Render: `luxinfrabackend`, Netlify: `luxinfra-frontend`).
- Do not push to legacy branches (`main`, `dotnet-backend`, `react-frontend`, `maui-monolith`).

## Stack

- Backend: .NET (ASP.NET Core) — `backend/`, controllers in `backend/Controllers`, services in `backend/Services` / `backend/LuxInfra.Core/Services`, models in `backend/LuxInfra.Core/Models`, SQLite via sqlite-net.
- Frontend: React + Vite + TypeScript — `frontend/src/pages`, API client `frontend/src/api.ts`, UI kit `frontend/src/ui.tsx` (or `ui.ts`).
- Prod: backend on Render (`assistant1-2.onrender.com`), frontend on Netlify.

## Backups

- Primary: Turso cloud sync + Firebase backup (automatic, background services).
- Secondary: Google Drive backup (`DriveBackupService`) — uploads a full DB snapshot which includes all uploaded files (FileBlob blobs are stored inside SQLite). Exposed on the Backup page and Integrations page.