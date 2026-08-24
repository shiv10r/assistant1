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
- For concrete approved work, minimize preliminary analysis and token-heavy reporting: perform only targeted lookups needed for the next edit, then code and verify immediately.
- Treat `frontend/src/app/moduleRegistry.ts` as the source of truth for workspace metadata, routes, loaders, permissions, and availability; `frontend/src/lib/services.ts` is only the compatibility projection for existing consumers.
- At session completion, include all changed TODO and Markdown files in the commit instead of leaving them pending, unless the user explicitly excludes them.

Always  scan  agents.md for new rules  todo.md  for new tasks since it got updates there 

U r not supposed  to  work or do anything outside the project folder i.e outside d drive in current  device stop immediatly if reached there  however u wont  because there is not  work  u work is limited to frontend and backend folder only 

Always commit on respective frontend backend  branch  when  small  todo is done  or after  1 hours of  coding the  resume work so that i  amware  of what changes u have  done and what is the progress

## Commit/PR Policy (user confirmed)

- Do NOT commit or push after every tiny step. Push only when: (a) the complete task list / todo is done, OR (b) a major chunk of work is complete (~2 hours of coding), OR (c) the user asks for a progress push.
- Never commit directly to `main`, `develop*`, `luxinfra`, `luxinfra-frontend`, or any other protected/deployment branch.
- Create a descriptive branch such as `feature/<feature-name>` or `fix/<issue-name>` for every change set.
- After implementation and testing, commit and push only the feature/fix branch and raise a pull request to the intended protected branch.
- Never merge or auto-merge the pull request. The user reviews and approves every merge explicitly.
- Do not deploy the branch or update a deployment branch unless the user explicitly instructs it after testing.

https://github.com/shiv10r/VSRSystemsBackend/tree/develop03
bakcned 03 branch

## Pull Request Workflow

- Frontend pull requests normally target `luxinfra-frontend`; backend pull requests normally target `develop03` unless the user specifies another base.
- Include validation results and known limitations in the PR description.
- Leave every created PR open and unmerged for user approval.
- Never force-push or rewrite a protected branch.

First complete all the tasks of TodoHomeService.md then todo.md
