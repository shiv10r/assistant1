using System.Text.RegularExpressions;
using LuxInfra.Api.Services;
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
    private readonly IBillingService _billing;
    private readonly IProjectService _projects;
    private readonly IActivityService _activity;
    private readonly ChatAiService _ai;

    public AssistantController(DatabaseService db, ReportService reports, IBillingService billing, IProjectService projects, IActivityService activity, ChatAiService ai)
        => (_db, _reports, _billing, _projects, _activity, _ai) = (db, reports, billing, projects, activity, ai);

    // ---- Open-source AI chat (DeepSeek via OpenRouter) ----

    public record AiRequest(string Text, List<ChatTurn>? History);

    [HttpGet("ai/status")]
    public ActionResult AiStatus() => Ok(new
    {
        configured = _ai.Configured,
        model = _ai.Model,
    });

    [HttpPost("ai")]
    public async Task<ActionResult<AiReply>> Ai([FromBody] AiRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return Ok(AiReply.Failed(_ai.Model, "empty_message"));

        var reply = await _ai.AskAsync(request.Text.Trim(), request.History ?? new List<ChatTurn>());
        return Ok(reply);
    }

    // Everything you can watch in the app: log / total / summary / undo / help,
    // plus pattern-based queries across Billing (parties, txns) and Projects.
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
        var query = await TryQuery(text);
        if (query is not null) return query;

        var result = ExpenseParser.Parse(text);
        switch (result.Kind)
        {
            case ParseKind.Expense when result.Entry is not null:
            {
                var e = result.Entry;
                await _db.AddAsync(e);
                await _activity.LogAsync("Expense logged",
                    $"{e.Category} @ {e.Site} — {ReportService.Money(e.Amount)}");
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
                if (removed is not null)
                    await _activity.LogAsync("Expense removed",
                        $"{removed.Category} @ {removed.Site} — {ReportService.Money(removed.Amount)}");
                return Bot(removed is null
                    ? "Nothing to undo."
                    : $"🗑️ Removed: {removed.Category} {ReportService.Money(removed.Amount)} @ {removed.Site}");
            }

            case ParseKind.Help:
                return Bot("✍️ Log: \"site A paint exp = 5k\" · \"site B tiles 100000\" · \"client Verma site D labour 25k\" " +
                           "(5k = 5,000 · 1l = 1,00,000 · 1cr = 1,00,00,000). " +
                           "📒 \"show report\" · 🧮 \"total\" / \"total site a\" · ↩️ \"undo\". " +
                           "💼 \"who owes me\" · \"balance of Ramesh\" · \"total sales this month\" " +
                           "🏗️ \"project progress\" · \"tasks in <project>\" · \"materials in <project>\".");

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

    // ---------- pattern-based queries across billing + projects ----------

    private async Task<ChatMessageDto?> TryQuery(string text)
    {
        var lower = text.ToLowerInvariant();

        // ---- Billing: receivables / payables ----
        if (Regex.IsMatch(lower, @"\b(owe|owes|owed|due|outstanding|receivable|receivables|payable|payables|get from|give to|will (get|receive|give|pay))\b"))
        {
            var parties = await _billing.GetPartiesAsync();
            var get = parties.Where(p => p.CurrentBalance > 0).OrderByDescending(p => p.CurrentBalance).ToList();
            var give = parties.Where(p => p.CurrentBalance < 0).OrderBy(p => p.CurrentBalance).ToList();

            if (get.Count == 0 && give.Count == 0)
                return Bot("📊 No party balances yet — add parties and transactions first.");

            var lines = new List<string>();
            if (get.Count > 0)
                lines.Add($"💰 You'll get: {ReportService.Money(get.Sum(p => p.CurrentBalance))} across {get.Count} party(ies)");
            if (give.Count > 0)
                lines.Add($"💸 You'll give: {ReportService.Money(-give.Sum(p => p.CurrentBalance))} across {give.Count} party(ies)");

            foreach (var p in get.Take(5))
                lines.Add($"   · {p.Name}: {ReportService.Money(p.CurrentBalance)}");
            foreach (var p in give.Take(5))
                lines.Add($"   · {p.Name}: {ReportService.Money(Math.Abs(p.CurrentBalance))} (you owe)");

            return Bot(string.Join("\n", lines));
        }

        // ---- Billing: party balance lookup ----
        if (lower.StartsWith("balance") || Regex.IsMatch(lower, @"\bbalance of\b"))
        {
            var parties = await _billing.GetPartiesAsync();
            if (parties.Count == 0) return Bot("No parties yet.");

            var nameMatch = Regex.Match(lower, @"balance\s+(?:of\s+)?([a-z0-9 ]+)");
            var party = nameMatch.Success
                ? parties.FirstOrDefault(p => p.Name.ToLowerInvariant().Contains(nameMatch.Groups[1].Value.Trim().ToLowerInvariant()))
                : null;

            if (party is null)
            {
                var top = parties.OrderByDescending(p => Math.Abs(p.CurrentBalance)).Take(5);
                return Bot("📇 Pick a party — " + string.Join(" · ", top.Select(p => p.Name)) +
                           $". Net position: You'll get {ReportService.Money(parties.Where(p => p.CurrentBalance > 0).Sum(p => p.CurrentBalance))}, " +
                           $"you'll give {ReportService.Money(-parties.Where(p => p.CurrentBalance < 0).Sum(p => p.CurrentBalance))}.");
            }

            var dir = party.IsReceivable ? "You'll get" : "You'll give";
            return Bot($"{party.Name}: {dir} {ReportService.Money(Math.Abs(party.CurrentBalance))}." +
                       (party.CreditLimit > 0 ? $" Credit limit {ReportService.Money(party.CreditLimit)}." : ""));
        }

        // ---- Billing: sales / purchase totals ----
        if (Regex.IsMatch(lower, @"\b(total sales|total sale|sales|sold|purchase|purchased|bought|income|revenue)\b"))
        {
            var txns = await _billing.GetTxnsAsync();
            if (txns.Count == 0) return Bot("No billing transactions yet.");

            var monthStart = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var sales = txns.Where(t => t.Type == TxnTypes.Sale).ToList();
            var purchases = txns.Where(t => t.Type == TxnTypes.Purchase).ToList();
            var monthSales = sales.Where(t => t.Date >= monthStart).Sum(t => t.Total);
            var monthPurchases = purchases.Where(t => t.Date >= monthStart).Sum(t => t.Total);

            return Bot("🧾 Billing summary — " +
                       $"Sales: {ReportService.Money(sales.Sum(t => t.Total))} · Purchases: {ReportService.Money(purchases.Sum(t => t.Total))}. " +
                       $"This month: {ReportService.Money(monthSales)} sales, {ReportService.Money(monthPurchases)} purchases, " +
                       $"across {txns.Count} transaction(s).");
        }

        // ---- Projects: pick the project name for scoped queries ----
        var project = await FindProjectAsync(lower);
        var hasProject = project is not null;

        // ---- Projects: overall progress / status ----
        if (Regex.IsMatch(lower, @"\b(project|progress)\b") && Regex.IsMatch(lower, @"\b(progress|status|overview|summary|how)\b") && !hasProject)
        {
            var projects = await _projects.GetProjectsAsync();
            if (projects.Count == 0) return Bot("No projects yet — add one from the Projects page.");

            var lines = new List<string>();
            foreach (var p in projects)
            {
                var tasks = await _projects.GetTasksAsync(p.Id);
                var done = tasks.Count == 0 ? 0 : (double)tasks.Count(t => t.Status == TaskStatuses.Completed) / tasks.Count * 100;
                var spent = (await _projects.GetTxnsAsync(p.Id)).Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
                var pct = p.Value > 0 ? Math.Round(spent / p.Value * 100) : 0;
                lines.Add($"   {p.Name} [{p.Status}] — {done:0}% tasks done, {pct:0}% budget spent");
            }
            return Bot("🏗️ Projects overview:\n" + string.Join("\n", lines));
        }

        // ---- Projects: tasks ----
        if (Regex.IsMatch(lower, @"\b(task|tasks)\b"))
        {
            var list = project is null ? await _projects.GetProjectsAsync() : new List<Project> { project };
            if (list.Count == 0) return Bot("No projects yet.");

            var lines = new List<string>();
            foreach (var p in list)
            {
                var tasks = await _projects.GetTasksAsync(p.Id);
                if (tasks.Count == 0) { lines.Add($"   {p.Name}: no tasks."); continue; }
                var done = tasks.Count(t => t.Status == TaskStatuses.Completed);
                lines.Add($"   {p.Name}: {done}/{tasks.Count} done");
                foreach (var t in tasks.Where(t => t.Status != TaskStatuses.Completed).Take(3))
                    lines.Add($"      · {t.Name} — {t.Status}");
            }
            return Bot("📋 Tasks:\n" + string.Join("\n", lines));
        }

        // ---- Projects: attendance ----
        if (Regex.IsMatch(lower, @"\b(attendance|present|absent|staff)\b") && project is not null)
        {
            var records = await _projects.GetAttendanceForDateAsync(project.Id, DateTime.Today);
            var present = records.Count(r => r.Status == AttendanceStatuses.Present);
            var absent = records.Count(r => r.Status == AttendanceStatuses.Absent);
            return records.Count == 0
                ? Bot($"👷 No attendance recorded for {project.Name} today.")
                : Bot($"👷 {project.Name} today: {present} present, {absent} absent" +
                      (present + absent < records.Count ? $", {records.Count - present - absent} other" : "") +
                      $" of {records.Count} logged.");
        }

        // ---- Projects: materials / inventory ----
        if (Regex.IsMatch(lower, @"\b(material|materials|inventory|stock)\b"))
        {
            var list = project is null ? await _projects.GetProjectsAsync() : new List<Project> { project };
            if (list.Count == 0) return Bot("No projects yet.");

            var lines = new List<string>();
            foreach (var p in list)
            {
                var inv = await _projects.GetInventoryAsync(p.Id);
                lines.Add(inv.Count == 0
                    ? $"   {p.Name}: no stock on hand."
                    : $"   {p.Name}: " + string.Join(", ", inv.Take(5).Select(i => $"{i.Material} {i.Qty:0.##}{i.Unit}")) +
                      (inv.Count > 5 ? $" +{inv.Count - 5} more" : ""));
            }
            return Bot("📦 Materials:\n" + string.Join("\n", lines));
        }

        // ---- Projects: spending / payments ----
        if ((Regex.IsMatch(lower, @"\b(spend|spent|spending|payment|payments|expense|expenses|cost|budget)\b")) && project is not null)
        {
            var txns = await _projects.GetTxnsAsync(project.Id);
            var paidIn = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
            var paidOut = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
            var pct = project.Value > 0 ? Math.Round(paidOut / project.Value * 100) : 0;

            return Bot($"💵 {project.Name} — received {ReportService.Money(paidIn)}, spent {ReportService.Money(paidOut)}" +
                       $" ({(project.Value > 0 ? $"{pct}% of {ReportService.Money(project.Value)} contract" : "no contract value")})." +
                       (paidIn > 0 && project.Value > 0
                           ? $" Realisation {Math.Round(paidIn / project.Value * 100)}%."
                           : ""));
        }

        return null;
    }

    private async Task<Project?> FindProjectAsync(string lower)
    {
        var projects = await _projects.GetProjectsAsync();
        if (projects.Count == 0) return null;

        // "project X" or "X" appearing verbatim in the query
        var explicitMatch = Regex.Match(lower, @"project\s+([a-z0-9 ]+)");
        if (explicitMatch.Success)
        {
            var q = explicitMatch.Groups[1].Value.Trim().ToLowerInvariant();
            return projects.FirstOrDefault(p =>
                p.Name.ToLowerInvariant().Contains(q) || q.Contains(p.Name.ToLowerInvariant()));
        }

        foreach (var p in projects)
            if (lower.Contains(p.Name.ToLowerInvariant()))
                return p;

        return null;
    }

    private static ChatMessageDto Bot(string text) => new(text, false, DateTime.Now.ToString("HH:mm"));
    private static ChatMessageDto UserText(string text) => new(text, true, DateTime.Now.ToString("HH:mm"));
}
