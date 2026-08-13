# Repository Rules

These rules must be followed for every change in this repository.

## Branch rules

- **Always push final changes to `main`.**
- Work must be developed on the **respective branches** only:
  - `luxinfra` — combined/primary application branch
  - `luxinfrabackend` — backend-only work
  - `luxinfra-frontend` — frontend-only work
- **Never commit or push to any other branch names** (e.g. `feat/*`, feature branches, scratch branches). A previous push landed on a different branch (`feat/firebase-integration`) — this must not happen again.
- Before starting work, check out the correct branch:
  - Backend work → `luxinfrabackend`
  - Frontend work → `luxinfra-frontend`
  - Full-stack / combined → `luxinfra`
- After merging work, keep `main` up to date via the respective branch.

## Workflow (PR-based)

1. Confirm the working branch matches the type of change (see above).
2. Make the change, verify builds/tests pass.
3. Commit locally on the respective branch.
4. Push to `origin` on the same respective branch.
5. Open a Pull Request from the working branch into `main` (or `luxinfra` for full-stack changes).
6. Enable **auto-merge** on the PR so it merges automatically once checks pass.
7. After merge, ensure `main`/`luxinfra` is up to date and continue.

## Never

- Never push directly to a random name.
- Never leave a feature branch as the final resting place of committed work.