using LuxInfra.Api.Services;
using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/insights")]
public class InsightsController : ControllerBase
{
    private readonly DatabaseService _db;
    private readonly ReportService _reports;
    private readonly IBillingService _billing;
    private readonly IProjectService _projects;
    private readonly IActivityService _activity;
    private readonly ChatAiService _ai;
    private readonly EmailService _email;

    public InsightsController(DatabaseService db, ReportService reports, IBillingService billing,
        IProjectService projects, IActivityService activity, ChatAiService ai, EmailService email)
    {
        _db = db;
        _reports = reports;
        _billing = billing;
        _projects = projects;
        _activity = activity;
        _ai = ai;
        _email = email;
    }

    // ---- Site-wise P&L (8) ----

    [HttpGet("pl")]
    public async Task<ActionResult> Pl()
    {
        var projects = await _projects.GetProjectsAsync();
        var rows = new List<object>();
        double tValue = 0, tReceived = 0, tSpent = 0;
        foreach (var p in projects)
        {
            var txns = await _projects.GetTxnsAsync(p.Id);
            var received = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
            var spent = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
            var profit = received - spent;
            tValue += p.Value; tReceived += received; tSpent += spent;
            rows.Add(new
            {
                p.Id, p.Name, p.Status,
                value = p.Value, valueLabel = ReportService.Money(p.Value),
                received, receivedLabel = ReportService.Money(received),
                spent, spentLabel = ReportService.Money(spent),
                profit, profitLabel = ReportService.Money(profit),
                marginPct = p.Value > 0 ? Math.Round(profit / p.Value * 100) : 0,
            });
        }
        return Ok(new
        {
            rows,
            totals = new
            {
                value = tValue, valueLabel = ReportService.Money(tValue),
                received = tReceived, receivedLabel = ReportService.Money(tReceived),
                spent = tSpent, spentLabel = ReportService.Money(tSpent),
                profit = tReceived - tSpent, profitLabel = ReportService.Money(tReceived - tSpent),
            },
        });
    }

    // ---- GSTR-1 tax summary (10) ----

    [HttpGet("gstr1")]
    public async Task<ActionResult> Gstr1([FromQuery] string period = "Month")
    {
        var from = FromDate(period);
        var txns = (await _billing.GetTxnsAsync()).Where(t => t.Type == TxnTypes.Sale && t.Date >= from).ToList();
        var hsnRows = new Dictionary<string, (double Taxable, double Tax, int Count, string RateLabel)>();
        double taxableTotal = 0, taxTotal = 0, cgst = 0, sgst = 0, igst = 0;
        var intraState = (await _billing.GetAllSettingsAsync()).GetValueOrDefault("gst.state_of_supply") == "1";

        foreach (var t in txns)
        {
            var lines = await _billing.GetTxnLinesAsync(t.Id);
            foreach (var line in lines)
            {
                var hsn = string.IsNullOrWhiteSpace(line.HsnSac) ? "Unspecified" : line.HsnSac;
                var taxable = line.Amount;
                var tax = line.Amount * line.TaxRate / 100.0;
                taxableTotal += taxable; taxTotal += tax;
                if (hsnRows.TryGetValue(hsn, out var cur))
                    hsnRows[hsn] = (cur.Taxable + taxable, cur.Tax + tax, cur.Count + 1, $"{line.TaxRate}%");
                else
                    hsnRows[hsn] = (taxable, tax, 1, $"{line.TaxRate}%");
            }
        }

        // Treat all as intra-state unless inter-state is marked per party (approximation).
        cgst = sgst = taxTotal / 2.0;

        return Ok(new
        {
            period,
            periodLabel = $"From {from:dd MMM yyyy}",
            summary = new
            {
                invoiceCount = txns.Count,
                taxableTotal, taxableLabel = ReportService.Money(taxableTotal),
                taxTotal, taxLabel = ReportService.Money(taxTotal),
                cgst = ReportService.Money(cgst), sgst = ReportService.Money(sgst), igst = ReportService.Money(igst),
            },
            hsnRows = hsnRows.OrderByDescending(kv => kv.Value.Taxable).Select(kv => new
            {
                hsn = kv.Key,
                rateLabel = kv.Value.RateLabel,
                count = kv.Value.Count,
                taxable = kv.Value.Taxable, taxableLabel = ReportService.Money(kv.Value.Taxable),
                tax = kv.Value.Tax, taxLabel = ReportService.Money(kv.Value.Tax),
            }),
        });
    }

    // ---- Credit control dashboard (32) ----

    [HttpGet("credit")]
    public async Task<ActionResult> Credit()
    {
        var parties = await _billing.GetPartiesAsync();
        var txns = await _billing.GetTxnsAsync();
        var receivable = parties.Where(p => p.CurrentBalance > 0).Sum(p => p.CurrentBalance);
        var payable = parties.Where(p => p.CurrentBalance < 0).Sum(p => -p.CurrentBalance);

        var overdue = new List<object>();
        var overdueTotal = 0.0;
        foreach (var t in txns.Where(t => t.Type == TxnTypes.Sale && t.Balance > 0 && t.DueDate < DateTime.Today))
        {
            var days = (DateTime.Today - t.DueDate).Days;
            overdueTotal += t.Balance;
            overdue.Add(new
            {
                t.Id, party = t.PartyName, refLabel = t.RefLabel,
                balance = t.Balance, balanceLabel = ReportService.Money(t.Balance),
                due = t.DueDate.ToString("dd MMM yy"), daysOverdue = days,
                bucket = days <= 30 ? "0-30" : days <= 60 ? "31-60" : days <= 90 ? "61-90" : "90+",
            });
        }
        var buckets = overdue.GroupBy(o => ((dynamic)o).bucket)
            .Select(g => new { bucket = g.Key, total = ReportService.Money(g.Sum(o => ((dynamic)o).balance)), count = g.Count() });

        return Ok(new
        {
            receivable, receivableLabel = ReportService.Money(receivable),
            payable, payableLabel = ReportService.Money(payable),
            netReceivable = receivable - payable, netReceivableLabel = ReportService.Money(receivable - payable),
            overdueTotalLabel = ReportService.Money(overdueTotal),
            buckets,
            overdue,
            parties = parties.Where(p => p.CurrentBalance != 0)
                .OrderByDescending(p => p.CurrentBalance)
                .Select(p => new
                {
                    p.Id, p.Name, p.Phone,
                    balance = p.CurrentBalance, balanceLabel = ReportService.Money(Math.Abs(p.CurrentBalance)),
                    direction = p.CurrentBalance >= 0 ? "You'll Get" : "You'll Give",
                }),
        });
    }

    // ---- Cash flow forecast (33) ----

    [HttpGet("forecast")]
    public async Task<ActionResult> Forecast()
    {
        var txns = await _billing.GetTxnsAsync();
        var today = DateTime.Today;

        double Incoming(int days)
        {
            var cut = today.AddDays(days);
            return txns.Where(t => t.Type == TxnTypes.Sale && t.Balance > 0 && t.DueDate <= cut).Sum(t => t.Balance);
        }
        double Outgoing(int days)
        {
            var cut = today.AddDays(days);
            return txns.Where(t => t.Type == TxnTypes.Purchase && t.Balance > 0 && t.DueDate <= cut).Sum(t => t.Balance);
        }

        var buckets = new[]
        {
            new { window = "Next 30 days", inflow = Incoming(30), outflow = Outgoing(30) },
            new { window = "Next 60 days", inflow = Incoming(60), outflow = Outgoing(60) },
            new { window = "Next 90 days", inflow = Incoming(90), outflow = Outgoing(90) },
        }.Select(b => new
        {
            b.window,
            inflow = ReportService.Money(b.inflow),
            outflow = ReportService.Money(b.outflow),
            net = b.inflow - b.outflow, netLabel = ReportService.Money(b.inflow - b.outflow),
        });

        return Ok(new
        {
            cashNow = await _billing.GetCashBalanceAsync(),
            cashNowLabel = ReportService.Money(await _billing.GetCashBalanceAsync()),
            buckets,
        });
    }

    // ---- Stock valuation + low/dead stock (14, 37) ----

    [HttpGet("stock")]
    public async Task<ActionResult> Stock()
    {
        var items = await _billing.GetItemsAsync();
        var txns = await _billing.GetTxnsAsync();
        var usedItemIds = new HashSet<int>();
        foreach (var t in txns.Where(t => t.Type == TxnTypes.Sale || t.Type == TxnTypes.SaleOrder || t.Type == TxnTypes.Purchase))
            foreach (var line in await _billing.GetTxnLinesAsync(t.Id))
                if (line.ItemId > 0) usedItemIds.Add(line.ItemId);

        var rows = items.Where(i => i.Type != "Service").Select(i => new
        {
            i.Id, i.Name, i.Unit, i.Category,
            stock = i.StockQty, stockLabel = $"{i.StockQty:0.##} {i.Unit}",
            rate = i.PurchasePrice > 0 ? i.PurchasePrice : i.SalePrice,
            value = i.StockQty * (i.PurchasePrice > 0 ? i.PurchasePrice : i.SalePrice),
            lowStock = i.MinStock > 0 && i.StockQty < i.MinStock,
            dead = i.StockQty > 0 && !usedItemIds.Contains(i.Id),
            minStock = i.MinStock,
        }).ToList();

        var totalValue = rows.Sum(r => r.value);
        return Ok(new
        {
            totalValueLabel = ReportService.Money(totalValue),
            lowStockCount = rows.Count(r => r.lowStock),
            deadStockCount = rows.Count(r => r.dead),
            rows = rows.OrderByDescending(r => r.value),
        });
    }

    // ---- Labour force summary (23) ----

    [HttpGet("labour")]
    public async Task<ActionResult> Labour([FromQuery] int? projectId, [FromQuery] int days = 30)
    {
        var projects = projectId is > 0
            ? new List<Project> { await _projects.GetProjectAsync(projectId.Value) }
            : await _projects.GetProjectsAsync();
        projects = projects.Where(p => p is not null).ToList();

        var from = DateTime.Today.AddDays(-(days - 1));
        var rows = new List<object>();
        int totalPresent = 0; double totalWages = 0;
        foreach (var p in projects)
        {
            var parties = await _projects.GetPartiesAsync(p.Id);
            var attendance = await _projects.GetAttendanceInRangeAsync(p.Id, from, DateTime.Today);
            var presentByParty = attendance.Where(a => a.Status == AttendanceStatuses.Present)
                .GroupBy(a => a.PartyId)
                .ToDictionary(g => g.Key, g => g.Count());
            var workers = presentByParty.Count;
            var presentDays = presentByParty.Values.Sum();
            var wages = presentByParty.Sum(kv =>
                (parties.FirstOrDefault(pa => pa.Id == kv.Key)?.DailyRate ?? 0) * kv.Value);
            totalPresent += presentDays; totalWages += wages;
            rows.Add(new
            {
                p.Id, p.Name,
                workers, presentDays,
                wages, wagesLabel = ReportService.Money(wages),
                avgPerWorker = workers > 0 ? Math.Round((double)presentDays / workers, 1) : 0,
            });
        }

        return Ok(new
        {
            days,
            totalWorkers = rows.Sum(r => (int)((dynamic)r).workers),
            totalPresent, totalPresentLabel = $"{totalPresent} man-days",
            totalWagesLabel = ReportService.Money(totalWages),
            rows,
        });
    }

    // ---- Delayed-payment interest (26) ----

    [HttpGet("delayed")]
    public async Task<ActionResult> Delayed([FromQuery] double rate = 12)
    {
        var txns = (await _billing.GetTxnsAsync())
            .Where(t => t.Type == TxnTypes.Sale && t.Balance > 0 && t.DueDate < DateTime.Today);
        var rows = new List<object>();
        double totalInterest = 0;
        foreach (var t in txns)
        {
            var days = (DateTime.Today - t.DueDate).Days;
            var interest = Math.Round(t.Balance * rate / 100.0 * days / 365.0);
            totalInterest += interest;
            rows.Add(new
            {
                t.Id, party = t.PartyName, refLabel = t.RefLabel,
                balance = t.Balance, balanceLabel = ReportService.Money(t.Balance),
                daysOverdue = days, interest, interestLabel = ReportService.Money(interest),
            });
        }
        return Ok(new { rate, totalInterestLabel = ReportService.Money(totalInterest), rows });
    }

    // ---- Advance payment ledger (22) ----

    [HttpGet("advances")]
    public async Task<ActionResult> Advances()
    {
        var projects = await _projects.GetProjectsAsync();
        var rows = new List<object>();
        double tAdvance = 0, tSpent = 0;
        foreach (var p in projects)
        {
            var txns = await _projects.GetTxnsAsync(p.Id);
            var advance = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
            var spent = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
            tAdvance += advance; tSpent += spent;
            rows.Add(new
            {
                p.Id, p.Name, p.Status,
                advance, advanceLabel = ReportService.Money(advance),
                spent, spentLabel = ReportService.Money(spent),
                remaining = advance - spent, remainingLabel = ReportService.Money(advance - spent),
            });
        }
        return Ok(new
        {
            totalAdvanceLabel = ReportService.Money(tAdvance),
            totalSpentLabel = ReportService.Money(tSpent),
            netAdvanceLabel = ReportService.Money(tAdvance - tSpent),
            rows,
        });
    }

    // ---- Daily cash book digest (7) ----

    [HttpGet("digest")]
    public async Task<ActionResult> Digest()
    {
        var today = DateTime.Today;
        var todays = await _db.GetByDateAsync(today);
        var all = await _db.GetAllAsync();
        var txns = await _billing.GetTxnsAsync();
        var monthSale = txns.Where(t => t.Type == TxnTypes.Sale && t.Date.Year == today.Year && t.Date.Month == today.Month).Sum(t => t.Total);
        var dueSoon = txns.Where(t => t.Type == TxnTypes.Sale && t.Balance > 0 && t.DueDate >= today && t.DueDate <= today.AddDays(7)).Sum(t => t.Balance);
        var overdue = txns.Where(t => t.Type == TxnTypes.Sale && t.Balance > 0 && t.DueDate < today).Sum(t => t.Balance);

        var lines = new List<string>
        {
            $"# LuxInfra — {today:dddd, dd MMM yyyy}",
            "",
            $"## Today's expenses: {ReportService.Money(todays.Sum(e => e.Amount))} ({todays.Count} entries)",
            $"## This month's sales: {ReportService.Money(monthSale)}",
            $"## Due in next 7 days: {ReportService.Money(dueSoon)}",
            $"## Overdue (unpaid): {ReportService.Money(overdue)}",
            "",
        };
        foreach (var group in todays.GroupBy(e => e.Site).OrderByDescending(g => g.Sum(e => e.Amount)))
        {
            lines.Add($"- **{group.Key}**: {ReportService.Money(group.Sum(e => e.Amount))}");
            foreach (var e in group.OrderByDescending(e => e.Amount))
                lines.Add($"  - {e.Category}: {ReportService.Money(e.Amount)}");
        }
        lines.Add("");
        lines.Add("_Generated by LuxInfra._");

        return Ok(new { text = string.Join("\n", lines) });
    }

    // ---- AI project health score (31) ----

    [HttpGet("health")]
    public async Task<ActionResult> Health()
    {
        var projects = await _projects.GetProjectsAsync();
        var parts = new List<string>();
        foreach (var p in projects.Take(15))
        {
            var tasks = await _projects.GetTasksAsync(p.Id);
            var txns = await _projects.GetTxnsAsync(p.Id);
            var done = tasks.Count == 0 ? 0 : (int)Math.Round((double)tasks.Count(t => t.Status == TaskStatuses.Completed) / tasks.Count * 100);
            var spent = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
            var received = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
            parts.Add($"{p.Name} (status: {p.Status}, value: Rs {p.Value:0}, tasks done: {done}%, spent: Rs {spent:0}, received: Rs {received:0})");
        }
        var prompt = $"These are my construction projects:\n{string.Join("\n", parts)}\n\n" +
                     "Score each project's health from 1-10 and in 3 bullet points say which projects need urgent attention and why (payment shortfall, over-budget, behind on tasks). Be concise.";

        var ai = await _ai.AskAsync(prompt, new List<ChatTurn>());
        if (!ai.Ok)
        {
            // Rule-based fallback when AI isn't configured.
            var fb = new List<string>();
            foreach (var p in projects)
            {
                var txns = await _projects.GetTxnsAsync(p.Id);
                var spent = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
                var received = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
                var score = p.Value > 0 ? Math.Max(1, Math.Min(10, (int)((1 - spent / p.Value) * 5 + (received / Math.Max(1, p.Value)) * 5))) : 5;
                fb.Add($"- **{p.Name}**: health {score}/10 — spent {ReportService.Money(spent)} of {ReportService.Money(p.Value)}, received {ReportService.Money(received)}.");
            }
            return Ok(new
            {
                ok = false, configured = false, model = _ai.Model,
                text = fb.Count == 0 ? "No projects to score yet." : string.Join("\n", fb),
            });
        }

        return Ok(new { ok = true, configured = true, model = _ai.Model, text = ai.Text });
    }

    // ---- Auto due-reminders (3) ----

    [HttpPost("reminders/send")]
    public async Task<ActionResult> SendReminders()
    {
        var txns = (await _billing.GetTxnsAsync())
            .Where(t => t.Type == TxnTypes.Sale && t.Balance > 0 && t.DueDate < DateTime.Today).ToList();
        var settings = await _billing.GetAllSettingsAsync();
        var firm = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        int sent = 0; var errors = new List<string>();

        foreach (var t in txns)
        {
            if (t.PartyId <= 0) continue;
            var party = await _billing.GetPartyAsync(t.PartyId);
            if (string.IsNullOrWhiteSpace(party?.Email)) continue;

            var days = (DateTime.Today - t.DueDate).Days;
            var subject = $"Payment reminder — {t.RefLabel}";
            var message = $"Dear {party.Name},\n\nThis is a reminder that invoice {t.RefLabel} of {ReportService.Money(t.Balance)} was due {days} day(s) ago.\n\nPlease arrange payment at your earliest convenience.\n\nThanks,\n{firm}";
            var pdf = ReminderPdf(t, party, days, firm);
            var err = await _email.SendPdfAsync(party.Email, subject, message, $"{t.RefLabel}-reminder.pdf", pdf);
            if (err is null) sent++;
            else if (err == "not_configured") return Ok(new { ok = false, code = "not_configured", message = "Email is not enabled — add RESEND_API_KEY on the server." });
            else errors.Add($"{t.RefLabel}: {err}");
        }

        await _activity.LogAsync("Due reminders sent", $"{sent} invoice(s)");
        return Ok(new { ok = true, sent, total = txns.Count, errors });
    }

    // ---- Daily DB backup to email (35) ----

    [HttpPost("backup-email")]
    public async Task<ActionResult> BackupToEmail()
    {
        if (!_email.Configured) return Ok(new { ok = false, code = "not_configured", message = "Email is not enabled — add RESEND_API_KEY on the server." });

        var settings = await _billing.GetAllSettingsAsync();
        var to = settings.GetValueOrDefault("general.email_to", settings.GetValueOrDefault("general.firm_email", ""));
        if (string.IsNullOrWhiteSpace(to))
            return Ok(new { ok = false, code = "no_recipient", message = "Set a recipient email in Billing Settings (Firm Email or Email To)." });

        var file = _db.DbPath;
        if (!System.IO.File.Exists(file)) return BadRequest(new { ok = false, error = "Database file not found." });

        var bytes = await System.IO.File.ReadAllBytesAsync(file);
        var stamp = DateTime.Now.ToString("yyyyMMdd_HHmm");
        var err = await _email.SendPdfAsync(to, $"LuxInfra backup — {stamp}", "Attached is your full database backup.", $"luxinfra-backup-{stamp}.db3", bytes);
        if (err is not null) return BadRequest(new { ok = false, error = err });

        await _activity.LogAsync("Backup emailed", stamp);
        return Ok(new { ok = true, to });
    }

    // ---- Payslip PDF (12) ----

    [HttpGet("payslip")]
    public async Task<ActionResult> Payslip([FromQuery] int projectId, [FromQuery] int partyId, [FromQuery] string? from, [FromQuery] string? to)
    {
        var project = await _projects.GetProjectAsync(projectId);
        if (project is null) return NotFound("Project not found");

        var parties = await _projects.GetPartiesAsync(projectId);
        var party = parties.FirstOrDefault(p => p.Id == partyId);
        if (party is null) return NotFound("Worker not found");

        var fromD = ParseDate(from, DateTime.Today.AddDays(-29));
        var toD = ParseDate(to, DateTime.Today);
        var attendance = await _projects.GetAttendanceInRangeAsync(projectId, fromD, toD);
        var present = attendance.Count(a => a.PartyId == partyId && a.Status == AttendanceStatuses.Present);
        var hours = attendance.Where(a => a.PartyId == partyId).Sum(a => a.HoursLogged);
        var gross = present * party.DailyRate;
        var net = gross - Math.Max(0, party.CurrentBalance);

        var settings = await _billing.GetAllSettingsAsync();
        var firm = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        var pdf = PayslipPdf(party, project, present, hours, gross, net, fromD, toD, firm);
        return File(pdf, "application/pdf", $"Payslip-{party.Name}-{fromD:yyyyMMdd}-{toD:yyyyMMdd}.pdf");
    }

    // ---- helpers ----

    private static DateTime FromDate(string period) => period.ToLowerInvariant() switch
    {
        "today" => DateTime.Today,
        "week" => DateTime.Today.AddDays(-6),
        "all" => DateTime.MinValue,
        _ => new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1)
    };

    private static DateTime ParseDate(string? s, DateTime fallback) =>
        DateTime.TryParse(s, out var d) ? d.Date : fallback;

    private static byte[] ReminderPdf(BizTxn t, Party party, int days, string firm)
    {
        return Document.Create(doc => doc.Page(page =>
        {
            page.Size(PageSizes.A5);
            page.Margin(24);
            page.DefaultTextStyle(x => x.FontSize(10).FontColor("#222233"));
            page.Content().Column(col =>
            {
                col.Item().Text(t => { t.Span("Lux").FontSize(18).Bold(); t.Span("Infra").FontSize(18).Bold().FontColor("#00A896"); });
                col.Item().PaddingTop(10).Text("PAYMENT REMINDER").FontSize(14).Bold().FontColor("#7C4DFF");
                col.Item().PaddingTop(8).Text($"Dear {party.Name},");
                col.Item().PaddingTop(6).Text($"Invoice {t.RefLabel} of {ReportService.Money(t.Balance)} was due {days} day(s) ago.");
                col.Item().PaddingTop(6).Text("Please arrange payment at your earliest convenience.");
                col.Item().PaddingTop(14).Text($"Thanks,\n{firm}");
            });
        })).GeneratePdf();
    }

    private static byte[] PayslipPdf(SiteParty party, Project project, int present, double hours, double gross, double net, DateTime from, DateTime to, string firm)
    {
        return Document.Create(doc => doc.Page(page =>
        {
            page.Size(PageSizes.A5);
            page.Margin(24);
            page.DefaultTextStyle(x => x.FontSize(10).FontColor("#222233"));
            page.Content().Column(col =>
            {
                col.Item().Row(row =>
                {
                    row.RelativeItem().Text(t => { t.Span("Lux").FontSize(16).Bold(); t.Span("Infra").FontSize(16).Bold().FontColor("#00A896"); });
                    row.ConstantItem(150).AlignRight().Text("PAYSLIP").FontSize(13).Bold().FontColor("#7C4DFF");
                });
                col.Item().PaddingTop(8).LineHorizontal(2).LineColor("#7C4DFF");
                col.Item().PaddingTop(8).Text($"Worker: {party.Name}").FontSize(12).Bold();
                col.Item().Text($"Project: {project.Name}");
                col.Item().Text($"Period: {from:dd MMM yyyy} — {to:dd MMM yyyy}");
                col.Item().PaddingTop(10).Table(table =>
                {
                    table.ColumnsDefinition(cc => { cc.RelativeColumn(1); cc.RelativeColumn(1); });
                    void Row2(string k, string v)
                    {
                        table.Cell().Padding(4).Background("#F4F2FB").Text(k).Bold();
                        table.Cell().Padding(4).AlignRight().Text(v);
                    }
                    Row2("Days present", present.ToString());
                    Row2("Hours logged", $"{hours:0.#} hrs");
                    Row2("Daily rate", ReportService.Money(party.DailyRate));
                    Row2("Gross wages", ReportService.Money(gross));
                    Row2("Advance / balance", ReportService.Money(Math.Max(0, party.CurrentBalance)));
                    Row2("Net payable", ReportService.Money(net));
                });
                col.Item().PaddingTop(14).Text($"Authorised by {firm}");
            });
        })).GeneratePdf();
    }
}
