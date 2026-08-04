using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class TxnLine : ObservableObject
{
    public Action? Changed { get; set; }
    public List<CatalogItem> ItemChoices { get; set; } = new();

    [ObservableProperty] private CatalogItem? selectedItem;
    [ObservableProperty] private string qty = "1";
    [ObservableProperty] private string rate = "0";
    [ObservableProperty] private string taxPct = "0";

    public double QtyVal => double.TryParse(Qty, out var q) ? q : 0;
    public double RateVal => double.TryParse(Rate, out var r) ? r : 0;
    public double TaxVal => double.TryParse(TaxPct, out var t) ? t : 0;
    public double Base => QtyVal * RateVal;
    public double TaxAmount => Base * TaxVal / 100;
    public double Amount => Base + TaxAmount;
    public string AmountLabel => ReportService.Money(Amount);

    partial void OnSelectedItemChanged(CatalogItem? value)
    {
        if (value is not null)
        {
            Rate = value.SalePrice.ToString("0.##");
            TaxPct = value.TaxRate.ToString("0.##");
        }
        Recalc();
    }

    partial void OnQtyChanged(string value) => Recalc();
    partial void OnRateChanged(string value) => Recalc();
    partial void OnTaxPctChanged(string value) => Recalc();

    private void Recalc()
    {
        OnPropertyChanged(nameof(AmountLabel));
        Changed?.Invoke();
    }
}

public partial class TxnFormViewModel : ObservableObject
{
    private readonly BillingService _billing;
    private List<CatalogItem> _items = new();

    public List<string> TypeOptions { get; } = TxnTypes.All.Select(TxnTypes.Display).ToList();
    public ObservableCollection<Party> PartyChoices { get; } = new();
    public ObservableCollection<TxnLine> Lines { get; } = new();

    [ObservableProperty] private string typeName = "Sale";
    [ObservableProperty] private Party? selectedParty;
    [ObservableProperty] private string partyNameText = "";
    [ObservableProperty] private string refLabel = "#1";
    [ObservableProperty] private DateTime date = DateTime.Today;
    [ObservableProperty] private DateTime dueDate = DateTime.Today;
    [ObservableProperty] private string discount = "";
    [ObservableProperty] private string received = "";
    [ObservableProperty] private string paymentAmount = "";
    [ObservableProperty] private string description = "";
    [ObservableProperty] private string stateOfSupply = "";
    [ObservableProperty] private string paymentMode = "Cash";

    public List<string> PaymentModeOptions { get; } = new() { "Cash", "Cheque", "Bank Transfer", "UPI", "Card" };
    [ObservableProperty] private string status = "";
    [ObservableProperty] private string subtotalLabel = "₹0";
    [ObservableProperty] private string taxLabel = "₹0";
    [ObservableProperty] private string totalLabel = "₹0";
    [ObservableProperty] private string balanceLabel = "₹0";

    public bool IsPayment => TypeName is "Payment-In" or "Payment-Out";
    public bool IsNotPayment => !IsPayment;

    private string TypeCode => TxnTypes.All[TypeOptions.IndexOf(TypeName)];

    public TxnFormViewModel(BillingService billing) => _billing = billing;

    public async Task LoadAsync()
    {
        _items = await _billing.GetItemsAsync();
        PartyChoices.Clear();
        foreach (var p in await _billing.GetPartiesAsync()) PartyChoices.Add(p);
        Lines.Clear();
        if (!IsPayment) AddLine();
        await UpdateRefNo();
        Recalc();
    }

    partial void OnTypeNameChanged(string value)
    {
        OnPropertyChanged(nameof(IsPayment));
        OnPropertyChanged(nameof(IsNotPayment));
        _ = UpdateRefNo();
        Recalc();
    }

    partial void OnSelectedPartyChanged(Party? value)
    {
        if (value is not null)
        {
            PartyNameText = value.Name;
            if (!string.IsNullOrEmpty(value.State)) StateOfSupply = value.State;
        }
    }

    partial void OnDiscountChanged(string value) => Recalc();
    partial void OnReceivedChanged(string value) => Recalc();
    partial void OnPaymentAmountChanged(string value) => Recalc();

    private async Task UpdateRefNo() => RefLabel = $"#{await _billing.NextRefNoAsync(TypeCode)}";

    [RelayCommand]
    private void AddLine()
    {
        var line = new TxnLine { ItemChoices = _items, Changed = Recalc };
        Lines.Add(line);
        Recalc();
    }

    [RelayCommand]
    private void RemoveLine(TxnLine line)
    {
        Lines.Remove(line);
        Recalc();
    }

    private (double subtotal, double tax, double discount, double total, double received) Compute()
    {
        if (IsPayment)
        {
            var amt = double.TryParse(PaymentAmount, out var a) ? a : 0;
            return (amt, 0, 0, amt, amt);
        }
        var subtotal = Lines.Sum(l => l.Base);
        var tax = Lines.Sum(l => l.TaxAmount);
        var disc = double.TryParse(Discount, out var d) ? d : 0;
        var total = Math.Max(0, subtotal + tax - disc);
        var recv = double.TryParse(Received, out var r) ? r : 0;
        return (subtotal, tax, disc, total, recv);
    }

    private void Recalc()
    {
        var (subtotal, tax, _, total, received) = Compute();
        SubtotalLabel = ReportService.Money(subtotal);
        TaxLabel = ReportService.Money(tax);
        TotalLabel = ReportService.Money(total);
        BalanceLabel = ReportService.Money(Math.Max(0, total - received));
    }

    [RelayCommand]
    private async Task Save() => await SaveInternal(print: false);

    [RelayCommand]
    private async Task SaveAndPrint() => await SaveInternal(print: true);

    private async Task SaveInternal(bool print)
    {
        var (subtotal, tax, disc, total, received) = Compute();
        if (total <= 0) { Status = "⚠️ Add at least one item (or an amount)."; return; }

        var roundOn = await _billing.IsOnAsync("txn.round_off");
        var rounded = roundOn ? Math.Round(total) : total;

        var txn = new BizTxn
        {
            PartyId = SelectedParty?.Id ?? 0,
            PartyName = string.IsNullOrWhiteSpace(PartyNameText) ? "Cash" : PartyNameText.Trim(),
            Type = TypeCode,
            Date = Date,
            DueDate = DueDate,
            Subtotal = subtotal,
            Discount = disc,
            Tax = tax,
            RoundOff = rounded - total,
            Total = rounded,
            Received = IsPayment ? rounded : Math.Min(received, rounded),
            PaymentMode = PaymentMode,
            ChequeStatus = PaymentMode == "Cheque" ? "open" : "",
            Description = Description.Trim(),
            StateOfSupply = StateOfSupply.Trim()
        };

        var lines = Lines
            .Where(l => l.Amount > 0)
            .Select(l => new BizTxnItem
            {
                ItemId = l.SelectedItem?.Id ?? 0,
                ItemName = l.SelectedItem?.Name ?? "Item",
                HsnSac = l.SelectedItem?.HsnSac ?? "",
                Unit = l.SelectedItem?.Unit ?? "",
                Qty = l.QtyVal,
                Rate = l.RateVal,
                TaxRate = l.TaxVal,
                Amount = l.Amount
            }).ToList();

        await _billing.SaveTxnAsync(txn, lines);
        Status = $"✅ {txn.TypeLabel} {txn.RefLabel} saved.";

        // auto-share per SMS settings
        var settings = await _billing.GetAllSettingsAsync();
        if (settings.GetValueOrDefault("sms.send_to_party") == "1" &&
            settings.GetValueOrDefault($"sms.auto.{txn.Type}") == "1")
        {
            try
            {
                await Share.Default.RequestAsync(new ShareTextRequest
                { Text = _billing.BuildShareMessage(txn, settings), Title = "Send to party" });
            }
            catch { /* share not available */ }
        }

        if (print)
        {
            try
            {
                var party = txn.PartyId > 0 ? await _billing.GetPartyAsync(txn.PartyId) : null;
                var savedLines = await _billing.GetTxnLinesAsync(txn.Id);
                var bytes = InvoicePdfService.Build(txn, party, savedLines, settings);
                var name = $"{txn.TypeLabel.Replace(' ', '_')}_{txn.RefNo}.pdf";
                var dir = DeviceInfo.Platform == DevicePlatform.WinUI
                    ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads")
                    : FileSystem.CacheDirectory;
                var path = Path.Combine(dir, name);
                await File.WriteAllBytesAsync(path, bytes);
                if (DeviceInfo.Platform == DevicePlatform.WinUI)
                    await Launcher.Default.OpenAsync(new OpenFileRequest(name, new ReadOnlyFile(path)));
                else
                    await Share.Default.RequestAsync(new ShareFileRequest { Title = name, File = new ShareFile(path) });
            }
            catch (Exception ex) { Status = $"Saved, but PDF failed: {ex.Message}"; }
        }

        await Shell.Current.GoToAsync("..");
    }
}
