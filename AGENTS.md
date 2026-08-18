# Repository Agent Rules

## Code-First Workflow

- Do not create diagrams, mockups, wireframes, or visual companions unless the user explicitly requests them.
- Time-box initial codebase mapping to three minutes or three focused context lookups, whichever comes first.
- Begin implementation within five minutes when the request is concrete and no critical information is missing.
- Do not prolong analysis to pursue exhaustive context. Map only the files, symbols, and conventions required for the first working slice.
- Implement in small vertical chunks of one to three closely related files.
- Each chunk must produce observable progress and be verified before starting the next chunk.
- Prefer a minimal working implementation followed by iterative expansion over a large up-front design phase.
- Ask a question only when missing information materially changes the implementation or the action is irreversible.
- For frontend requests, write code directly against the existing `DESIGN.md` and shared component system; do not pause for unsolicited design artifacts.
- If an implementation agent or coding tool aborts once, switch immediately to direct coding in a small verified chunk instead of restarting planning.
- For continuation work with approved architecture and a concrete next step, do not invoke planning agents, reload workflow guidance, or repeat repository mapping; make the first code edit after at most three focused lookups.
- Do not launch local browser sessions, preview servers, Playwright/MCP checks, screenshot capture, or visual-QA agents unless the user explicitly requests them; run repository CLI checks and leave manual UI testing to the user.

## Session Learning

- At the end of each work session, add any durable process lesson to this file so future sessions improve.
- Record only reusable rules that prevent a repeated failure or improve delivery; do not add temporary task details or duplicate existing rules.
- When the user provides an architecture document and explicitly says to implement it, treat that document as the approved scope contract and move directly to the first coding chunk instead of recreating the design process.
- Treat `frontend/src/lib/services.ts` as the source of truth for workspace names, taglines, home routes, and availability; chooser, dashboard, and navigation consumers must not hard-code disabled or coming-soon states.
- At session completion, include all changed TODO and Markdown files in the commit instead of leaving them pending, unless the user explicitly excludes them.

Always  scan  agents.md for new rules  todo.md  for new tasks since it got updates there 

U r not supposed  to  work or do anything outside the project folder i.e outside d drive in current  device stop immediatly if reached there  however u wont  because there is not  work  u work is limited to frontend and backend folder only 

Always commit on respective frontend backend  branch  when  small  todo is done  or after  1 hours of  coding the  resume work so that i  amware  of what changes u have  done and what is the progress

## Commit/PR Policy (user confirmed)

- Do NOT commit or push after every tiny step. Push only when: (a) the complete task list / todo is done, OR (b) a major chunk of work is complete (~2 hours of coding), OR (c) the user asks for a progress push.
- There must ALWAYS be a commit to both the frontend and backend branch once the current todo/task list is done.
- After pushing new work to the frontend repo (`develop01`), always raise the PR to `luxinfra-frontend` and auto-merge it (see Frontend Auto-Sync rule below).

https://github.com/shiv10r/VSRSystemsBackend/tree/develop03
bakcned 03 branch

## Frontend Auto-Sync (develop01 -> luxinfra-frontend)

- After pushing new work to `origin/develop01` (repo `shiv10r/assistant1`), automatically raise a PR from `develop01` to `luxinfra-frontend` and merge it (squash) so the luxinfra frontend branch stays in sync.
- `gh` CLI is not installed on this machine. Use the GitHub REST API directly: extract the stored credential via `git credential fill` (protocol=https, host=github.com), then POST `/repos/shiv10r/assistant1/pulls` (head=develop01, base=luxinfra-frontend) and PUT `/repos/shiv10r/assistant1/pulls/{number}/merge` with `merge_method=squash`.
- If the API returns "No commits between luxinfra-frontend and develop01", the branches are already in sync — skip and report that nothing was merged.
- Never force-push or rewrite `luxinfra-frontend`; only ever merge `develop01` into it.