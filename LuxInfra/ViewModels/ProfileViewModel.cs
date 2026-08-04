using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;
using QuestPDF.Fluent;
using QuestPDF.Helpers;

namespace LuxInfra.ViewModels;

public class Coupon
{
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
}

public partial class ProfileViewModel : ObservableObject
{
    public ProfileService Profile => ProfileService.Instance;

    [ObservableProperty] private string themeName = ThemeService.Current;
    [ObservableProperty] private string status = "";

    public string AppVersion => $"LuxInfra v{AppInfo.Current.VersionString} (build {AppInfo.Current.BuildString})";

    public List<Coupon> Coupons { get; } = new()
    {
        new Coupon { Code = "GOLD10", Description = "10% off partner material suppliers" },
        new Coupon { Code = "SITEFREE", Description = "Free site-visit consultation this month" },
        new Coupon { Code = "FEST500", Description = "₹500 off festive décor packages" },
    };

    // ---------- appearance ----------
    [RelayCommand]
    private void SetTheme(string theme)
    {
        ThemeService.Apply(theme);
        ThemeName = theme;
        Status = $"🎨 Theme switched to {theme}";
    }

    // ---------- payments ----------
    [RelayCommand]
    private async Task AddPayment()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        if (page is null) return;
        var value = await page.DisplayPromptAsync("💳 Add payment method",
            "UPI ID or card (e.g. shivanshu@upi, Visa ****4242)", "Add", "Cancel");
        if (!string.IsNullOrWhiteSpace(value))
        {
            Profile.PaymentMethods.Add(value.Trim());
            Profile.SavePayments();
            Status = "✅ Payment method saved (stored only on this device).";
        }
    }

    [RelayCommand]
    private void RemovePayment(string method)
    {
        Profile.PaymentMethods.Remove(method);
        Profile.SavePayments();
    }

    // ---------- your impact ----------
    [RelayCommand]
    private void Donate(string amount)
    {
        if (double.TryParse(amount, out var amt))
        {
            Profile.DonationTotal += amt;
            Status = $"💚 Thank you! {ReportService.Money(amt)} added to your impact.";
        }
    }

    [RelayCommand]
    private async Task DownloadReceipt()
    {
        if (Profile.DonationTotal <= 0)
        {
            Status = "Make a donation first to get a receipt.";
            return;
        }

        try
        {
            var bytes = BuildReceiptPdf();
            var name = $"LuxInfra_Donation_Receipt_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
            var dir = DeviceInfo.Platform == DevicePlatform.WinUI
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads")
                : FileSystem.CacheDirectory;
            var path = Path.Combine(dir, name);
            await File.WriteAllBytesAsync(path, bytes);

            if (DeviceInfo.Platform == DevicePlatform.WinUI)
                await Launcher.Default.OpenAsync(new OpenFileRequest(name, new ReadOnlyFile(path)));
            else
                await Share.Default.RequestAsync(new ShareFileRequest { Title = name, File = new ShareFile(path) });

            Status = "🧾 Receipt downloaded.";
        }
        catch (Exception ex)
        {
            Status = $"⚠️ {ex.Message}";
        }
    }

    private byte[] BuildReceiptPdf()
    {
        return Document.Create(doc => doc.Page(page =>
        {
            page.Size(PageSizes.A5);
            page.Margin(32);
            page.Content().Column(col =>
            {
                col.Item().Text(t =>
                {
                    t.Span("Lux").FontSize(20).Bold();
                    t.Span("Infra").FontSize(20).Bold().FontColor("#00A896");
                });
                col.Item().PaddingTop(4).LineHorizontal(2).LineColor("#7C4DFF");
                col.Item().PaddingTop(16).Text("DONATION RECEIPT").FontSize(14).Bold();
                col.Item().PaddingTop(12).Text($"Donor: {Profile.Name}");
                col.Item().Text($"Email: {Profile.Email}");
                col.Item().Text($"Date: {DateTime.Now:dd MMM yyyy}");
                col.Item().PaddingTop(10).Text($"Total donated to date: {ReportService.Money(Profile.DonationTotal)}")
                    .FontSize(13).Bold().FontColor("#7C4DFF");
                col.Item().PaddingTop(18).Text("Thank you for making an impact with LuxInfra. 💚")
                    .FontSize(10).FontColor("#666677");
            });
        })).GeneratePdf();
    }

    // ---------- feedback & safety ----------
    [RelayCommand]
    private async Task SendFeedback()
    {
        try
        {
            await Launcher.Default.OpenAsync(
                $"mailto:{EmailService.DefaultRecipient}?subject={Uri.EscapeDataString("LuxInfra feedback")}");
        }
        catch { Status = "Couldn't open a mail app."; }
    }

    [RelayCommand]
    private async Task ReportEmergency()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        if (page is null) return;
        var call = await page.DisplayAlert("🚨 Safety emergency",
            "For an on-site emergency call 112 (national emergency number). Call now?", "📞 Call 112", "Cancel");
        if (call)
        {
            try { await Launcher.Default.OpenAsync("tel:112"); }
            catch { Status = "Dialer not available on this device — call 112 from your phone."; }
        }
    }

    [RelayCommand]
    private async Task RateApp()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        if (page is null) return;
        await page.DisplayAlert("⭐ Rate LuxInfra", "Thanks for the love! Rating opens in the store once the app is published. 💜", "OK");
    }

    [RelayCommand]
    private async Task HelpSupport()
    {
        try
        {
            await Launcher.Default.OpenAsync("https://github.com/srai54/MyAssistant");
        }
        catch { Status = "Docs live at github.com/srai54/MyAssistant"; }
    }

    [RelayCommand]
    private async Task Logout()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        if (page is null) return;
        var yes = await page.DisplayAlert("Logout", "Clear your profile info on this device? (Your expense data stays.)", "Logout", "Cancel");
        if (yes)
        {
            Profile.Logout();
            Status = "👋 Logged out — profile cleared.";
        }
    }
}
