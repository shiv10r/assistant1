using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class SettingsViewModel : ObservableObject
{
    private readonly ReportService _reports;
    private readonly EmailService _email;

    [ObservableProperty] private string reportEmail;
    [ObservableProperty] private bool autoSend;
    [ObservableProperty] private TimeSpan autoSendTime;
    [ObservableProperty] private string smtpHost;
    [ObservableProperty] private string smtpPort;
    [ObservableProperty] private string smtpUser;
    [ObservableProperty] private string smtpPass;
    [ObservableProperty] private string status = "";

    public SettingsViewModel(ReportService reports, EmailService email)
    {
        _reports = reports;
        _email = email;

        reportEmail = EmailService.Recipient;
        autoSend = EmailService.AutoSendEnabled;
        autoSendTime = EmailService.AutoSendTime;
        smtpHost = EmailService.SmtpHost;
        smtpPort = EmailService.SmtpPort.ToString();
        smtpUser = EmailService.SmtpUser;
        smtpPass = EmailService.SmtpPass;
    }

    [RelayCommand]
    private void Save()
    {
        EmailService.Recipient = ReportEmail.Trim();
        EmailService.AutoSendEnabled = AutoSend;
        EmailService.AutoSendTime = AutoSendTime;
        EmailService.SmtpHost = SmtpHost.Trim();
        EmailService.SmtpPort = int.TryParse(SmtpPort, out var p) ? p : 587;
        EmailService.SmtpUser = SmtpUser.Trim();
        EmailService.SmtpPass = SmtpPass;
        Status = "✅ Settings saved!";
    }

    [RelayCommand]
    private async Task SendTest()
    {
        Save();
        Status = "📤 Sending today's report...";
        var date = DateTime.Today;
        var plain = await _reports.BuildDailySummaryAsync(date);
        var html = await _reports.BuildDailyHtmlAsync(date);
        Status = await _email.SendReportAsync($"LuxInfra Daily Report — {date:dd MMM yyyy}", plain, html);
    }
}
