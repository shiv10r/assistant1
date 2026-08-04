using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class PartyFormViewModel : ObservableObject
{
    private readonly BillingService _billing;

    public static readonly string[] GstTypes =
        { "Unregistered/Consumer", "Registered Business - Regular", "Registered Business - Composition" };

    [ObservableProperty] private string name = "";
    [ObservableProperty] private string phone = "";
    [ObservableProperty] private string openingBalance = "";
    [ObservableProperty] private DateTime asOfDate = DateTime.Today;
    [ObservableProperty] private bool toReceive;          // default To Pay (per spec)
    [ObservableProperty] private string creditLimit = "";
    [ObservableProperty] private string gstType = GstTypes[0];
    [ObservableProperty] private string gstin = "";
    [ObservableProperty] private string state = "";
    [ObservableProperty] private string billingAddress = "";
    [ObservableProperty] private string email = "";
    [ObservableProperty] private string status = "";

    public List<string> GstTypeOptions { get; } = GstTypes.ToList();
    public bool GstinRequired => GstType != GstTypes[0];

    public PartyFormViewModel(BillingService billing) => _billing = billing;

    partial void OnGstTypeChanged(string value) => OnPropertyChanged(nameof(GstinRequired));

    [RelayCommand]
    private async Task Save() { if (await SaveInternal()) await Shell.Current.GoToAsync(".."); }

    [RelayCommand]
    private async Task SaveAndNew()
    {
        if (await SaveInternal())
        {
            Name = Phone = OpeningBalance = CreditLimit = Gstin = BillingAddress = Email = "";
            ToReceive = false;
            Status = "✅ Saved! Add the next party.";
        }
    }

    private async Task<bool> SaveInternal()
    {
        if (string.IsNullOrWhiteSpace(Name)) { Status = "⚠️ Party name is required."; return false; }
        if (GstinRequired && string.IsNullOrWhiteSpace(Gstin)) { Status = "⚠️ GSTIN is required for registered businesses."; return false; }

        if (!string.IsNullOrWhiteSpace(CreditLimit) && !ProfileService.Instance.IsGold)
        {
            Status = "👑 Credit limit is a Gold feature — enable Gold in My Account.";
            return false;
        }

        await _billing.SavePartyAsync(new Party
        {
            Name = Name.Trim(),
            Phone = Phone.Trim(),
            OpeningBalance = double.TryParse(OpeningBalance, out var ob) ? ob : 0,
            BalanceType = ToReceive ? "receive" : "pay",
            AsOfDate = AsOfDate,
            CreditLimit = double.TryParse(CreditLimit, out var cl) ? cl : 0,
            GstType = GstType,
            Gstin = Gstin.Trim(),
            State = State.Trim(),
            BillingAddress = BillingAddress.Trim(),
            Email = Email.Trim()
        });
        return true;
    }
}
