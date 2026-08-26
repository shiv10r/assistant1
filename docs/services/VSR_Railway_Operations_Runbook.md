# VSR Railway Operations Runbook

## Scope

This runbook covers the Railway modular boundary, PostgreSQL/PostGIS migrations, private evidence scanning, outbox processing, crowd-source credentials, health endpoints, rollback, and incident ownership.

## Required Configuration

| Variable | Default | Purpose |
|---|---:|---|
| `RAILWAY_ENABLED` | `false` | Enables the Railway workspace and readiness dependency. |
| `RAILWAY_INSPECTION_ENABLED` | `false` | Enables inspections and defects. |
| `RAILWAY_MAINTENANCE_ENABLED` | `false` | Enables work orders, plans, inventory, and procurement. |
| `RAILWAY_CROWD_ENABLED` | `false` | Enables aggregate crowd operations. |
| `RAILWAY_LIVE_ADAPTERS_ENABLED` | `false` | Enables approved machine-to-machine crowd adapters. |
| `RAILWAY_AI_ENABLED` | `false` | Enables advisory-only Railway AI. |
| `RAILWAY_OUTBOX_BATCH_SIZE` | `50` | Maximum outbox messages per dispatch cycle. |
| `RAILWAY_OUTBOX_POLL_SECONDS` | `5` | Outbox polling interval. |
| `RAILWAY_CROWD_STALE_SECONDS` | `300` | Observation freshness threshold. |
| `RAILWAY_OFFLINE_PACK_MAX_AGE_HOURS` | `72` | Maximum age of server-derived offline packs. |
| `RAILWAY_MAX_EVIDENCE_BYTES` | `26214400` | Maximum private evidence object size. |
| `RAILWAY_ALLOWED_EVIDENCE_TYPES` | image/PDF list | Allowed evidence MIME types. |
| `MALWARE_SCANNER_HOST` | none | Private ClamAV hostname. |
| `MALWARE_SCANNER_PORT` | `3310` | Private ClamAV TCP port. |
| `ConnectionStrings__DefaultConnection` | none | PostgreSQL 16 database with PostGIS installed. |
| `VITE_API_URL` | none | Render API origin used by the Netlify frontend build. |

Secrets belong in the deployment provider secret store. Never commit database passwords, storage service keys, crowd signing secrets, or scanner credentials.

## Local Database

Install PostgreSQL 16 and PostGIS 3.4, then verify the extension before applying migrations:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

Apply migrations only to an explicitly selected local or disposable database:

```powershell
dotnet ef database update --project src/VSRSystemsBackend.Api/VSRSystemsBackend.Api.csproj --context RailwayDbContext
```

Do not use `EnsureCreated` for the Railway context. Do not run migration commands against Supabase or production without explicit approval and a verified backup.

## Health And Telemetry

- `/health/live`: process liveness only.
- `/health/ready`: required Railway database and outbox readiness.
- `/health`: full application dependency report.
- OpenTelemetry meter: `VSRSystemsBackend.Railway`.
- Alert on API error rate, database saturation, dead letters, outbox age, worker failures, crowd freshness, scanner failures, sync conflicts, critical defects, and overdue work.
- Metric dimensions must not contain tenant IDs, evidence content, secrets, or personal data.

## Evidence Scanner

Run ClamAV privately on TCP `3310` with signature updates enabled. The backend fails closed: unavailable or suspicious scans remain quarantined. Never bypass scanning or manually release a quarantined object.

Recovery sequence:

1. Disable new evidence uploads using the Railway feature flag.
2. Restore scanner connectivity and update signatures.
3. Retry pending scans.
4. Review scanner and audit records before re-enabling uploads.

## Crowd Source Operations

- Source credentials are displayed once at creation or rotation.
- HMAC requests require source ID, Unix timestamp, nonce, and body signature headers.
- Timestamp freshness is five minutes and nonces are persisted against replay.
- Credential rotation keeps the previous key valid for a short overlap.
- Disable a compromised source, rotate its credential, inspect quarantine hashes and audit records, then re-enable only after owner approval.
- Never ingest faces, biometric templates, device identifiers, or raw CCTV streams.

## Outbox And Dead Letters

The outbox worker leases messages, retries failures, and dead-letters after ten attempts. Inspect `platform."OutboxMessages"` by event ID and correlation ID. Fix the consumer or payload issue before replay; do not delete operational events to clear an alert.

## Backup And Restore

Before migration or rollback:

1. Create a PostgreSQL backup and record its checksum.
2. Record the deployed frontend and backend commit SHAs.
3. Confirm object-storage retention and scanner availability.
4. Apply migrations before enabling the corresponding capability flag.
5. Verify `/health/ready`, one scoped read, outbox dispatch, and SignalR connectivity.

Restore into a separate database first, validate tenant counts and PostGIS indexes, then schedule the production cutover.

## Rollback

1. Disable the affected Railway capability flag.
2. Keep authored offline work encrypted and retained.
3. Roll back application commits without dropping Railway tables.
4. Restore the database only when a forward schema fix is unsafe.
5. Reconcile outbox messages, command receipts, evidence quarantine, and audit records before re-enabling traffic.

## Current Local Limitation

The current local PostgreSQL installation does not provide PostGIS and Docker is unavailable. Migration generation and compilation can proceed, but migration application, geospatial checks, capacity probes, and production-like acceptance remain deferred until a disposable PostGIS environment is available.
