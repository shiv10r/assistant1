using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reports;

    public ReportsController(ReportService reports) => _reports = reports;

    [HttpGet]
    public async Task<ReportData> Get([FromQuery] string period = "Today")
        => await _reports.BuildReportAsync(Parse(period));

    [HttpGet("export/{format}")]
    public async Task<IResult> Export(string format, [FromQuery] string period = "Today")
    {
        var p = Parse(period);
        var data = await _reports.BuildReportAsync(p);
        var stamp = DateTime.Now.ToString("yyyyMMdd_HHmm");

        return format.ToLowerInvariant() switch
        {
            "xlsx" => Results.File(ExportService.BuildExcel(data),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"LuxInfra_Report_{p}_{stamp}.xlsx"),
            "pdf" => Results.File(ExportService.BuildPdf(data),
                "application/pdf", $"LuxInfra_Report_{p}_{stamp}.pdf"),
            "png" => Results.File(ExportService.BuildPng(data),
                "image/png", $"LuxInfra_Report_{p}_{stamp}.png"),
            _ => Results.BadRequest("format must be xlsx, pdf or png")
        };
    }

    private static ReportPeriod Parse(string period) => period.ToLowerInvariant() switch
    {
        "week" => ReportPeriod.Week,
        "month" => ReportPeriod.Month,
        "all" => ReportPeriod.All,
        _ => ReportPeriod.Today
    };
}