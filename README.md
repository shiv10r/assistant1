# VSR Systems

VSR Systems is a multi-service business operations application for interior design, warehouse management, school management, billing, analytics, and reporting.

## Repository Layout

- `frontend/` - React 19, TypeScript, Vite, and Tailwind CSS application.
- The ASP.NET Core backend is maintained in the adjacent `VSRSystemsBackend` repository.
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

## Runtime Contract

- Development frontend: `http://127.0.0.1:5173`
- Development API and Swagger: `http://127.0.0.1:5050` and `/swagger`
- Development database: local PostgreSQL `vsr_systems_dev` on port `5433` with sample data
- Production data: one Supabase PostgreSQL database
- Shared client collections: `/api/{module}/data/{collection}`
- MVP secrets move to Azure Key Vault in Phase 3.
