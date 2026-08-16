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

## Session Learning

- At the end of each work session, add any durable process lesson to this file so future sessions improve.
- Record only reusable rules that prevent a repeated failure or improve delivery; do not add temporary task details or duplicate existing rules.
- When the user provides an architecture document and explicitly says to implement it, treat that document as the approved scope contract and move directly to the first coding chunk instead of recreating the design process.
- At session completion, include all changed TODO and Markdown files in the commit instead of leaving them pending, unless the user explicitly excludes them.
