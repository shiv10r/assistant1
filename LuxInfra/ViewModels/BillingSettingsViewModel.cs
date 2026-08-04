using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.ViewModels;

public partial class SettingRow : ObservableObject
{
    private readonly BillingService _billing;
    private bool _loading = true;

    public string Key { get; }
    public string Label { get; }
    public string Info { get; }
    public bool IsPremium { get; }

    [ObservableProperty] private bool value;

    public SettingRow(BillingService billing, string key, string label, string info, bool premium, bool initial)
    {
        _billing = billing;
        Key = key;
        Label = label;
        Info = info;
        IsPremium = premium;
        value = initial;
        _loading = false;
    }

    partial void OnValueChanged(bool newValue)
    {
        if (_loading) return;

        if (IsPremium && newValue && !ProfileService.Instance.IsGold)
        {
            // revert & paywall
            _loading = true;
            Value = false;
            _loading = false;
            _ = ShowPaywallAsync();
            return;
        }

        _ = _billing.SetSettingAsync(Key, newValue ? "1" : "0");
    }

    [RelayCommand]
    private async Task ShowInfo()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        if (page is not null)
            await page.DisplayAlert(Label, Info, "Got it");
    }

    private async Task ShowPaywallAsync()
    {
        var page = Application.Current?.Windows.FirstOrDefault()?.Page;
        if (page is null) return;
        var view = await page.DisplayAlert("👑 Upgrade your Plan",
            $"\"{Label}\" is a Premium feature. Please upgrade your plan to get this feature.",
            "Get LuxInfra Premium", "Not now");
        if (view)
            await Shell.Current.GoToAsync("//PlansPage");
    }
}

public class SettingSection
{
    public string Title { get; set; } = "";
    public ObservableCollection<SettingRow> Rows { get; } = new();
}

public partial class BillingSettingsViewModel : ObservableObject
{
    private readonly BillingService _billing;
    private readonly DatabaseService _db;
    private List<SettingSection> _allSections = new();

    public ObservableCollection<SettingSection> Sections { get; } = new();

    [ObservableProperty] private string searchText = "";
    [ObservableProperty] private string firmName = "";
    [ObservableProperty] private string firmState = "";
    [ObservableProperty] private string firmPhone = "";
    [ObservableProperty] private string firmGstin = "";
    [ObservableProperty] private string firmAddress = "";
    [ObservableProperty] private string firmEmail = "";
    [ObservableProperty] private string pageSize = "A4";
    [ObservableProperty] private string orientation = "Portrait";
    [ObservableProperty] private string textSize = "Medium";

    public List<string> PageSizeOptions { get; } = new() { "A4", "A5" };
    public List<string> OrientationOptions { get; } = new() { "Portrait", "Landscape" };
    public List<string> TextSizeOptions { get; } = new() { "Small", "Medium", "Large" };
    [ObservableProperty] private string termsText = "";
    [ObservableProperty] private string signatureText = "";
    [ObservableProperty] private string smsTemplate = "";
    [ObservableProperty] private string status = "";

    public BillingSettingsViewModel(BillingService billing, DatabaseService db)
    {
        _billing = billing;
        _db = db;
    }

    // (section, key, label, info, premium)
    private static readonly (string Section, string Key, string Label, string Info, bool Premium)[] Config =
    {
        ("More Transactions", "txn.enable.estimate", "Estimate/Quotation", "Create quotations that can later convert to invoices.", false),
        ("More Transactions", "txn.enable.proforma", "Proforma Invoice", "Issue proforma invoices before the final tax invoice.", false),
        ("More Transactions", "txn.enable.other_income", "Other Income", "Record income that is not from sales.", false),
        ("More Transactions", "txn.enable.orders", "Sale/Purchase Order", "Track orders before billing.", false),
        ("More Transactions", "txn.enable.fixed_assets", "Fixed Assets (FA)", "Track purchase/sale of business assets.", false),
        ("More Transactions", "txn.enable.delivery_challan", "Delivery Challan", "Create delivery challans for goods movement.", false),
        ("More Transactions", "txn.enable.challan_return", "Goods Return on Delivery Challan", "Allow returns against challans.", false),

        ("Transaction Header", "txn.invoice_number", "Invoice/Bill Number", "Shows an auto-incrementing number on each transaction.", false),
        ("Transaction Header", "txn.cash_sale_default", "Cash Sale by default", "New sales start as cash sales without party selection.", false),
        ("Transaction Header", "txn.billing_name", "Billing name of Parties", "Add an alternate billing name for parties.", false),
        ("Transaction Header", "txn.po_details", "PO Details (of customer)", "Capture customer PO number and date on invoices.", false),
        ("Transaction Header", "txn.add_time", "Add Time On Transactions", "Store the time along with the date.", false),

        ("Items Table", "txn.tax_inclusive_toggle", "Allow Inclusive/Exclusive tax on Rate", "Choose whether item rate includes tax.", false),
        ("Items Table", "txn.display_purchase_price", "Display Purchase Price", "Show purchase price while selecting items.", false),
        ("Items Table", "txn.last5_sale_price", "Show Last 5 Sale Price of Items", "See recent prices charged to the same party.", false),
        ("Items Table", "txn.free_item_qty", "Free Item quantity", "Add free quantity column on invoices.", false),
        ("Items Table", "txn.barcode_scan", "Barcode scanning for items", "Add items by scanning barcodes.", false),

        ("Taxes, Discount & Total", "txn.txn_wise_tax", "Transaction wise Tax", "Apply one tax rate on the whole transaction.", false),
        ("Taxes, Discount & Total", "txn.txn_wise_discount", "Transaction wise Discount", "Apply a discount on the transaction total.", false),
        ("Taxes, Discount & Total", "txn.round_off", "Round Off Transaction amount", "Round the grand total to the nearest rupee.", false),

        ("More Transaction Features", "txn.invoice_preview", "Enable Invoice Preview", "Preview the invoice before saving.", false),
        ("More Transaction Features", "txn.terms_enabled", "Terms & Conditions", "Print T&C on invoices.", false),
        ("More Transaction Features", "txn.show_profit", "Show Profit while making Sale Invoice", "See live profit while billing.", true),

        ("GST", "gst.enabled", "GST", "Enable GST fields and tax breakup.", false),
        ("GST", "gst.hsn", "HSN/SAC Code", "Capture HSN/SAC codes on items.", false),
        ("GST", "gst.additional_cess", "Additional CESS", "Levy additional cess on items.", false),
        ("GST", "gst.reverse_charge", "Reverse Charge", "Mark transactions under reverse charge.", false),
        ("GST", "gst.state_of_supply", "State of Supply", "Drives CGST+SGST vs IGST split.", false),
        ("GST", "gst.eway_bill", "E-Way Bill No.", "Record e-way bill numbers.", false),
        ("GST", "gst.composite_scheme", "Composite Scheme", "For composition-scheme businesses.", false),
        ("GST", "gst.tcs", "Enable TCS", "Tax collected at source on invoices.", true),
        ("GST", "gst.tds", "Enable TDS", "Tax deducted at source on payments.", true),

        ("Item Settings", "item.stock_maintenance", "Stock maintenance", "Track stock quantity on every sale/purchase.", false),
        ("Item Settings", "item.manufacturing", "Manufacturing", "Track raw materials consumed in manufacturing.", true),
        ("Item Settings", "item.units", "Item Units", "Measure items in units (Pcs, Kg...).", false),
        ("Item Settings", "item.category", "Item Category", "Group items into categories.", false),
        ("Item Settings", "item.party_wise_rate", "Party wise item rate", "Remember different rates per party.", true),
        ("Item Settings", "item.wholesale_price", "Wholesale Price", "Maintain a separate wholesale price.", true),
        ("Item Settings", "item.item_wise_tax", "Item wise tax", "Different GST rate per item.", false),
        ("Item Settings", "item.item_wise_discount", "Item wise discount", "Discount column per line item.", false),

        ("Invoice Print — Header", "print.header.company_name", "Print Company Name", "Show the firm name at the top of invoices.", false),
        ("Invoice Print — Header", "print.header.address", "Address", "Print the firm address in the header.", false),
        ("Invoice Print — Header", "print.header.email", "Email", "Print the firm email in the header.", false),
        ("Invoice Print — Header", "print.phone", "Phone number", "Print your firm's phone in the header.", false),
        ("Invoice Print — Header", "print.gstin_on_sale", "GSTIN on Sale", "Print your firm GSTIN on sale invoices.", false),
        ("Invoice Print — Header", "print.bill_of_supply_non_tax", "Print Bill of Supply for non tax invoices", "Zero-tax sales print as 'Bill of Supply'.", false),
        ("Invoice Print — Header", "print.original_duplicate", "Print Original/Duplicate", "Adds 'Original for Recipient' tag.", false),

        ("Invoice Print — Totals", "print.total_item_qty", "Total Item Quantity", "Print total quantity across items.", false),
        ("Invoice Print — Totals", "print.amount_decimal", "Amount with Decimal (eg 0.00)", "Show paise on printed amounts.", false),
        ("Invoice Print — Totals", "print.received_amount", "Received amount", "Print the amount received.", false),
        ("Invoice Print — Totals", "print.balance_amount", "Balance amount", "Print the outstanding balance.", false),

        ("Invoice Print", "print.party_balance", "Print Current Balance of Party", "Show party's outstanding balance on invoices.", false),
        ("Invoice Print", "print.tax_details", "Tax details", "Print the GST breakup table.", false),
        ("Invoice Print", "print.amount_words", "Amount in words", "Print total in words (Indian format).", false),
        ("Invoice Print", "print.you_saved", "You Saved", "Show the discount amount saved.", false),
        ("Invoice Print", "print.description", "Print description", "Print the transaction description.", false),
        ("Invoice Print", "print.terms", "Terms & Conditions", "Print T&C in the footer.", false),
        ("Invoice Print", "print.received_by", "Print Received by details", "Signature line for the receiver.", false),
        ("Invoice Print", "print.delivered_by", "Print Delivered by details", "Signature line for delivery person.", false),
        ("Invoice Print", "print.signature", "Print Signature Text", "Authorized signatory block.", false),
        ("Invoice Print", "print.payment_mode", "Payment mode", "Print how payment was made.", false),
        ("Invoice Print", "print.acknowledgement", "Print Acknowledgement", "Tear-off acknowledgement slip.", false),
        ("Invoice Print", "print.page_numbers", "Print Page Numbers", "Page X of Y in the footer.", false),

        ("Transaction Messages", "sms.send_to_party", "Send to party", "Offer to send a message when a transaction is saved.", false),
        ("Transaction Messages", "sms.copy_to_self", "Send SMS Copy to Self", "Also send yourself a copy.", true),
        ("Transaction Messages", "sms.party_balance", "Show Party's Current Balance", "Include balance in messages.", false),
        ("Transaction Messages", "sms.web_invoice_link", "Show web invoice link", "Append a link to the invoice.", false),
        ("Auto-message on", "sms.auto.SALE", "Sale", "Auto-share when a sale is saved.", false),
        ("Auto-message on", "sms.auto.PURCHASE", "Purchase", "Auto-share when a purchase is saved.", false),
        ("Auto-message on", "sms.auto.ESTIMATE", "Estimate", "Auto-share estimates.", false),
        ("Auto-message on", "sms.auto.PAYMENT_IN", "Payment-In", "Auto-share payment receipts.", false),
        ("Auto-message on", "sms.auto.PAYMENT_OUT", "Payment-Out", "Auto-share payment vouchers.", false),
        ("Auto-message on", "sms.auto.SALE_ORDER", "Sale Order", "Auto-share sale orders.", false),
        ("Auto-message on", "sms.auto.PURCHASE_ORDER", "Purchase Order", "Auto-share purchase orders.", false),
        ("Auto-message on", "sms.auto.DELIVERY_CHALLAN", "Delivery Challan", "Auto-share challans.", false),
    };

    public async Task LoadAsync()
    {
        var all = await _billing.GetAllSettingsAsync();

        FirmName = all.GetValueOrDefault("general.firm_name", "LuxInfra");
        FirmState = all.GetValueOrDefault("general.firm_state", "");
        FirmPhone = all.GetValueOrDefault("general.firm_phone", "");
        FirmGstin = all.GetValueOrDefault("general.firm_gstin", "");
        FirmAddress = all.GetValueOrDefault("general.firm_address", "");
        FirmEmail = all.GetValueOrDefault("general.firm_email", "");
        PageSize = all.GetValueOrDefault("print.regular.page_size", "A4");
        Orientation = all.GetValueOrDefault("print.regular.orientation", "Portrait");
        TextSize = all.GetValueOrDefault("print.regular.text_size", "Medium");
        TermsText = all.GetValueOrDefault("txn.terms_text", "");
        SignatureText = all.GetValueOrDefault("print.signature_text", "");
        SmsTemplate = all.GetValueOrDefault("sms.template", "");

        _allSections = Config
            .GroupBy(c => c.Section)
            .Select(g =>
            {
                var section = new SettingSection { Title = g.Key };
                foreach (var (_, key, label, info, premium) in g)
                    section.Rows.Add(new SettingRow(_billing, key, label, info, premium,
                        all.GetValueOrDefault(key) == "1"));
                return section;
            })
            .ToList();

        ApplyFilter();
    }

    partial void OnSearchTextChanged(string value) => ApplyFilter();

    private void ApplyFilter()
    {
        Sections.Clear();
        var q = SearchText?.Trim() ?? "";
        foreach (var section in _allSections)
        {
            if (q.Length == 0)
            {
                Sections.Add(section);
                continue;
            }
            var matches = section.Rows.Where(r => r.Label.Contains(q, StringComparison.OrdinalIgnoreCase)).ToList();
            if (matches.Count > 0)
            {
                var filtered = new SettingSection { Title = section.Title };
                foreach (var m in matches) filtered.Rows.Add(m);
                Sections.Add(filtered);
            }
        }
    }

    [RelayCommand]
    private async Task SaveTexts()
    {
        await _billing.SetSettingAsync("general.firm_name", FirmName.Trim());
        await _billing.SetSettingAsync("general.firm_state", FirmState.Trim());
        await _billing.SetSettingAsync("general.firm_phone", FirmPhone.Trim());
        await _billing.SetSettingAsync("general.firm_gstin", FirmGstin.Trim());
        await _billing.SetSettingAsync("general.firm_address", FirmAddress.Trim());
        await _billing.SetSettingAsync("general.firm_email", FirmEmail.Trim());
        await _billing.SetSettingAsync("print.regular.page_size", PageSize);
        await _billing.SetSettingAsync("print.regular.orientation", Orientation);
        await _billing.SetSettingAsync("print.regular.text_size", TextSize);
        await _billing.SetSettingAsync("txn.terms_text", TermsText.Trim());
        await _billing.SetSettingAsync("print.signature_text", SignatureText.Trim());
        await _billing.SetSettingAsync("sms.template", SmsTemplate.Trim());
        Status = "✅ Saved firm details, T&C, signature and message template.";
    }

    // ---------- utilities ----------

    [RelayCommand]
    private async Task VerifyData()
    {
        Status = "🔍 Verifying data...";
        Status = "🔍 " + await _billing.VerifyDataAsync();
    }

    [RelayCommand]
    private async Task ExportItems()
    {
        try
        {
            var items = await _billing.GetItemsAsync();
            if (items.Count == 0) { Status = "📭 No items to export."; return; }
            var bytes = ExportService.ExportItemsExcel(items);
            var name = $"LuxInfra_Items_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
            var dir = DeviceInfo.Platform == DevicePlatform.WinUI
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads")
                : FileSystem.CacheDirectory;
            var path = Path.Combine(dir, name);
            await File.WriteAllBytesAsync(path, bytes);
            if (DeviceInfo.Platform == DevicePlatform.WinUI)
                await Launcher.Default.OpenAsync(new OpenFileRequest(name, new ReadOnlyFile(path)));
            else
                await Share.Default.RequestAsync(new ShareFileRequest { Title = name, File = new ShareFile(path) });
            Status = $"✅ Exported {items.Count} items: {name}";
        }
        catch (Exception ex) { Status = $"⚠️ Export failed: {ex.Message}"; }
    }

    [RelayCommand]
    private async Task ImportItems()
    {
        try
        {
            var result = await FilePicker.Default.PickAsync(new PickOptions { PickerTitle = "Pick items .xlsx (same columns as export)" });
            if (result is null) return;
            await using var stream = await result.OpenReadAsync();
            var items = ExportService.ImportItemsExcel(stream);
            foreach (var item in items)
                await _billing.SaveItemAsync(item);
            Status = $"✅ Imported {items.Count} items.";
        }
        catch (Exception ex) { Status = $"⚠️ Import failed: {ex.Message}"; }
    }

    // ---------- backup / restore ----------

    [RelayCommand]
    private async Task BackupToFile()
    {
        try
        {
            var name = $"LuxInfra_Backup_{DateTime.Now:yyyyMMdd_HHmm}.db3";
            var dir = DeviceInfo.Platform == DevicePlatform.WinUI
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads")
                : FileSystem.CacheDirectory;
            var dest = Path.Combine(dir, name);
            File.Copy(_db.DbPath, dest, overwrite: true);

            if (DeviceInfo.Platform != DevicePlatform.WinUI)
                await Share.Default.RequestAsync(new ShareFileRequest { Title = name, File = new ShareFile(dest) });
            Status = $"✅ Backup saved: {name}";
        }
        catch (Exception ex) { Status = $"⚠️ Backup failed: {ex.Message}"; }
    }

    [RelayCommand]
    private async Task BackupToEmail()
    {
        try
        {
            var temp = Path.Combine(FileSystem.CacheDirectory, $"LuxInfra_Backup_{DateTime.Now:yyyyMMdd}.db3");
            File.Copy(_db.DbPath, temp, overwrite: true);
            var message = new EmailMessage
            {
                Subject = $"LuxInfra backup {DateTime.Now:dd MMM yyyy}",
                Body = "Your LuxInfra data backup is attached.",
                To = { EmailService.Recipient }
            };
            message.Attachments = new List<EmailAttachment> { new(temp) };
            await Email.Default.ComposeAsync(message);
        }
        catch { Status = "⚠️ No mail app available for email backup."; }
    }

    [RelayCommand]
    private async Task RestoreBackup()
    {
        try
        {
            var result = await FilePicker.Default.PickAsync(new PickOptions { PickerTitle = "Pick a LuxInfra backup (.db3)" });
            if (result is null) return;

            var page = Application.Current?.Windows.FirstOrDefault()?.Page;
            var confirm = page is null || await page.DisplayAlert("Restore backup",
                "This replaces ALL current data with the backup. Continue?", "Restore", "Cancel");
            if (!confirm) return;

            SQLiteAsyncConnection.ResetPool();
            File.Copy(result.FullPath, _db.DbPath, overwrite: true);
            Status = "✅ Backup restored — please close and reopen the app.";
        }
        catch (Exception ex) { Status = $"⚠️ Restore failed: {ex.Message}"; }
    }
}
