using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

/// <summary>Shared form for Payment In and Payment Out — only the labels/direction differ.</summary>
public partial class ProjectPaymentFormViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public List<string> PaymentMethods { get; } = new() { "Cash", "Bank Transfer", "Cheque" };

    [ObservableProperty] private bool isPaymentIn = true;
    [ObservableProperty] private string partyName = "";
    [ObservableProperty] private string amount = "";
    [ObservableProperty] private string description = "";
    [ObservableProperty] private string referenceNumber = "";
    [ObservableProperty] private string paymentMethod = "Cash";
    [ObservableProperty] private string costCode = "";
    [ObservableProperty] private DateTime date = DateTime.Today;
    [ObservableProperty] private string status = "";

    public string Title => IsPaymentIn ? "Payment In" : "Payment Out";
    public string PartyLabel => IsPaymentIn ? "From Party *" : "To Party *";
    public string AmountLabel => IsPaymentIn ? "Amount Received" : "Amount Given";

    public ProjectPaymentFormViewModel(ProjectService svc) => _svc = svc;

    /// <summary>Called from the page's QueryProperty setter — "in" or "out".</summary>
    public void SetType(string type)
    {
        IsPaymentIn = type != "out";
        OnPropertyChanged(nameof(Title));
        OnPropertyChanged(nameof(PartyLabel));
        OnPropertyChanged(nameof(AmountLabel));
    }

    [RelayCommand]
    private async Task Save()
    {
        if (string.IsNullOrWhiteSpace(PartyName)) { Status = $"⚠️ {PartyLabel} is required."; return; }
        if (!double.TryParse(Amount, out var amt) || amt <= 0) { Status = "⚠️ Enter a valid amount."; return; }

        var party = await _svc.FindPartyByNameAsync(ProjectId, PartyName.Trim());
        if (party is null)
        {
            party = new SiteParty { ProjectId = ProjectId, Name = PartyName.Trim(), BalanceType = "pending" };
            await _svc.SavePartyAsync(party);
        }

        await _svc.SaveTxnAsync(new ProjectTxn
        {
            ProjectId = ProjectId,
            Type = IsPaymentIn ? ProjectTxnTypes.PaymentIn : ProjectTxnTypes.PaymentOut,
            PartyId = party.Id,
            PartyName = party.Name,
            Amount = amt,
            Description = Description.Trim(),
            ReferenceNumber = ReferenceNumber.Trim(),
            PaymentMethod = PaymentMethod,
            CostCode = CostCode.Trim(),
            Date = Date
        }, party);

        await Shell.Current.GoToAsync("..");
    }
}
