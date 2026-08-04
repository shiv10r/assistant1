using LuxInfra.Models;
using LuxInfra.Services;
using LuxInfra.Web.Components;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Everything is stored locally — a single SQLite file next to the app, no server database needed.
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "data", "luxinfra.db3");
builder.Services.AddSingleton(new DatabaseService(dbPath));
builder.Services.AddSingleton<ReportService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Download endpoints: /export/xlsx?period=Today  ·  /export/pdf  ·  /export/png
app.MapGet("/export/{format}", async (string format, string? period, ReportService reports) =>
{
    var p = period?.ToLowerInvariant() switch
    {
        "week" => ReportPeriod.Week,
        "month" => ReportPeriod.Month,
        "all" => ReportPeriod.All,
        _ => ReportPeriod.Today
    };
    var data = await reports.BuildReportAsync(p);
    var stamp = DateTime.Now.ToString("yyyyMMdd_HHmm");

    return format.ToLowerInvariant() switch
    {
        "xlsx" => Results.File(ExportService.BuildExcel(data),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"LuxInfra_Report_{p}_{stamp}.xlsx"),
        "pdf" => Results.File(ExportService.BuildPdf(data),
            "application/pdf",
            $"LuxInfra_Report_{p}_{stamp}.pdf"),
        "png" => Results.File(ExportService.BuildPng(data),
            "image/png",
            $"LuxInfra_Report_{p}_{stamp}.png"),
        _ => Results.BadRequest("format must be xlsx, pdf or png")
    };
});

app.Run();
