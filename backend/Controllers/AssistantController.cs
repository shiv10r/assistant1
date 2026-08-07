using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/assistant")]
public class AssistantController : ControllerBase
{
    private readonly DatabaseService _db;
    private readonly ReportService _reports;

    public AssistantController(DatabaseService db, ReportService reports)
        => (_db, _reports) = (db, reports);

    // Everthing from u watch the app: log / total / summary / undo / help.
    [HttpPost("send")]
    public async Task<ActionResult<ChatMessageDto[]>> Send([FromBody] ParseRequest request)
    {
        var responses = new List<ChatMessageDto>();
        var text = request.Text.Trim();
        if (string.IsNullOrEmpty(text)) return Ok(responses);

        foreach (var part in text.Split(new[] { '\n', ';' },
                     StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            responses.Add(await Handle(part));

        return Ok(responses);
    }

    private async Task<ChatMessageDto> Handle(string text)
    {
        var result = ExpenseParser.Parse(text);
        switch (result.Kind)
        {
            case ParseKind.Expense when result.Entry is not null:
            {
                var e = result.Entry;
                await _db.AddAsync(e);
                var siteTotal = (await _db.GetBySiteAsync(e.Site)).Sum(x => x.Amount);
                var dayTotal = (await _db.GetByDateAsync(DateTime.Today)).Sum(x => x.Amount);
                var clientPart = string.IsNullOrEmpty(e.Client) ? "" : $" (Client: {e.Client})";
                return UserText($"✅ Logged {ReportService.Money(e.Amount)} — {e.Category} @ {e.Site}{clientPart}. " +
                            $"{e.Site} till date: {ReportService.Money(siteTotal)} · All sites today: {ReportService.Money(dayTotal)}");
            }

            case ParseKind.Summary:
            {
                var data = await _reports.BuildReportAsync(ReportPeriod.Today);
                return data.Count == 0
                    ? Bot("📭 No expenses logged today yet.")
                    : new ChatMessageDto("", false, DateTime.Now.ToString("HH:mm"), true,
                        $"📒 Report · {DateTime.Today:dd MMM yyyy}", data.Rows, data.TotalLabel);
            }

            case ParseKind.Total:
            {
                var all = await _db.GetAllAsync();
                if (all.Count == 0) return Bot("No expenses recorded yet. Start logging! ✍️");
                var lines = all.GroupBy(x => x.Site).OrderBy(g => g.Key)
                    .Select(g => $"{g.Key}: {ReportService.Money(g.Sum(x => x.Amount))}");
                return Bot("🏗️ Totals till date — " + string.Join(" · ", lines) +
                           $" — Grand total: {ReportService.Money(all.Sum(x => x.Amount))}");
            }

            case ParseKind.SiteTotal when result.SiteQuery is not null:
            {
                var candidates = new[] { result.SiteQuery, "Site " + result.SiteQuery };
                List<ExpenseEntry> entries = new();
                var label = result.SiteQuery;
                foreach (var c in candidates)
                {
                    entries = await _db.GetBySiteAsync(c);
                    if (entries.Count > 0) { label = c; break; }
                }
                return Bot(entries.Count == 0
                    ? $"🤔 No expenses found for \"{result.SiteQuery}\" yet."
                    : $"📍 {label}: {ReportService.Money(entries.Sum(x => x.Amount))} till date across {entries.Count} entries.");
            }

            case ParseKind.SendReport:
                return Bot("📧 Use the Reports page to download Excel / PDF / PNG. Email auto-send lives in the desktop/mobile app.");

            case ParseKind.Undo:
            {
                var removed = await _db.DeleteLastAsync();
                return Bot(removed is null
                    ? "Nothing to undo."
                    : $"🗑️ Removed: {removed.Category} {ReportService.Money(removed.Amount)} @ {removed.Site}");
            }

            case ParseKind.Help:
                return Bot("✍️ Log: \"site A paint exp = 5k\" · \"site B tiles 100000\" · \"client Verma site D labour 25k\" " +
                           "(5k = 5,000 · 1l = 1,00,000 · 1cr = 1,00,00,000). " +
                           "📒 \"show report\" · 🧮 \"total\" / \"total site a\" · ↩️ \"undo\".");

            default:
            {
                var data = await _reports.BuildReportAsync(ReportPeriod.Today);
                var totals = data.Count == 0
                    ? "No expenses yet today."
                    : $"{ReportService.Money(data.Total)} logged today.";
                return Bot($"🤔 I couldn't find an amount in \"{text}\". " +
                           "Try \"site A paint exp = 5k\", \"spent 5000 on cement\", or \"five thousand for labour\". " +
                           $"{totals}");
            }
        }
    }

    [HttpGet("expenses")]
    public async Task<List<ExpenseEntry>> Expenses() => await _db.GetAllAsync();

    [HttpDelete("last")]
    public async Task<ActionResult> Undo()
    {
        var removed = await _db.DeleteLastAsync();
        return removed is null ? Ok(new { message = "Nothing to undo." })
                               : Ok(new { message = $"{removed.Category} {ReportService.Money(removed.Amount)} @ {removed.Site}" });
    }

    private static ChatMessageDto Bot(string text) => new(text, false, DateTime.Now.ToString("HH:mm"));
    private static ChatMessageDto UserText(string text) => new(text, true, DateTime.Now.ToString("HH:mm"));
}
