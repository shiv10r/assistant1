# Phased Frontend and Repository Refactor

## Status

Approved direction for the full-refactor initiative. This specification supersedes `2026-08-16-shared-page-primitives-design.md` only for this initiative; the earlier conservative draft remains intact as a record of the narrower option.

## Goal

Make the React application consistent, maintainable, testable, and presentation-ready without losing existing features or changing user data. Consolidate repeated UI and page mechanics, establish clear module boundaries, and organize repository documentation professionally.

## Scope

- Refactor the React frontend and repository documentation.
- Preserve all current routes, workflows, backend API contracts, domain entities, seed data, and `luxinfra:*` local-storage keys.
- Change backend code only if a verified compatibility defect blocks the frontend.
- Improve the existing deep-navy and warm-orange enterprise UI rather than replacing the product identity.
- Delete duplicate or obsolete files only after dependency and route checks prove they are unused.

## Non-Goals

- No framework migration or backend rewrite.
- No merging of Interior, Warehouse, and School domain models.
- No one-pass repository rewrite.
- No large files created merely to reduce the file count.
- No invented performance, accessibility, or coverage claims.

## Current Evidence

- `DataTable` is consumed across many service pages and has no focused tests.
- `Card` and `Modal` are high-blast-radius primitives with many consumers.
- `src/ui.tsx` duplicates responsibilities already present under `components/ui`.
- Repeated service pages implement similar search, toolbar, empty-state, table, and CRUD-modal mechanics.
- The frontend has build and lint scripts but no test command or test framework.

## Architecture

The target source model has three layers:

- `app/`: router composition, providers, application layout, navigation, and route error boundaries.
- `shared/`: domain-agnostic UI primitives, page shells, typed hooks, storage/API adapters, and formatting utilities.
- `services/`: Interior, Warehouse, and School types, seeds, pages, workflows, and route-specific actions.

Migration is incremental. Compatibility re-exports may exist only during a phase and must be removed when all consumers migrate. Shared modules must not import a service module.

File reduction means removing duplicate and obsolete modules or co-locating tightly coupled tiny modules. Each source file keeps one clear responsibility; unrelated code is never combined to meet a file-count target.

## Design System

A root `DESIGN.md` must codify the current enterprise identity before UI source changes begin. It will define color ramps, typography, spacing, depth, radii, responsive layout, focus treatment, motion, accessibility constraints, and accepted design debt.

One canonical primitive system will own buttons, inputs, selects, cards, badges, tables, dialogs, page headers, stat cards, empty states, loading states, and error states. The duplicate `src/ui.tsx` layer will be retired through staged consumer migration.

A development-only primitive showcase must render every primitive and meaningful state. It must pass visual and interaction checks at 375, 768, and 1280 pixels before service pages migrate.

Motion communicates state or affordance and uses transform, opacity, or filter. Keyboard focus, reduced motion, touch targets, semantic landmarks, labels, and contrast are required. Existing visible emojis used as navigation or service icons will migrate to the established icon system without changing labels or destinations.

## React and Data Flow

- Route modules load lazily at service or feature boundaries.
- Expensive list filtering may use deferred values or transitions when measurement shows user-input blocking.
- Domain route boundaries provide recoverable error UI.
- Local collection persistence moves behind a typed external-store adapter so consumers share synchronized state while retaining existing keys and data shapes.
- Untrusted API and browser-storage data is parsed once at its boundary; domain components receive typed values.
- Local page state remains local. Memoization is introduced only for stable contracts or measured render cost.

## Error Handling

- Route failures render a retryable domain error state instead of a blank application.
- Form failures remain next to the affected field or action.
- List loading, empty, and failure states use canonical primitives.
- Expected boundary failures are typed and observable; silent catches are removed unless the existing contract explicitly treats the operation as best effort.
- Persisted user data is never discarded silently. Invalid records are reported and left recoverable.

## Verification

- Add Vitest and Testing Library for shared hooks, adapters, and primitive behavior.
- Add Playwright scenarios for representative Interior, Warehouse, and School workflows, including one error path.
- Run TypeScript build, oxlint, focused tests, and affected E2E scenarios after each phase.
- Verify the production build in a real browser at mobile, tablet, and desktop widths.
- Run keyboard, focus, reduced-motion, accessibility, render-quality, and visual QA checks before completion.
- Measure performance in the production preview; record actual results and fix regressions at their source.

## Delivery Phases

### Phase 1: Safety Baseline

Create `DESIGN.md`, add test infrastructure, capture representative route behavior, and add the primitive showcase. This phase changes no domain workflow.

### Phase 2: Shared Foundations

Establish `app/` and `shared/` boundaries, consolidate formatting and collection storage, and add route error boundaries. Preserve compatibility imports while consumers migrate.

### Phase 3: Canonical UI

Consolidate duplicate primitives and page shells, then migrate shared components. Remove compatibility files only after all imports are gone.

### Phase 4: Domain Migrations

Migrate Interior, Warehouse, and School independently. Each domain keeps its routes, types, seeds, storage keys, labels, exports, and actions. Each domain phase passes its focused tests and browser workflows before the next starts.

### Phase 5: Performance and Repository Hygiene

Apply route-level splitting and measured render improvements. Move documentation into a coherent `docs/` hierarchy, repair links, and remove proven obsolete artifacts.

### Phase 6: Final QA

Run the full build, lint, test, E2E, accessibility, performance, and visual-review gates. Record any accepted non-blocking debt with owner, affected users, and remediation.

## Rollback Boundaries

Every phase is independently buildable and reversible. Shared foundations land before consumers, each domain migrates separately, and compatibility exports are removed only in the phase that migrates their final consumer. Storage schemas and keys do not change, so rollback never requires user-data migration.

## Acceptance Criteria

- Existing routes, workflows, labels, exports, API contracts, and persisted data continue to work.
- Shared modules contain no service-specific imports or business rules.
- Repeated UI and list mechanics have one canonical implementation.
- `src/ui.tsx` and other duplicate modules are removed only after their final consumer migrates.
- All three service domains pass representative browser workflows at 375, 768, and 1280 pixels.
- Build, lint, automated tests, accessibility checks, and production-browser QA pass with recorded evidence.
- Documentation has a clear hierarchy and no broken internal links.
- No source file is enlarged solely to reduce repository file count.

## Risks and Controls

- High-blast-radius primitive changes: lock behavior with tests and migrate through the showcase first.
- Persisted-data regressions: preserve keys and shapes, parse without destructive rewrites, and test existing fixtures.
- Over-generalized abstractions: extract only behavior proven equivalent in at least two consumers.
- Scope expansion: backend and domain redesign remain out of scope unless a verified compatibility defect requires a minimal fix.
- Visual inconsistency during migration: complete and verify one coherent layer or domain at a time.
