using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ChatViewModel : ObservableObject
{
    private readonly DatabaseService _db;
    private readonly ReportService _reports;
    private readonly EmailService _email;
    private IDispatcherTimer? _autoSendTimer;

    public ObservableCollection<ChatMessage> Messages { get; } = new();

    [ObservableProperty]
    private string inputText = "";

    public ChatViewModel(DatabaseService db, ReportService reports, EmailService email)
    {
        _db = db;
        _reports = reports;
        _email = email;

        Messages.Add(Bot(
            "👋 Hey! I'm your LuxInfra assistant.\n\n" +
            "Just tell me your expenses like:\n" +
            "•  site A paint exp = 5k\n" +
            "•  site B glass and tiles 100000\n" +
            "•  client Sharma site C labour 25k\n\n" +
            "Say  \"show report\"  for a structured report,  \"total site a\"  for a site total, or  \"email report\"  to mail it. 🚀"));
    }

    public void StartAutoSendWatcher(IDispatcher dispatcher)
    {
        if (_autoSendTimer is not null) return;
        _autoSendTimer = dispatcher.CreateTimer();
        _autoSendTimer.Interval = TimeSpan.FromSeconds(60);
        _autoSendTimer.Tick += async (_, _) => await CheckAutoSendAsync();
        _autoSendTimer.Start();
    }

    private async Task CheckAutoSendAsync()
    {
        if (!EmailService.AutoSendEnabled) return;
        if (DateTime.Now.TimeOfDay < EmailService.AutoSendTime) return;

        var today = DateTime.Today.ToString("yyyy-MM-dd");
        if (Preferences.Get("last_auto_report", "") == today) return;

        var entries = await _db.GetByDateAsync(DateTime.Today);
        if (entries.Count == 0) return;

        Preferences.Set("last_auto_report", today);

        if (EmailService.SmtpConfigured)
        {
            var status = await SendReportAsync();
            Messages.Add(Bot($"🌙 End of day! Auto-sending your report...\n{status}"));
        }
        else
        {
            await AddReportCardAsync("🌙 End-of-day report");
            Messages.Add(Bot("Type \"email report\" to mail it, or set up SMTP in ⚙️ Settings for fully automatic emails."));
        }
    }

    [RelayCommand]
    private async Task Send()
    {
        var text = InputText?.Trim();
        if (string.IsNullOrEmpty(text)) return;

        InputText = "";
        Messages.Add(new ChatMessage { Text = text, IsUser = true });

        // support multiple entries in one message, separated by newline or ';'
        var parts = text.Split(new[] { '\n', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var part in parts)
            await HandleAsync(part);
    }

    [RelayCommand]
    private async Task QuickSummary() => await HandleAsync("show report");

    [RelayCommand]
    private async Task QuickSend() => await HandleAsync("email report");

    [RelayCommand]
    private async Task QuickHelp() => await HandleAsync("help");

    [RelayCommand]
    private async Task OpenReports()
    {
        await Shell.Current.GoToAsync("//ReportsPage");
    }

    private async Task HandleAsync(string text)
    {
        var result = ExpenseParser.Parse(text);

        switch (result.Kind)
        {
            case ParseKind.Expense when result.Entry is not null:
            {
                var e = result.Entry;
                await _db.AddAsync(e);

                var siteToday = (await _db.GetByDateAsync(DateTime.Today))
                    .Where(x => x.Site.Equals(e.Site, StringComparison.OrdinalIgnoreCase)).Sum(x => x.Amount);
                var siteTotal = (await _db.GetBySiteAsync(e.Site)).Sum(x => x.Amount);
                var dayTotal = (await _db.GetByDateAsync(DateTime.Today)).Sum(x => x.Amount);

                var clientPart = string.IsNullOrEmpty(e.Client) ? "" : $" (Client: {e.Client})";
                Messages.Add(Bot(
                    $"✅ Logged {ReportService.Money(e.Amount)} — {e.Category} @ {e.Site}{clientPart}\n\n" +
                    $"📍 {e.Site} today: {ReportService.Money(siteToday)}  ·  till date: {ReportService.Money(siteTotal)}\n" +
                    $"💰 All sites today: {ReportService.Money(dayTotal)}"));
                break;
            }

            case ParseKind.Summary:
                await AddReportCardAsync($"📒 Report · {DateTime.Today:dd MMM yyyy}");
                break;

            case ParseKind.Total:
            {
                var all = await _db.GetAllAsync();
                if (all.Count == 0) { Messages.Add(Bot("No expenses recorded yet. Start logging! ✍️")); break; }
                var lines = all.GroupBy(x => x.Site).OrderBy(g => g.Key)
                    .Select(g => $"📍 {g.Key}: {ReportService.Money(g.Sum(x => x.Amount))}");
                Messages.Add(Bot("🏗️ Totals till date:\n\n" + string.Join("\n", lines) +
                                 $"\n\n💰 Grand total: {ReportService.Money(all.Sum(x => x.Amount))}"));
                break;
            }

            case ParseKind.SiteTotal when result.SiteQuery is not null:
            {
                var candidates = new[] { result.SiteQuery, "Site " + result.SiteQuery };
                List<ExpenseEntry> entries = new();
                string label = result.SiteQuery;
                foreach (var c in candidates)
                {
                    entries = await _db.GetBySiteAsync(c);
                    if (entries.Count > 0) { label = c; break; }
                }
                if (entries.Count == 0)
                {
                    Messages.Add(Bot($"🤔 No expenses found for \"{result.SiteQuery}\" yet."));
                    break;
                }
                var byCat = entries.GroupBy(x => x.Category)
                    .Select(g => $"   • {g.Key}: {ReportService.Money(g.Sum(x => x.Amount))}");
                Messages.Add(Bot($"📍 {label} — till date\n\n" + string.Join("\n", byCat) +
                                 $"\n\n💰 Total: {ReportService.Money(entries.Sum(x => x.Amount))}"));
                break;
            }

            case ParseKind.SendReport:
            {
                Messages.Add(Bot("📤 Preparing today's report..."));
                var status = await SendReportAsync();
                Messages.Add(Bot(status));
                break;
            }

            case ParseKind.Undo:
            {
                var removed = await _db.DeleteLastAsync();
                Messages.Add(Bot(removed is null
                    ? "Nothing to undo."
                    : $"🗑️ Removed: {removed.Category} {ReportService.Money(removed.Amount)} @ {removed.Site}"));
                break;
            }

            case ParseKind.Help:
                Messages.Add(Bot(
                    "Here's what I understand 👇\n\n" +
                    "✍️ Log an expense:\n" +
                    "   site A paint exp = 5k\n" +
                    "   site B tiles 100000\n" +
                    "   client Verma site D labour 25k\n" +
                    "   (5k = 5,000 · 1l = 1,00,000 · 1cr = 1,00,00,000)\n\n" +
                    "📒 show report — structured report right here\n" +
                    "📑 Reports tab — full table + Excel / PDF / PNG download\n" +
                    "🧮 total — all sites till date\n" +
                    "🔎 total site a — one site's breakdown\n" +
                    "📧 email report — mail today's report\n" +
                    "↩️ undo — remove last entry"));
                break;

            default:
                Messages.Add(Bot("🤔 I didn't catch an amount there. Try like:  site A paint exp = 5k\nOr type \"help\"."));
                break;
        }
    }

    private async Task AddReportCardAsync(string title)
    {
        var data = await _reports.BuildReportAsync(ReportPeriod.Today);
        if (data.Count == 0)
        {
            Messages.Add(Bot("📭 No expenses logged today yet. Log one like:  site A paint exp = 5k"));
            return;
        }

        Messages.Add(new ChatMessage
        {
            IsReport = true,
            ReportTitle = title,
            Rows = data.Rows,
            CategoryTotals = data.CategoryTotals,
            TotalLabel = data.TotalLabel
        });
    }

    private async Task<string> SendReportAsync()
    {
        var date = DateTime.Today;
        var plain = await _reports.BuildDailySummaryAsync(date);
        var html = await _reports.BuildDailyHtmlAsync(date);
        return await _email.SendReportAsync($"LuxInfra Daily Report — {date:dd MMM yyyy}", plain, html);
    }

    private static ChatMessage Bot(string text) => new() { Text = text, IsUser = false };
}
