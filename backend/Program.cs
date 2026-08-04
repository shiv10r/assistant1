using LuxInfra.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ---- Local SQLite storage (single file, no DB server) ----
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "data", "luxinfra.db3");
builder.Services.AddSingleton(new DatabaseService(dbPath));
builder.Services.AddSingleton<ReportService>();
builder.Services.AddSingleton<BillingService>();
builder.Services.AddSingleton<ProjectService>();

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
app.MapControllers();

app.MapGet("/", () => Results.Ok(new { service = "LuxInfra API", docs = "/openapi/v1.json" }));

app.Run();