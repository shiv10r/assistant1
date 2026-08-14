---
name: application-ui-redesign
description: "Use when redesigning LuxInfra's post-login experience, dashboard, shared cards, navigation, or cross-application UI standards. Produces a cohesive operational UI across Interior, Warehouse, School, Billing, and common pages."
argument-hint: "Describe the experience or screen to improve"
user-invocable: true
---

# LuxInfra Application UI Redesign

## Use When

- Refreshing the authenticated application experience after login.
- Reducing card-heavy layouts or standardizing shared UI components.
- Redesigning the common dashboard or service dashboards.
- Aligning UI patterns across Interior, Warehouse, School, Billing, and shared pages.

## Workflow

1. Identify the owning shared surface before changing pages: `frontend/src/components/ui`, `Layout.tsx`, a service home, or a dashboard.
2. Read the relevant shared components, page, and nearby styles. Preserve existing React, Tailwind, Lucide, and routing conventions.
3. Prefer full-width operational layouts with clear hierarchy over decorative containers. Use cards only for repeated records, tools, modals, and genuinely framed content.
4. Standardize the shared primitive first when the issue affects many pages. Keep border radius at `rounded-lg` or below unless a component has a strong interaction reason.
5. For the post-login hub, make the available services immediately actionable. For dashboards, prioritize current status, priority work, and fast navigation over marketing-style hero content.
6. Use Lucide icons for controls, maintain accessible labels, and keep mobile layouts readable without clipping or overlapping text.
7. Keep changes local to frontend behavior and do not add dependencies without explicit approval.

## Design Criteria

- Operational, scan-friendly hierarchy with restrained framing and consistent spacing.
- A common visual language across all services without erasing service-specific workflows.
- Stable responsive grids and controls; no text overflow or accidental layout shifts.
- Avoid nested cards, decorative gradients, oversized headings inside application surfaces, and card-on-card page sections.
- Respect the existing theme variables and dark/light modes.

## Completion Checks

1. Verify the shared primitive or owning page does not introduce TypeScript errors with `npx tsc --noEmit -p tsconfig.app.json` from `frontend/`.
2. Build with `npm run build` when the touched surface is complete.
3. Review the post-login hub, common dashboard, and each service home at desktop and mobile widths when browser tooling is available.
4. Confirm routes and service switching still work, then summarize the changed visual standards and residual areas for a follow-up pass.