# VSR Systems Design System

## 1. Product Character

VSR Systems is an operational enterprise application. The interface prioritizes dense, readable business data, predictable workflows, and clear service context. Its visual identity is deep navy with a warm orange action color, supported by restrained status colors.

## 2. Principles

- Preserve information density without sacrificing scanability.
- Use elevation only to express hierarchy.
- Keep actions visually consistent across Interior, Warehouse, School, and Billing.
- Prefer shared primitives over page-specific styling.
- Motion must explain state or navigation; decorative motion is not used.

## 3. Tokens

`frontend/src/index.css` is the executable source of truth.

- Dark background: `--bg: #080D16`.
- Dark surfaces: `--surface`, `--surface2`, `--surface-hover`, and `--surface-elevated`.
- Primary action: `--primary: #FF9638`; soft emphasis: `--primary-soft: #FFB066`.
- Positive accent: `--accent: #10B981`.
- Text: `--text`, `--text-muted`, and `--dim`.
- Structure: `--border`, `--shadow`, `--ring`, and `--grad`.
- Light and weather modes override these semantic tokens without changing component anatomy.

New colors must be added as semantic tokens before use. Raw values are allowed only for data visualization series that cannot be expressed by a semantic state token.

## 4. Typography and Spacing

- Primary stack: Segoe UI, system UI, platform sans-serif fallback.
- Use sentence case for page and card headings.
- Use tabular or monospace treatment for identifiers, dates, and financial columns where alignment matters.
- Spacing follows a 4 px base unit. Prefer existing Tailwind spacing values over arbitrary values.
- Body text must remain readable at 375 px without horizontal page scrolling.

## 5. Shared Primitives

Canonical primitives are exported from `frontend/src/components/ui`:

- Form controls: `Button`, `Input`, `Textarea`, `Select`, `Label`, and `Switch`.
- Surfaces: `Card` and its structural subcomponents.
- Data: `Table`, `Badge`, `Empty`, and `DataTable`.
- Overlays and navigation: `Modal`, `Tabs`, and `PageHead`.
- Feedback: `ToastProvider` with the `useToast` hook.

Every interactive primitive needs default, hover, focus-visible, active, disabled, loading, error, and success treatment when the state applies. Reusable patterns used by two or more pages belong in this layer or in a named shared component.

## 6. Layout

- The application shell owns top navigation, service navigation, and the scrolling content region.
- Page content uses constrained widths, responsive grids, and `min-width: 0` for scrollable children.
- Breakpoints are validated at 375 px, 768 px, and 1280 px.
- Tables may reduce secondary columns on small screens but must preserve primary identity and actions.
- Dialogs must fit within the dynamic viewport and keep their content independently scrollable.

## 7. Interaction and Accessibility

- All controls use semantic elements and visible keyboard focus.
- Icon-only buttons require accessible names.
- Touch targets should be at least 44 by 44 px where space permits.
- Status is never communicated by color alone.
- Animations use transform, opacity, or filter and respect `prefers-reduced-motion`.
- Loading, empty, error, and success states are required for asynchronous workflows.

## 8. Quality and Debt

- Production builds must pass `npm run build`.
- Lint must pass with `npx oxlint --deny-warnings`.
- The entry bundle must pass `npm run check:chunks`.
- Legacy root UI imports must pass `npm run check:legacy-ui`.
- Browser interaction and visual testing are performed by the user when automated browser access is disabled.

Accepted debt: some legacy pages still use inline styles and emoji action glyphs. They may be migrated incrementally, but new code must use semantic tokens and the canonical icon/component system.
