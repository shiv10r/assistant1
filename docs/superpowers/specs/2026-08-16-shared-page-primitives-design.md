# Shared Page Primitives Refactor

## Goal

Reduce repeated list-page mechanics without changing service-specific data models, routes, local-storage keys, visible UI, or user workflows.

## Scope

- Extract shared, typed page mechanics only when the same interaction exists in more than one service page.
- Keep Interior, Warehouse, and School entities, seed data, collection keys, route contracts, and business actions in their current service modules.
- Start with the repeated searchable collection-list pattern: query state, derived filtering, empty-state wiring, and list action slots.
- Preserve the existing `DataTable`, `Modal`, `useLocalCollection`, and UI component contracts.

## Out Of Scope

- Merging domain models between services.
- Changing persisted local-storage data.
- Redesigning pages or removing user-visible controls.
- Starting local servers, running unit tests, installing dependencies, or accessing external services without separate user approval.

## Design

Create one shared typed list-page helper in `frontend/src/components/` that owns only generic query matching and reusable toolbar composition. Service pages retain their entity types, columns, forms, mutations, and navigation handlers.

The first migration will use small list pages with matching mechanics. It must leave rendered labels, action buttons, filters, exported data, empty states, and collection keys unchanged.

## Acceptance Criteria

- No service entity or seed-data type moves into a shared module.
- Existing route paths and `luxinfra:` collection keys remain unchanged.
- Migrated pages retain their current rows, action buttons, search behavior, empty states, and exports.
- Shared code has one clear responsibility and no service-specific imports.
- Only user-approved static verification is run after implementation.
