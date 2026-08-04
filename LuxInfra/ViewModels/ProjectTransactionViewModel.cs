using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectTransactionViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public ObservableCollection<ProjectTxn> Txns { get; } = new();

    [ObservableProperty] private string txnBalanceLabel = "₹0";
    [ObservableProperty] private string txnTotalInLabel = "₹0";
    [ObservableProperty] private string txnTotalOutLabel = "₹0";
    [ObservableProperty] private string txnStatus = "";

    public ProjectTransactionViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load()
    {
        Txns.Clear();
        foreach (var t in await _svc.GetTxnsAsync(ProjectId)) Txns.Add(t);

        var totalIn = Txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
        var totalOut = Txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
        TxnTotalInLabel = ReportService.Money(totalIn);
        TxnTotalOutLabel = ReportService.Money(totalOut);
        TxnBalanceLabel = ReportService.Money(totalIn - totalOut);
    }

    [RelayCommand] private async Task PaymentIn() => await Shell.Current.GoToAsync($"ProjectPaymentForm?projectId={ProjectId}&type=in");
    [RelayCommand] private async Task PaymentOut() => await Shell.Current.GoToAsync($"ProjectPaymentForm?projectId={ProjectId}&type=out");

    [RelayCommand]
    private async Task NewTransaction()
    {
        var choice = await Shell.Current.DisplayActionSheet("New transaction",
            "Cancel", null,
            "Payment Out", "Payment In", "Debit Note", "Credit Note", "Party To Party",
            "Sales Invoice", "Material Sales",
            "Material Purchase", "Material Return", "Material Transfer", "Equipment Expense", "Other Expense");

        switch (choice)
        {
            case "Payment Out": await PaymentOut(); break;
            case "Payment In": await PaymentIn(); break;
            case null or "Cancel": break;
            default: TxnStatus = $"🚧 {choice} isn't wired up yet — Payment In/Out work today."; break;
        }
    }
}
