using LuxInfra.Models;
using LuxInfra.Repositories;

namespace LuxInfra.Services;

/// <summary>
/// Business layer for the billing ledger. Business rules (balances, reference numbering,
/// stock/ledger effects) live here; persistence is delegated to <see cref="IBillingRepository"/>.
/// </summary>
public class BillingService : IBillingService
{
    private readonly IBillingRepository _repo;

    public BillingService(IBillingRepository repo) => _repo = repo;

    /// <summary>Default settings mirroring the Vyapar spec (§3). Seeded once, then user-owned.</summary>
    public static readonly Dictionary<string, string> Defaults = new()
    {
        // general
        ["general.decimal_places"] = "2",
        ["general.date_format"] = "dd/MM/yyyy",
        ["general.amount_grouping"] = "indian",
        ["general.unsaved_warning"] = "1",
        ["general.firm_name"] = "LuxInfra",
        ["general.firm_state"] = "",
        // more transactions
        ["txn.enable.estimate"] = "1",
        ["txn.enable.proforma"] = "0",
        ["txn.enable.other_income"] = "0",
        ["txn.enable.orders"] = "1",
        ["txn.enable.fixed_assets"] = "0",
        ["txn.enable.delivery_challan"] = "1",
        ["txn.enable.challan_return"] = "1",
        // transaction header
        ["txn.invoice_number"] = "1",
        ["txn.cash_sale_default"] = "0",
        ["txn.billing_name"] = "0",
        ["txn.po_details"] = "0",
        ["txn.add_time"] = "0",
        // items table
        ["txn.tax_inclusive_toggle"] = "1",
        ["txn.display_purchase_price"] = "1",
        ["txn.last5_sale_price"] = "0",
        ["txn.free_item_qty"] = "0",
        ["txn.barcode_scan"] = "0",
        // taxes, discount & total
        ["txn.txn_wise_tax"] = "0",
        ["txn.txn_wise_discount"] = "0",
        ["txn.round_off"] = "0",
        // more features
        ["txn.invoice_preview"] = "1",
        ["txn.terms_enabled"] = "1",
        ["txn.terms_text"] = "Thanks for doing business with us!",
        ["txn.show_profit"] = "0",
        // gst
        ["gst.enabled"] = "1",
        ["gst.hsn"] = "1",
        ["gst.additional_cess"] = "0",
        ["gst.reverse_charge"] = "0",
        ["gst.state_of_supply"] = "1",
        ["gst.eway_bill"] = "0",
        ["gst.composite_scheme"] = "0",
        ["gst.tcs"] = "0",
        ["gst.tds"] = "0",
        // item settings
        ["item.enabled"] = "1",
        ["item.type"] = "Products and Services",
        ["item.stock_maintenance"] = "1",
        ["item.manufacturing"] = "0",
        ["item.units"] = "1",
        ["item.default_unit"] = "0",
        ["item.category"] = "1",
        ["item.party_wise_rate"] = "0",
        ["item.wholesale_price"] = "0",
        ["item.qty_decimal"] = "2",
        ["item.item_wise_tax"] = "1",
        ["item.mrp_tax"] = "0",
        ["item.item_wise_discount"] = "1",
        ["item.update_sale_price"] = "0",
        ["item.description"] = "0",
        // print v3 (themes & company header)
        ["print.regular.page_size"] = "A4",
        ["print.regular.orientation"] = "Portrait",
        ["print.regular.text_size"] = "Medium",
        ["print.header.company_name"] = "1",
        ["print.header.address"] = "1",
        ["print.header.email"] = "1",
        ["general.firm_address"] = "",
        ["general.firm_email"] = "",
        // print v2 (header & totals)
        ["general.firm_phone"] = "",
        ["general.firm_gstin"] = "",
        ["print.phone"] = "1",
        ["print.gstin_on_sale"] = "1",
        ["print.bill_of_supply_non_tax"] = "0",
        ["print.original_duplicate"] = "0",
        ["print.total_item_qty"] = "1",
        ["print.amount_decimal"] = "1",
        ["print.received_amount"] = "1",
        ["print.balance_amount"] = "1",
        // print
        ["print.party_balance"] = "0",
        ["print.tax_details"] = "1",
        ["print.amount_grouping"] = "1",
        ["print.amount_words"] = "1",
        ["print.you_saved"] = "1",
        ["print.description"] = "1",
        ["print.terms"] = "1",
        ["print.received_by"] = "1",
        ["print.delivered_by"] = "1",
        ["print.signature"] = "1",
        ["print.signature_text"] = "Authorized Signatory",
        ["print.payment_mode"] = "0",
        ["print.acknowledgement"] = "0",
        ["print.page_numbers"] = "1",
        // sms / auto-share
        ["sms.send_to_party"] = "1",
        ["sms.copy_to_self"] = "0",
        ["sms.txn_update"] = "0",
        ["sms.party_balance"] = "0",
        ["sms.web_invoice_link"] = "1",
        ["sms.template"] = "Dear {PartyName}, your {TxnType} {RefNo} of {Amount} has been recorded. Balance: {Balance}. — {FirmName}",
        ["sms.auto.SALE"] = "1",
        ["sms.auto.PURCHASE"] = "1",
        ["sms.auto.SALE_RETURN"] = "1",
        ["sms.auto.PURCHASE_RETURN"] = "1",
        ["sms.auto.ESTIMATE"] = "0",
        ["sms.auto.PROFORMA"] = "0",
        ["sms.auto.PAYMENT_IN"] = "1",
        ["sms.auto.PAYMENT_OUT"] = "1",
        ["sms.auto.SALE_ORDER"] = "1",
        ["sms.auto.PURCHASE_ORDER"] = "0",
        ["sms.auto.DELIVERY_CHALLAN"] = "0",
        ["sms.auto.CANCELLED"] = "1",
    };

    // ---------- settings ----------

    public Task<string> GetSettingAsync(string key) => _repo.GetSettingAsync(key);

    public async Task<bool> IsOnAsync(string key) => await GetSettingAsync(key) == "1";

    public Task SetSettingAsync(string key, string value) => _repo.SetSettingAsync(key, value);

    public Task<Dictionary<string, string>> GetAllSettingsAsync() => _repo.GetAllSettingsAsync();

    // ---------- parties ----------

    public async Task SavePartyAsync(Party p)
    {
        if (p.Id == 0)
        {
            p.CurrentBalance = p.BalanceType == "receive" ? p.OpeningBalance : -p.OpeningBalance;
            await _repo.InsertPartyAsync(p);
        }
        else await _repo.UpdatePartyAsync(p);
    }

    public Task<List<Party>> GetPartiesAsync() => _repo.GetPartiesAsync();

    public Task<Party?> GetPartyAsync(int id) => _repo.GetPartyAsync(id);

    // ---------- items ----------

    public Task SaveItemAsync(CatalogItem item)
    {
        if (item.Id != 0 && string.IsNullOrWhiteSpace(item.Name))
            return _repo.DeleteItemAsync(item.Id);
        return item.Id == 0 ? _repo.InsertItemAsync(item) : _repo.UpdateItemAsync(item);
    }

    public Task<List<CatalogItem>> GetItemsAsync() => _repo.GetItemsAsync();

    // ---------- transactions ----------

    public Task<int> NextRefNoAsync(string type) => _repo.NextRefNoAsync(type);

    public async Task SaveTxnAsync(BizTxn txn, List<BizTxnItem> lines)
    {
        if (txn.RefNo == 0) txn.RefNo = await NextRefNoAsync(txn.Type);
        txn.Balance = txn.Total - txn.Received;
        await _repo.InsertTxnAsync(txn);

        foreach (var line in lines)
        {
            line.TxnId = txn.Id;
            await _repo.InsertLineAsync(line);
        }

        // ledger effect on party balance
        if (TxnTypes.IsLedger(txn.Type) && txn.PartyId > 0)
        {
            var party = await _repo.GetPartyAsync(txn.PartyId);
            if (party is not null)
            {
                party.CurrentBalance += txn.Type switch
                {
                    TxnTypes.Sale => txn.Balance,               // they owe you the unpaid part
                    TxnTypes.SaleReturn => -txn.Balance,
                    TxnTypes.Purchase => -txn.Balance,          // you owe them
                    TxnTypes.PurchaseReturn => txn.Balance,
                    TxnTypes.PaymentIn => -txn.Total,           // they paid you back
                    TxnTypes.PaymentOut => txn.Total,
                    _ => 0
                };
                await _repo.UpdatePartyAsync(party);
            }
        }

        // stock effect
        if (await IsOnAsync("item.stock_maintenance") &&
            txn.Type is TxnTypes.Sale or TxnTypes.Purchase or TxnTypes.SaleReturn or TxnTypes.PurchaseReturn)
        {
            var sign = txn.Type is TxnTypes.Sale or TxnTypes.PurchaseReturn ? -1 : 1;
            foreach (var line in lines.Where(l => l.ItemId > 0))
            {
                var item = await _repo.GetItemAsync(line.ItemId);
                if (item is not null && item.Type != "Service")
                {
                    item.StockQty += sign * (line.Qty + line.FreeQty);
                    await _repo.UpdateItemAsync(item);
                }
            }
        }
    }
    public Task<List<BizTxn>> GetTxnsAsync() => 
_repo.GetTxnsAsync();

    public Task<BizTxn?> GetTxnAsync(int id) => _repo.GetTxnAsync(id);

    public Task<List<BizTxnItem>> GetTxnLinesAsync(int txnId) 
=> _repo.GetTxnLinesAsync(txnId);
    // ---------- dashboard KPIs ----------

    public async Task<(double youllGet, double youllGive, double monthSale)> GetKpisAsync()
    {
        var parties = await _repo.GetPartiesAsync();
        var get = parties.Where(p => p.CurrentBalance > 0).Sum(p => p.CurrentBalance);
        var give = -parties.Where(p => p.CurrentBalance < 0).Sum(p => p.CurrentBalance);

        var start = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var monthTxns = await _repo.GetMonthSalesAsync(start);
        return (get, give, monthTxns.Sum(t => t.Total));
    }

    // ---------- cash & bank ----------

    public Task AdjustCashAsync(CashEntry entry) => _repo.InsertCashEntryAsync(entry);

    public Task<List<CashEntry>> GetCashEntriesAsync() => _repo.GetCashEntriesAsync();

    /// <summary>Cash In-Hand = cash received on ledger txns − cash paid out ± manual adjustments.</summary>
    public async Task<double> GetCashBalanceAsync()
    {
        var txns = await _repo.GetCashTxnsAsync();
        var inflow = txns.Where(t => t.Type is TxnTypes.Sale or TxnTypes.PaymentIn).Sum(t => t.Received);
        var outflow = txns.Where(t => t.Type is TxnTypes.Purchase or TxnTypes.PaymentOut).Sum(t => t.Received);
        var adjustments = await _repo.GetCashEntriesAsync();
        var adj = adjustments.Sum(a => a.Kind == "add" ? a.Amount : -a.Amount);
        return inflow - outflow + adj;
    }

    public Task<List<BizTxn>> GetChequesAsync() => _repo.GetChequesAsync();

    public async Task SetChequeStatusAsync(int txnId, string status)
    {
        var txn = await _repo.GetTxnAsync(txnId);
        if (txn is null) return;
        txn.ChequeStatus = status;
        await _repo.UpdateTxnAsync(txn);
    }

    public Task SaveBankAccountAsync(BankAccount account)
        => account.Id == 0 ? _repo.InsertBankAccountAsync(account) : _repo.UpdateBankAccountAsync(account);

    public Task<List<BankAccount>> GetBankAccountsAsync() => _repo.GetBankAccountsAsync();

    public Task DeleteBankAccountAsync(int id) => _repo.DeleteBankAccountAsync(id);

    // ---------- utilities ----------

    /// <summary>Recomputes every party balance from opening + ledger txns and fixes drift.</summary>
    public async Task<string> VerifyDataAsync()
    {
        var parties = await _repo.GetPartiesAsync();
        var txns = await _repo.GetTxnsAsync();
        var fixedCount = 0;

        foreach (var p in parties)
        {
            var expected = p.BalanceType == "receive" ? p.OpeningBalance : -p.OpeningBalance;
            foreach (var t in txns.Where(t => t.PartyId == p.Id && TxnTypes.IsLedger(t.Type)))
            {
                expected += t.Type switch
                {
                    TxnTypes.Sale => t.Balance,
                    TxnTypes.SaleReturn => -t.Balance,
                    TxnTypes.Purchase => -t.Balance,
                    TxnTypes.PurchaseReturn => t.Balance,
                    TxnTypes.PaymentIn => -t.Total,
                    TxnTypes.PaymentOut => t.Total,
                    _ => 0
                };
            }
            if (Math.Abs(expected - p.CurrentBalance) > 0.005)
            {
                p.CurrentBalance = expected;
                await _repo.UpdatePartyAsync(p);
                fixedCount++;
            }
        }

        var orphanLines = 0;
        var txnIds = txns.Select(t => t.Id).ToHashSet();
        foreach (var line in await _repo.GetAllLinesAsync())
            if (!txnIds.Contains(line.TxnId)) orphanLines++;

        return $"Checked {parties.Count} parties and {txns.Count} transactions. " +
               $"{(fixedCount == 0 ? "All balances correct ✅" : $"Fixed {fixedCount} balance(s) 🔧")}" +
               (orphanLines > 0 ? $" · {orphanLines} orphan line(s) found." : "");
    }

    public string BuildShareMessage(BizTxn txn, Dictionary<string, string> settings) =>
        (settings.GetValueOrDefault("sms.template") ?? Defaults["sms.template"])
            .Replace("{PartyName}", string.IsNullOrEmpty(txn.PartyName) ? "Customer" : txn.PartyName)
            .Replace("{TxnType}", txn.TypeLabel)
            .Replace("{RefNo}", txn.RefLabel)
            .Replace("{Amount}", txn.TotalLabel)
            .Replace("{Balance}", txn.BalanceLabel)
            .Replace("{FirmName}", settings.GetValueOrDefault("general.firm_name", "LuxInfra"));
}
