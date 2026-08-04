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

// ---- CORS for the React frontend ----
builder.Services.AddCors(o =>
{
    o.AddPolicy("web", p => p
        .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5210")
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