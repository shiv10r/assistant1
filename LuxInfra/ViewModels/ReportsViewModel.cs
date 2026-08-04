using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ReportsViewModel : ObservableObject
{
    private readonly ReportService _reports;
    private readonly EmailService _email;
    private ReportPeriod _period = ReportPeriod.Today;

    public ObservableCollection<ReportRow> Rows { get; } = new();
    public ObservableCollection<CategoryTotal> CategoryTotals { get; } = new();

    [ObservableProperty] private string selectedPeriodName = "Today";
    [ObservableProperty] private string periodLabel = "";
    [ObservableProperty] private string totalLabel = "₹0";
    [ObservableProperty] private string countLabel = "0 entries";
    [ObservableProperty] private string status = "";
    [ObservableProperty] private bool hasData;

    public ReportsViewModel(ReportService reports, EmailService email)
    {
        _reports = reports;
        _email = email;
    }

    [RelayCommand]
    public async Task Refresh()
    {
        var data = await _reports.BuildReportAsync(_period);

        Rows.Clear();
        foreach (var r in data.Rows) Rows.Add(r);
        CategoryTotals.Clear();
        foreach (var c in data.CategoryTotals) CategoryTotals.Add(c);

        PeriodLabel = data.PeriodLabel;
        TotalLabel = data.TotalLabel;
        CountLabel = data.Count == 1 ? "1 entry" : $"{data.Count} entries";
        HasData = data.Count > 0;
    }

    [RelayCommand]
    private async Task SetPeriod(string name)
    {
        SelectedPeriodName = name;
        _period = name switch
        {
            "Today" => ReportPeriod.Today,
            "Week" => ReportPeriod.Week,
            "Month" => ReportPeriod.Month,
            _ => ReportPeriod.All
        };
        await Refresh();
    }

    [RelayCommand]
    private async Task ExportExcel() => await ExportAsync("xlsx");

    [RelayCommand]
    private async Task ExportPdf() => await ExportAsync("pdf");

    [RelayCommand]
    private async Task ExportPng() => await ExportAsync("png");

    private async Task ExportAsync(string format)
    {
        try
        {
            Status = $"⏳ Building {format.ToUpper()}...";
            var data = await _reports.BuildReportAsync(_period);
            if (data.Count == 0) { Status = "📭 Nothing to export for this period."; return; }

            var bytes = format switch
            {
                "xlsx" => ExportService.BuildExcel(data),
                "pdf" => ExportService.BuildPdf(data),
                _ => ExportService.BuildPng(data)
            };

            var fileName = $"LuxInfra_Report_{SelectedPeriodName}_{DateTime.Now:yyyyMMdd_HHmm}.{format}";
            string dir;
            if (DeviceInfo.Platform == DevicePlatform.WinUI)
            {
                dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
                if (!Directory.Exists(dir)) dir = FileSystem.CacheDirectory;
            }
            else
            {
                dir = FileSystem.CacheDirectory;
            }

            var path = Path.Combine(dir, fileName);
            await File.WriteAllBytesAsync(path, bytes);

            if (DeviceInfo.Platform == DevicePlatform.WinUI)
            {
                Status = $"✅ Saved to Downloads: {fileName}";
                await Launcher.Default.OpenAsync(new OpenFileRequest(fileName, new ReadOnlyFile(path)));
            }
            else
            {
                Status = $"✅ {fileName} ready — choose where to share/save.";
                await Share.Default.RequestAsync(new ShareFileRequest
                {
                    Title = fileName,
                    File = new ShareFile(path)
                });
            }
        }
        catch (Exception ex)
        {
            Status = $"⚠️ Export failed: {ex.Message}";
        }
    }

    [RelayCommand]
    private async Task EmailReport()
    {
        Status = "📤 Preparing email...";
        var data = await _reports.BuildReportAsync(_period);
        if (data.Count == 0) { Status = "📭 Nothing to email for this period."; return; }

        string? attachment = null;
        try
        {
            var pdf = ExportService.BuildPdf(data);
            attachment = Path.Combine(FileSystem.CacheDirectory, $"LuxInfra_Report_{SelectedPeriodName}.pdf");
            await File.WriteAllBytesAsync(attachment, pdf);
        }
        catch { /* fall back to text-only email */ }

        var plain = await _reports.BuildDailySummaryAsync(DateTime.Today);
        var html = await _reports.BuildDailyHtmlAsync(DateTime.Today);
        Status = await _email.SendReportAsync($"LuxInfra Expense Report — {PeriodLabel}", plain, html, attachment);
    }
}
