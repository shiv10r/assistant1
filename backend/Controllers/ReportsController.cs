using LuxInfra.Models;
using LuxInfra.Repositories;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reports;
    private readonly DatabaseService _db;
    private readonly IBillingService _billing;
    private readonly IProjectService _projects;
    private readonly IUserRepository _users;
    private readonly IActivityService _activity;

    public ReportsController(ReportService reports, DatabaseService db, IBillingService billing,
        IProjectService projects, IUserRepository users, IActivityService activity)
    {
        _reports = reports;
        _db = db;
        _billing = billing;
        _projects = projects;
        _users = users;
        _activity = activity;
    }

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
            "csv" => Results.File(ExportService.BuildCsv(data),
                "text/csv", $"LuxInfra_Report_{p}_{stamp}.csv"),
            _ => Results.BadRequest("format must be xlsx, pdf, png or csv")
        };
    }

    /// <summary>KPI dashboard for the Reports page — spending KPIs for the period + app-wide analytics.</summary>
    [HttpGet("kpis")]
    public async Task<ActionResult> Kpis([FromQuery] string period = "Today")
    {
        var p = Parse(period);
        var entries = await _reports.GetEntriesAsync(p);
        var total = entries.Sum(e => e.Amount);

        // Period spending KPIs
        var daysInPeriod = entries.Count == 0 ? 1 : p switch
        {
            ReportPeriod.Today => 1,
            ReportPeriod.Week => 7,
            ReportPeriod.Month => DateTime.DaysInMonth(DateTime.Today.Year, DateTime.Today.Month),
            _ => Math.Max(1, (int)Math.Ceiling((DateTime.Today - entries.Min(e => e.Date).Date).TotalDays) + 1)
        };

        var byCategory = entries.GroupBy(e => e.Category).ToList();
        var bySite = entries.GroupBy(e => e.Site).ToList();

        var report = new
        {
            total,
            totalLabel = ReportService.Money(total),
            count = entries.Count,
            avgPerDay = daysInPeriod > 0 ? Math.Round(total / daysInPeriod) : 0,
            avgPerDayLabel = ReportService.Money(Math.Round(total / daysInPeriod)),
            topCategory = byCategory.OrderByDescending(g => g.Sum(e => e.Amount)).FirstOrDefault()?.Key,
            topCategoryLabel = byCategory.OrderByDescending(g => g.Sum(e => e.Amount)).FirstOrDefault() is { } tc ? ReportService.Money(tc.Sum(e => e.Amount)) : "—",
            topSite = bySite.OrderByDescending(g => g.Sum(e => e.Amount)).FirstOrDefault()?.Key,
            topSiteLabel = bySite.OrderByDescending(g => g.Sum(e => e.Amount)).FirstOrDefault() is { } ts ? ReportService.Money(ts.Sum(e => e.Amount)) : "—",
            biggestEntry = entries.OrderByDescending(e => e.Amount).FirstOrDefault() is { } be
                ? new { be.Site, be.Category, be.Client, label = ReportService.Money(be.Amount), date = be.Date.ToString("dd MMM yy") }
                : null,
            categoryCount = byCategory.Count,
            siteCount = bySite.Count,
        };

        // App-wide analytics (all-time)
        var allExpenses = await _db.GetAllAsync();
        var allTxns = await _billing.GetTxnsAsync();
        var parties = await _billing.GetPartiesAsync();
        var items = await _billing.GetItemsAsync();
        var projects = await _projects.GetProjectsAsync();
        var users = await _users.GetUsersAsync();
        var sessions = await _users.GetSessionsAsync();
        var activityLog = await _activity.GetRecentAsync(500);

        var app = new
        {
            expenseCount = allExpenses.Count,
            expenseTotalLabel = ReportService.Money(allExpenses.Sum(e => e.Amount)),
            projectCount = projects.Count,
            ongoingProjects = projects.Count(pr => pr.Status == "Ongoing"),
            completedProjects = projects.Count(pr => pr.Status == "Completed"),
            partyCount = parties.Count,
            itemCount = items.Count,
            txnCount = allTxns.Count,
            saleTotalLabel = ReportService.Money(allTxns.Where(t => t.Type == TxnTypes.Sale).Sum(t => t.Total)),
            receivableLabel = ReportService.Money(allTxns.Where(t => t.Type == TxnTypes.Sale).Sum(t => t.Balance)),
            userCount = users.Count,
            sessionCount = sessions.Count(s => s.ExpiresAt > DateTime.UtcNow),
            activityCount = activityLog.Count,
            lastActivity = activityLog.FirstOrDefault() is { } la ? la.Timestamp.ToString("dd MMM, HH:mm") : "—",
        };

        return Ok(new { period = p.ToString(), report, app });
    }

    private static ReportPeriod Parse(string period) => period.ToLowerInvariant() switch
    {
        "week" => ReportPeriod.Week,
        "month" => ReportPeriod.Month,
        "all" => ReportPeriod.All,
        _ => ReportPeriod.Today
    };
}
