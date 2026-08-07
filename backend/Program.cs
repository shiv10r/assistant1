using LuxInfra.Api.Auth;
using LuxInfra.Api.Services;
using LuxInfra.Services;

var builder = WebApplication.CreateBuilder(args);

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
        Password = c["AUTH_PASS"] ?? "admin123",
        Token = c["API_TOKEN"] ?? "lux-admin-token-2024",
    };
});

// ---- Local SQLite storage (single file, no DB server) ----
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "data", "luxinfra.db3");
builder.Services.AddSingleton(new DatabaseService(dbPath));
builder.Services.AddSingleton<ReportService>();
builder.Services.AddSingleton<BillingService>();
builder.Services.AddSingleton<ProjectService>();

// ---- Optional Turso (libSQL) cloud mirror — persists data across Render redeploys.
// Enable by setting TURSO_URL + TURSO_TOKEN env vars (service no-ops when unset). ----
builder.Services.AddHostedService<TursoSyncService>();

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