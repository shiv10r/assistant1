using System.Globalization;
using System.Text;
using LuxInfra.Models;

namespace LuxInfra.Services;

public class ReportService
{
    private readonly DatabaseService _db;
    private static readonly CultureInfo Inr = new("en-IN");

    public ReportService(DatabaseService db) => _db = db;

    public static string Money(double amount) => string.Format(Inr, "₹{0:N0}", amount);

    public async Task<List<ExpenseEntry>> GetEntriesAsync(ReportPeriod period)
    {
        return period switch
        {
            ReportPeriod.Today => await _db.GetByDateAsync(DateTime.Today),
            ReportPeriod.Week => await _db.GetSinceAsync(DateTime.Today.AddDays(-6)),
            ReportPeriod.Month => await _db.GetSinceAsync(new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1)),
            _ => await _db.GetAllAsync()
        };
    }

    public static string PeriodLabel(ReportPeriod period) => period switch
    {
        ReportPeriod.Today => $"Today · {DateTime.Today:dd MMM yyyy}",
        ReportPeriod.Week => $"Last 7 days · ending {DateTime.Today:dd MMM yyyy}",
        ReportPeriod.Month => $"{DateTime.Today:MMMM yyyy}",
        _ => "All time"
    };

    public async Task<ReportData> BuildReportAsync(ReportPeriod period)
    {
        var entries = await GetEntriesAsync(period);
        var data = new ReportData
        {
            Period = period,
            PeriodLabel = PeriodLabel(period),
            Total = entries.Sum(e => e.Amount),
        };
        data.TotalLabel = Money(data.Total);

        data.Rows = entries
            .OrderBy(e => e.Site).ThenByDescending(e => e.Date)
            .Select(e => new ReportRow
            {
                DateLabel = e.Date.ToString("dd MMM"),
                Site = e.Site,
                Client = e.Client,
                Category = e.Category,
                Amount = e.Amount,
                AmountLabel = Money(e.Amount)
            })
            .ToList();

        data.CategoryTotals = entries
            .GroupBy(e => e.Category)
            .OrderByDescending(g => g.Sum(e => e.Amount))
            .Select(g => new CategoryTotal
            {
                Category = g.Key,
                Count = g.Count(),
                Total = g.Sum(e => e.Amount),
                TotalLabel = Money(g.Sum(e => e.Amount))
            })
            .ToList();

        data.SiteTotals = entries
            .GroupBy(e => e.Site)
            .OrderByDescending(g => g.Sum(e => e.Amount))
            .Select(g => new CategoryTotal
            {
                Category = g.Key,
                Count = g.Count(),
                Total = g.Sum(e => e.Amount),
                TotalLabel = Money(g.Sum(e => e.Amount))
            })
            .ToList();

        return data;
    }

    public async Task<string> BuildDailySummaryAsync(DateTime date)
    {
        var todays = await _db.GetByDateAsync(date);
        var all = await _db.GetAllAsync();

        var sb = new StringBuilder();
        sb.AppendLine($"LuxInfra Daily Report — {date:dd MMM yyyy}");
        sb.AppendLine();

        if (todays.Count == 0)
        {
            sb.AppendLine("No expenses logged today.");
            return sb.ToString();
        }

        foreach (var group in todays.GroupBy(e => e.Site).OrderBy(g => g.Key))
        {
            sb.AppendLine($"{group.Key}{ClientLabel(group)}");
            foreach (var e in group)
                sb.AppendLine($"   - {e.Category}: {Money(e.Amount)}");

            var todayTotal = group.Sum(e => e.Amount);
            var lifetime = all.Where(e => e.Site.Equals(group.Key, StringComparison.OrdinalIgnoreCase)).Sum(e => e.Amount);
            sb.AppendLine($"   Today: {Money(todayTotal)}   |   Till date: {Money(lifetime)}");
            sb.AppendLine();
        }

        sb.AppendLine($"Total spent today: {Money(todays.Sum(e => e.Amount))}");
        sb.AppendLine($"Total across all sites (till date): {Money(all.Sum(e => e.Amount))}");
        return sb.ToString();
    }

    public async Task<string> BuildDailyHtmlAsync(DateTime date)
    {
        var todays = await _db.GetByDateAsync(date);
        var all = await _db.GetAllAsync();

        var sb = new StringBuilder();
        sb.Append("<div style='font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;background:#0f0f1a;color:#f2f2f7;padding:24px;border-radius:16px'>");
        sb.Append("<h2 style='margin:0 0 4px'>Lux<span style='color:#00e5c3'>Infra</span></h2>");
        sb.Append($"<p style='margin:0 0 16px;color:#9a9ab0'>Daily expense report — {date:dd MMM yyyy}</p>");

        if (todays.Count == 0)
        {
            sb.Append("<p>No expenses logged today.</p></div>");
            return sb.ToString();
        }

        foreach (var group in todays.GroupBy(e => e.Site).OrderBy(g => g.Key))
        {
            sb.Append("<div style='background:#1c1c2e;border-radius:12px;padding:14px 16px;margin-bottom:12px'>");
            sb.Append($"<b style='color:#b39dff'>{group.Key}{ClientLabel(group)}</b>");
            sb.Append("<table style='width:100%;margin-top:8px;color:#f2f2f7;font-size:14px'>");
            foreach (var e in group)
                sb.Append($"<tr><td>{e.Category}</td><td style='text-align:right'>{Money(e.Amount)}</td></tr>");

            var lifetime = all.Where(e => e.Site.Equals(group.Key, StringComparison.OrdinalIgnoreCase)).Sum(e => e.Amount);
            sb.Append($"<tr><td style='padding-top:6px;color:#9a9ab0'>Today</td><td style='padding-top:6px;text-align:right;color:#00e5c3'><b>{Money(group.Sum(e => e.Amount))}</b></td></tr>");
            sb.Append($"<tr><td style='color:#9a9ab0'>Till date</td><td style='text-align:right;color:#9a9ab0'>{Money(lifetime)}</td></tr>");
            sb.Append("</table></div>");
        }

        sb.Append($"<h3 style='margin:16px 0 4px'>Total today: <span style='color:#00e5c3'>{Money(todays.Sum(e => e.Amount))}</span></h3>");
        sb.Append($"<p style='color:#9a9ab0;margin:0'>All sites till date: {Money(all.Sum(e => e.Amount))}</p>");
        sb.Append("</div>");
        return sb.ToString();
    }

    private static string ClientLabel(IGrouping<string, ExpenseEntry> group)
    {
        var client = group.Select(e => e.Client).FirstOrDefault(c => !string.IsNullOrEmpty(c));
        return string.IsNullOrEmpty(client) ? "" : $"  (Client: {client})";
    }
}
