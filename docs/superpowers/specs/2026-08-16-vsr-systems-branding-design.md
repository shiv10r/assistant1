# VSR Systems Branding and Search Trigger

## Goal

Standardize user-facing product branding as VSR Systems and widen the global-search trigger without changing application behavior or visual identity.

## Design

- Replace visible product names, placeholders, notification fallbacks, browser metadata, and current design-system wording with `VSR Systems` equivalents.
- Migrate technical `vsrsystems:*` storage keys and download filenames while preserving repository paths, branch names, and persisted browser data.
- Change the topbar global-search button from 36 by 36 pixels to 44 by 36 pixels. Keep the Lucide search icon at its current proportional size and preserve all focus, hover, keyboard, and modal behavior.
- Add no dependencies or broader layout changes.

## Verification

- A structural branding check rejects obsolete product-name references while allowing preserved branch identifiers.
- A structural search-trigger check requires the approved 44-pixel width.
- TypeScript build, strict oxlint, route chunk, legacy UI, and whitespace checks pass.
- Browser and MCP testing remain excluded at the user's request.

## Acceptance Criteria

- The application presents `VSR Systems` consistently as the product and company name.
- Existing persisted data is migrated to `vsrsystems:*` keys.
- The topbar global-search trigger is 44 pixels wide and 36 pixels high.
- The current branch is committed and pushed without force.
