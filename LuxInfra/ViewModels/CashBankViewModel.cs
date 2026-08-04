using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class CashBankViewModel : ObservableObject
{
    private readonly BillingService _billing;

    public ObservableCollection<CashEntry> CashEntries { get; } = new();
    public ObservableCollection<BizTxn> Cheques { get; } = new();
    public ObservableCollection<BankAccount> Banks { get; } = new();

    [ObservableProperty] private string cashBalance = "₹0";
    [ObservableProperty] private bool isAddCash = true;
    [ObservableProperty] private string adjustAmount = "";
    [ObservableProperty] private string adjustDescription = "";
    [ObservableProperty] private DateTime adjustDate = DateTime.Today;
    [ObservableProperty] private string bankName = "";
    [ObservableProperty] private string bankAccNo = "";
    [ObservableProperty] private string bankOpening = "";
    [ObservableProperty] private string status = "";

    public string AdjustCta => IsAddCash ? "＋ Add Cash" : "− Reduce Cash";

    public CashBankViewModel(BillingService billing) => _billing = billing;

    partial void OnIsAddCashChanged(bool value) => OnPropertyChanged(nameof(AdjustCta));

    [RelayCommand] private void SetAdd() => IsAddCash = true;
    [RelayCommand] private void SetReduce() => IsAddCash = false;

    [RelayCommand]
    public async Task Refresh()
    {
        CashBalance = ReportService.Money(await _billing.GetCashBalanceAsync());
        CashEntries.Clear();
        foreach (var e in await _billing.GetCashEntriesAsync()) CashEntries.Add(e);
        Cheques.Clear();
        foreach (var c in await _billing.GetChequesAsync()) Cheques.Add(c);
        Banks.Clear();
        foreach (var b in await _billing.GetBankAccountsAsync()) Banks.Add(b);
    }

    [RelayCommand]
    private async Task AdjustCash()
    {
        if (!double.TryParse(AdjustAmount, out var amount) || amount <= 0)
        {
            Status = "⚠️ Enter a valid amount.";
            return;
        }

        await _billing.AdjustCashAsync(new CashEntry
        {
            Kind = IsAddCash ? "add" : "reduce",
            Amount = amount,
            Date = AdjustDate,
            Description = AdjustDescription.Trim()
        });
        AdjustAmount = "";
        AdjustDescription = "";
        Status = IsAddCash ? "✅ Cash added." : "✅ Cash reduced.";
        await Refresh();
    }

    [RelayCommand]
    private async Task MarkCleared(BizTxn cheque)
    {
        await _billing.SetChequeStatusAsync(cheque.Id, "cleared");
        Status = $"✅ Cheque for {cheque.RefLabel} marked cleared.";
        await Refresh();
    }

    [RelayCommand]
    private async Task AddBank()
    {
        if (string.IsNullOrWhiteSpace(BankName)) { Status = "⚠️ Bank name required."; return; }
        await _billing.SaveBankAccountAsync(new BankAccount
        {
            Name = BankName.Trim(),
            AccNo = BankAccNo.Trim(),
            OpeningBalance = double.TryParse(BankOpening, out var ob) ? ob : 0
        });
        BankName = BankAccNo = BankOpening = "";
        Status = "✅ Bank account added.";
        await Refresh();
    }
}
