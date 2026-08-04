using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class BillingHomeViewModel : ObservableObject
{
    private readonly BillingService _billing;

    public ObservableCollection<BizTxn> Txns { get; } = new();
    public ObservableCollection<Party> Parties { get; } = new();

    [ObservableProperty] private bool isTxnView = true;
    [ObservableProperty] private string youllGet = "₹0";
    [ObservableProperty] private string youllGive = "₹0";
    [ObservableProperty] private string monthSale = "₹0";
    [ObservableProperty] private string status = "";

    public string FabLabel => IsTxnView ? "＋ Add New Sale" : "＋ Add New Party";

    public BillingHomeViewModel(BillingService billing) => _billing = billing;

    partial void OnIsTxnViewChanged(bool value) => OnPropertyChanged(nameof(FabLabel));

    [RelayCommand]
    public async Task Refresh()
    {
        var (get, give, month) = await _billing.GetKpisAsync();
        YoullGet = ReportService.Money(Math.Abs(get));
        YoullGive = ReportService.Money(Math.Abs(give));
        MonthSale = ReportService.Money(Math.Abs(month));

        Txns.Clear();
        foreach (var t in await _billing.GetTxnsAsync()) Txns.Add(t);
        Parties.Clear();
        foreach (var p in await _billing.GetPartiesAsync()) Parties.Add(p);
    }

    [RelayCommand] private void ShowTxns() => IsTxnView = true;
    [RelayCommand] private void ShowParties() => IsTxnView = false;

    [RelayCommand]
    private async Task AddNew()
    {
        await Shell.Current.GoToAsync(IsTxnView ? "TxnForm" : "PartyForm");
    }

    [RelayCommand]
    private async Task PrintTxn(BizTxn txn)
    {
        try
        {
            Status = "⏳ Building PDF...";
            var lines = await _billing.GetTxnLinesAsync(txn.Id);
            var party = txn.PartyId > 0 ? await _billing.GetPartyAsync(txn.PartyId) : null;
            var settings = await _billing.GetAllSettingsAsync();
            var bytes = InvoicePdfService.Build(txn, party, lines, settings);

            var name = $"{txn.TypeLabel.Replace(' ', '_')}_{txn.RefNo}_{DateTime.Now:HHmmss}.pdf";
            var dir = DeviceInfo.Platform == DevicePlatform.WinUI
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads")
                : FileSystem.CacheDirectory;
            var path = Path.Combine(dir, name);
            await File.WriteAllBytesAsync(path, bytes);

            if (DeviceInfo.Platform == DevicePlatform.WinUI)
                await Launcher.Default.OpenAsync(new OpenFileRequest(name, new ReadOnlyFile(path)));
            else
                await Share.Default.RequestAsync(new ShareFileRequest { Title = name, File = new ShareFile(path) });
            Status = $"✅ {name}";
        }
        catch (Exception ex) { Status = $"⚠️ {ex.Message}"; }
    }

    [RelayCommand]
    private async Task ShareTxn(BizTxn txn)
    {
        var settings = await _billing.GetAllSettingsAsync();
        var msg = _billing.BuildShareMessage(txn, settings);
        try { await Share.Default.RequestAsync(new ShareTextRequest { Text = msg, Title = "Share transaction" }); }
        catch { Status = "Sharing not available here."; }
    }
}
