# LuxInfra

LuxInfra is a multi-service business operations application for interior design, warehouse management, school management, billing, analytics, and reporting.

## Repository Layout

- `frontend/` - React 19, TypeScript, Vite, and Tailwind CSS application.
- `backend/` - .NET backend projects and build artifacts available on this branch.
- `docs/` - deployment guidance, service specifications, and engineering plans.
- `data/` - local application data used by the development environment.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Quality gates:

```bash
npm run build
npm run lint
npm run check:chunks
npm run check:legacy-ui
```

The production entry bundle is guarded at 400 KB. Application routes are loaded on demand, and shared UI is exposed through `frontend/src/components/ui`.

## Documentation

Start with the [documentation index](docs/README.md). Deployment instructions are in [docs/deployment.md](docs/deployment.md).
Frontend visual and interaction rules are defined in [DESIGN.md](DESIGN.md).

## Branches

Deployment branches and environment details are documented in the deployment guide. Do not deploy legacy branches without reviewing that guide.
