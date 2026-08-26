# VSR Railway Platform Compatibility

## Purpose

This document records the concrete implementation and registration path for shared platform services that the Railway module depends on. It ensures that the Railway module does not create duplicate infrastructure and that all shared services are properly implemented under the corresponding VSRSystemsBackend.Api/Platform boundaries.

## Shared Platform Prerequisites

The following services must exist and be properly registered before the Railway module can consume them:

### 1. Organization Scope
- **Location**: `VSRSystemsBackend.Api/Platform/Organizations/`
- **Registration**: through the existing JWT identity/organization claims infrastructure
- **Test**: Verify that users without organization claims receive appropriate authorization errors
- **Railway Dependency**: All Railway entities and queries must be scoped by organization ID

### 2. Permission Service
- **Location**: `VSRSystemsBackend.Api/Platform/Permissions/`
- **Registration**: append-only permission assignments with role-based access control
- **Test**: Verify permission combinations for railway operations (inspections, defects, work orders, crowd)
- **Railway Dependency**: Frontend permission gates must not replace backend authorization

### 3. Audit Service
- **Location**: `VSRSystemsBackend.Api/Platform/Audit/`
- **Registration**: append-only audit log with correlation IDs, actor, scope, timestamps, and state changes
- **Test**: Verify that all safety-critical actions have complete audit entries
- **Railway Dependency**: All domain events must pass through the audit writer

### 4. Transactional Outbox
- **Location**: `VSRSystemsBackend.Api/Platform/Outbox/`
- **Registration**: persistent event queue with claim batches, leases, and dead-letter state
- **Test**: Verify that domain changes and outbox message commit atomically
- **Railway Dependency**: Railway domain events must use the shared outbox, not a Railway-specific table

### 5. Background Dispatcher
- **Location**: `VSRSystemsBackend.Api/Platform/BackgroundJobs/`
- **Registration**: worker processes that claim batches with leases, record attempts, and move exhausted messages
- **Test**: Verify idempotent consumers, retries, and dead-letter handling
- **Railway Dependency**: Background workers must use the shared dispatcher, not Railway-specific processes

### 6. Private File Storage
- **Location**: `VSRSystemsBackend.Api/Platform/Storage/`
- **Registration**: signed URL generation, evidence finalization, malware scanning integration
- **Test**: Verify signed upload initiation/finalization and evidence quarantine/release
- **Railway Dependency**: Evidence must use the shared storage provider, not local file system

### 7. Feature Flags
- **Location**: `VSRSystemsBackend.Api/Platform/FeatureFlags/`
- **Registration**: per-capability flags with organization overrides (`RAILWAY_ENABLED`, `RAILWAY_INSPECTION_ENABLED`, etc.)
- **Test**: Verify that disabled capabilities render unavailable states rather than fixture data
- **Railway Dependency**: Frontend route groups must check feature flags before enabling

### 8. Correlation Context
- **Location**: `VSRSystemsBackend.Api/Platform/Telemetry/`
- **Registration**: correlation IDs in API responses, logs, and support views
- **Test**: Verify that every request includes a correlation ID and it propagates through the system
- **Railway Dependency**: All Railway API responses must include correlation IDs

### 9. PostgreSQL Registration
- **Location**: `VSRSystemsBackend.Api/`
- **Registration**: database context, migrations, PostGIS extension, connection string management
- **Test**: Verify database migrations apply cleanly and health checks pass
- **Railway Dependency**: Railway persistence must use the shared PostgreSQL instance with PostGIS

## Railway Compatibility Test

Create a test that resolves and exercises all the above services:

```csharp
[Fact]
public async Task Shared_platform_services_are_resolvable()
{
    var scope = await _railwayScopeAccessor.GetRequiredScope();
    
    // Verify organization scope
    Assert.NotNull(scope.OrganizationId);
    
    // Verify permission service
    var canInspect = await _permissionService.HasPermission(scope, "railway.inspections.read");
    
    // Verify audit writer
    await _auditWriter.LogAsync("test-action", scope, "test-reason");
    
    // Verify outbox
    var outboxCount = await _outboxRepository.CountAsync();
    
    // Verify background dispatcher can claim a batch
    var claimed = await _backgroundDispatcher.ClaimBatchAsync("railway-test", TimeSpan.FromSeconds(30));
    
    // Verify storage
    var storageUrl = await _storageService.GetSignedUrlAsync("test-key", "image/png");
    
    // Verify feature flag
    var railwayEnabled = await _featureFlagReader.IsEnabledAsync("RAILWAY_ENABLED");
    
    // Verify correlation context
    var correlationId = _correlationContext.CurrentContext?.Id;
}
```

If any capability is absent, implement it once under the corresponding shared boundary and add platform tests before Railway code consumes it. Do not create a Railway-only replacement for missing generic infrastructure.

## Running the Test

Run: `dotnet test VSRSystemsBackend.Api.Tests --filter "FullyQualifiedName~RailwayPlatformCompatibilityTests"`

Expected: PASS with all required shared services resolved and the compatibility document naming each registration.

## Backend Repository Dependency

This document and the associated tests depend on the `VSRSystemsBackend` repository being available at its expected location. The backend repository contains the actual platform service implementations at `VSRSystemsBackend.Api/Platform/`. When the backend repository is available, the test project should be updated to reference it and the `dotnet add` commands should point to the correct package locations.

## Testcontainers Fixture

The shared Railway test fixture uses Testcontainers with the `postgis/postgis:16-3.4` image:

- Random host port for database connection
- Explicit test-only connection string
- `CREATE EXTENSION IF NOT EXISTS postgis` on startup
- Automatic container disposal after tests
- Refuse to start migration/capacity tests unless the database host and port match the active fixture container