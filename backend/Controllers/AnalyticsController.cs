using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly DatabaseService _db;
    private readonly IBillingService _billing;
    private readonly IProjectService _projects;

    public AnalyticsController(DatabaseService db, IBillingService billing, IProjectService projects)
        => (_db, _billing, _projects) = (db, billing, projects);

    [HttpGet]
    public async Task<ActionResult> Overview()
    {
        var projects = await _projects.GetProjectsAsync();
        var projectRows = new List<object>();
        foreach (var p in projects)
        {
            var tasks = await _projects.GetTasksAsync(p.Id);
            var txns = await _projects.GetTxnsAsync(p.Id);
            var done = tasks.Count == 0 ? 0 : (double)tasks.Count(t => t.Status == TaskStatuses.Completed) / tasks.Count * 100;
            var spent = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
            var received = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
            projectRows.Add(new
            {
                name = p.Name,
                status = p.Status,
                value = p.Value,
                spent,
                received,
                taskPct = Math.Round(done),
                budgetPct = p.Value > 0 ? Math.Round(spent / p.Value * 100) : 0,
                pctLabel = p.Value > 0 ? $"{Math.Round(spent / p.Value * 100):0}%" : "—",
                valueLabel = ReportService.Money(p.Value),
                spentLabel = ReportService.Money(spent),
                receivedLabel = ReportService.Money(received)
            });
        }

        var (get, give, monthSale) = await _billing.GetKpisAsync();
        var billingTxns = await _billing.GetTxnsAsync();

        var salesByMonth = billingTxns
            .Where(t => t.Type == TxnTypes.Sale)
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                period = $"{new DateTime(g.Key.Year, g.Key.Month, 1):MMM yy}",
                total = g.Sum(t => t.Total)
            })
            .TakeLast(6)
            .ToList();

        var expenses = await _db.GetAllAsync();
        var expenseByMonth = expenses
            .GroupBy(e => new { e.Date.Year, e.Date.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                period = $"{new DateTime(g.Key.Year, g.Key.Month, 1):MMM yy}",
                total = g.Sum(e => e.Amount)
            })
            .TakeLast(6)
            .ToList();

        return Ok(new
        {
            billing = new { youllGet = get, youllGive = give, monthSale },
            projects = projectRows,
            salesByMonth,
            expenseByMonth
        });
    }
}
