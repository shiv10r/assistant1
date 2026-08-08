using LuxInfra.Api.Auth;
using LuxInfra.Api.Services;
using LuxInfra.Repositories;
using LuxInfra.Services;

var builder = WebApplication.CreateBuilder(args);

// On Render (PORT env set) bind to all interfaces so Render can reach the app.
// Locally PORT is unset, so the app keeps using launchSettings / --urls (localhost:5050).
if (Environment.GetEnvironmentVariable("PORT") is { Length: > 0 } port)
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ---- Token auth. Default login admin/admin123; override via AUTH_USER/AUTH_PASS.
// All /api endpoints (except /api/auth/login) require "Authorization: Bearer <API_TOKEN>". ----
builder.Services.AddSingleton(_ =>
{
    var c = builder.Configuration;
    return new AuthOptions
    {
        Username = c["AUTH_USER"] ?? "admin",
        Password = c["AUTH_PASS"] ?? "LuxInfra@2026",
        Token = c["API_TOKEN"] ?? "lux-admin-token-2024",
    };
});

// ---- Local SQLite storage (single file, no DB server) ----
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "data", "luxinfra.db3");
builder.Services.AddSingleton(new DatabaseService(dbPath));

// Repository layer (data access) — services above it delegate persistence here.
builder.Services.AddSingleton<IBillingRepository, BillingRepository>();
builder.Services.AddSingleton<IProjectRepository, ProjectRepository>();
builder.Services.AddSingleton<IActivityRepository, ActivityRepository>();

// Business layer — controllers depend on these interfaces only.
builder.Services.AddSingleton<ReportService>();
builder.Services.AddSingleton<IBillingService, BillingService>();
builder.Services.AddSingleton<IProjectService, ProjectService>();
builder.Services.AddSingleton<IActivityService, ActivityService>();

// ---- Optional Turso (libSQL) cloud mirror — persists data across Render redeploys.
// Enable by setting TURSO_URL + TURSO_TOKEN env vars (service no-ops when unset). ----
builder.Services.AddSingleton<TursoSyncService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<TursoSyncService>());

// ---- Optional open-source AI chat (DeepSeek via OpenRouter) — enable with OPENROUTER_API_KEY. ----
builder.Services.AddSingleton<ChatAiService>();

// ---- CORS for the React frontend (dev server + Netlify deploy) ----
builder.Services.AddCors(o =>
{
    o.AddPolicy("web", p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("web");
app.UseMiddleware<TokenAuthMiddleware>();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new { service = "LuxInfra API", docs = "/openapi/v1.json" }));

app.Run();