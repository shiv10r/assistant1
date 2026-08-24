# Deployment

## Production

- Frontend repo: `assistant1`; Netlify branch: `luxinfra-frontend`.
- Backend repo: `VSRSystemsBackend`; changes merge by PR into `develop03`.
- Frontend API default: `https://vsrsystemsbackend-1.onrender.com`.
- Production database: Supabase PostgreSQL.
- Production seed mode: `None`; real data is created through application/API workflows.

Do not deploy feature branches directly and do not point Development at Supabase.

## Protected Branch Workflow

1. Create `feature/<feature-name>` or `fix/<issue-name>` from the current approved base.
2. Implement and run the complete validation suite on that branch.
3. Push only the feature/fix branch.
4. Raise a pull request to the intended deployment branch.
5. Leave the pull request open and unmerged until the user approves it after testing.

Direct commits, automatic merges, and automatic deployment-branch synchronization are prohibited.

## Local Development

Local PostgreSQL uses `vsr_systems_dev` on port `5433` with sample seed mode.

```powershell
dotnet run --project src/VSRSystemsBackend.Api/VSRSystemsBackend.Api.csproj -- --environment Development --urls http://127.0.0.1:5050
```

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

- Frontend: `http://127.0.0.1:5173`
- Swagger: `http://127.0.0.1:5050/swagger`

## Data Safety

- Local sample data and Supabase production data are separate.
- Back up Supabase before schema migrations or bulk imports.
- Use environment overrides or Azure Key Vault for deployed secrets.
