using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly DatabaseService _db;

    public DashboardController(DatabaseService db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var all = await _db.GetAllAsync();
        var today = all.Where(e => e.Date.Date == DateTime.Today).Sum(e => e.Amount);
        var month = all.Where(e => e.Date.Year == DateTime.Today.Year && e.Date.Month == DateTime.Today.Month).Sum(e => e.Amount);
        var grand = all.Sum(e => e.Amount);
        var siteCount = all.Select(e => e.Site).Distinct(StringComparer.OrdinalIgnoreCase).Count();

        var groups = all
            .GroupBy(e => e.Site)
            .Select(g => new SiteGroupDto(g.Key, g.Count(), ReportService.Money(g.Sum(e => e.Amount)), g.Sum(e => e.Amount)))
            .OrderByDescending(g => g.Total)
            .ToList();

        return Ok(new DashboardDto(
            today, ReportService.Money(today),
            month, ReportService.Money(month),
            grand, ReportService.Money(grand),
            siteCount, all.Count == 0, groups));
    }
}