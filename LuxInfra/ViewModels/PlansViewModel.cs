using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public class CompareRow
{
    public string Feature { get; set; } = "";
    public string Silver { get; set; } = "";
    public string Gold { get; set; } = "";
}

public partial class PlansViewModel : ObservableObject
{
    [ObservableProperty] private bool isThreeYear;
    [ObservableProperty] private string selectedPlan = "Gold";
    [ObservableProperty] private string status = "";

    public string GoldStrike => IsThreeYear ? "₹3,299" : "₹1,399";
    public string GoldPrice => IsThreeYear ? "₹1,699" : "₹799";
    public string GoldPerMonth => IsThreeYear ? "Only ₹47.19 per month" : "Only ₹66.58 per month";
    public string SilverStrike => IsThreeYear ? "₹2,599" : "₹1,199";
    public string SilverPrice => IsThreeYear ? "₹1,499" : "₹699";
    public string SilverPerMonth => IsThreeYear ? "Only ₹41.64 per month" : "Only ₹58.25 per month";
    public string CtaLabel => $"Get LuxInfra {SelectedPlan}";
    public string CurrentPlan => ProfileService.Instance.Plan;

    public List<string> GoldFeatures { get; } = new()
    {
        "✓ Sync data across devices",
        "✓ Create multiple companies (5 companies)",
        "✓ Remove advertisement on invoices",
        "✓ Set multiple pricing for items",
        "✓ Restore deleted transactions (unlimited)",
        "✓ Partywise Profit and Loss Report",
    };

    public List<CompareRow> Comparison { get; } = new()
    {
        new() { Feature = "Add Expenses with input tax credit", Silver = "✓", Gold = "✓" },
        new() { Feature = "Add TCS on invoices", Silver = "✗", Gold = "✓" },
        new() { Feature = "Keep different rates for each party", Silver = "✗", Gold = "✓" },
        new() { Feature = "Create Multiple Firms", Silver = "3 Firms", Gold = "5 Firms" },
        new() { Feature = "Check Profit on Invoices", Silver = "✗", Gold = "✓" },
        new() { Feature = "Add additional fields to items", Silver = "✓", Gold = "✓" },
        new() { Feature = "Send transaction message to self", Silver = "✗", Gold = "✓" },
        new() { Feature = "Message on updating any transaction", Silver = "✗", Gold = "✓" },
        new() { Feature = "Add TDS on invoices", Silver = "✗", Gold = "✓" },
        new() { Feature = "Service reminders", Silver = "✗", Gold = "✓" },
        new() { Feature = "Custom Fields for Items", Silver = "✓", Gold = "✓" },
        new() { Feature = "Sync data across devices", Silver = "✓", Gold = "✓" },
    };

    partial void OnIsThreeYearChanged(bool value)
    {
        OnPropertyChanged(nameof(GoldStrike));
        OnPropertyChanged(nameof(GoldPrice));
        OnPropertyChanged(nameof(GoldPerMonth));
        OnPropertyChanged(nameof(SilverStrike));
        OnPropertyChanged(nameof(SilverPrice));
        OnPropertyChanged(nameof(SilverPerMonth));
    }

    partial void OnSelectedPlanChanged(string value) => OnPropertyChanged(nameof(CtaLabel));

    [RelayCommand] private void SelectGold() => SelectedPlan = "Gold";
    [RelayCommand] private void SelectSilver() => SelectedPlan = "Silver";
    [RelayCommand] private void SetOneYear() => IsThreeYear = false;
    [RelayCommand] private void SetThreeYear() => IsThreeYear = true;

    [RelayCommand]
    private async Task Purchase()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        var price = SelectedPlan == "Gold" ? GoldPrice : SilverPrice;
        var confirm = page is null || await page.DisplayAlert($"👑 LuxInfra {SelectedPlan}",
            $"Activate {SelectedPlan} ({(IsThreeYear ? "3 years" : "1 year")}) for {price}?\n\n(Demo mode — no real payment. Hook up Play Billing / Stripe for production.)",
            "Activate", "Cancel");
        if (!confirm) return;

        ProfileService.Instance.Plan = SelectedPlan;
        OnPropertyChanged(nameof(CurrentPlan));
        Status = $"🎉 {SelectedPlan} activated! {(SelectedPlan == "Gold" ? "Crown features unlocked." : "Note: 👑 features still need Gold.")}";
    }
}
