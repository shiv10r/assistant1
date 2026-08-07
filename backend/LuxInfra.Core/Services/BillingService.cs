using LuxInfra.Models;
using SQLite;

namespace LuxInfra.Services;

public class BillingService
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public BillingService(DatabaseService db) => _db = db;

    // ---------- setup ----------

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

    private async Task<SQLiteAsyncConnection> Conn()
    {
        var conn = await _db.GetConnectionAsync();
        if (!_initialized)
        {
            await conn.CreateTableAsync<Party>();
            await conn.CreateTableAsync<CatalogItem>();
            await conn.CreateTableAsync<BizTxn>();
            await conn.CreateTableAsync<BizTxnItem>();
            await conn.CreateTableAsync<AppSetting>();
            await conn.CreateTableAsync<CashEntry>();
            await conn.CreateTableAsync<BankAccount>();

            // seed defaults only for keys that don't exist yet
            var existing = (await conn.Table<AppSetting>().ToListAsync()).Select(s => s.Key).ToHashSet();
            foreach (var (key, value) in Defaults)
                if (!existing.Contains(key))
                    await conn.InsertAsync(new AppSetting { Key = key, Value = value });

            _initialized = true;
        }
        return conn;
    }

    // ---------- settings ----------

    public async Task<string> GetSettingAsync(string key)
    {
        var conn = await Conn();
        var row = await conn.FindAsync<AppSetting>(key);
        return row?.Value ?? (Defaults.TryGetValue(key, out var d) ? d : "");
    }

    public async Task<bool> IsOnAsync(string key) => await GetSettingAsync(key) == "1";

    public async Task SetSettingAsync(string key, string value)
    {
        var conn = await Conn();
        await conn.InsertOrReplaceAsync(new AppSetting { Key = key, Value = value });
    }

    public async Task<Dictionary<string, string>> GetAllSettingsAsync()
    {
        var conn = await Conn();
        var rows = await conn.Table<AppSetting>().ToListAsync();
        var dict = new Dictionary<string, string>(Defaults);
        foreach (var r in rows) dict[r.Key] = r.Value;
        return dict;
    }

    // ---------- parties ----------

    public async Task SavePartyAsync(Party p)
    {
        var conn = await Conn();
        if (p.Id == 0)
        {
            p.CurrentBalance = p.BalanceType == "receive" ? p.OpeningBalance : -p.OpeningBalance;
            await conn.InsertAsync(p);
        }
        else
            await conn.UpdateAsync(p);
    }

    public async Task<List<Party>> GetPartiesAsync()
    {
        var conn = await Conn();
        return await conn.Table<Party>().OrderBy(p => p.Name).ToListAsync();
    }

    public async Task<Party?> GetPartyAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<Party>(id);
    }

    // ---------- items ----------

    public async Task SaveItemAsync(CatalogItem item)
    {
        var conn = await Conn();
        if (item.Id == 0) await conn.InsertAsync(item);
        else await conn.UpdateAsync(item);
    }

    public async Task<List<CatalogItem>> GetItemsAsync()
    {
        var conn = await Conn();
        return await conn.Table<CatalogItem>().OrderBy(i => i.Name).ToListAsync();
    }

    // ---------- transactions ----------

    public async Task<int> NextRefNoAsync(string type)
    {
        var conn = await Conn();
        var last = await conn.Table<BizTxn>().Where(t => t.Type == type)
            .OrderByDescending(t => t.RefNo).FirstOrDefaultAsync();
        return (last?.RefNo ?? 0) + 1;
    }

    public async Task SaveTxnAsync(BizTxn txn, List<BizTxnItem> lines)
    {
        var conn = await Conn();
        if (txn.RefNo == 0) txn.RefNo = await NextRefNoAsync(txn.Type);
        txn.Balance = txn.Total - txn.Received;
        await conn.InsertAsync(txn);

        foreach (var line in lines)
        {
            line.TxnId = txn.Id;
            await conn.InsertAsync(line);
        }

        // ledger effect on party balance
        if (TxnTypes.IsLedger(txn.Type) && txn.PartyId > 0)
        {
            var party = await conn.FindAsync<Party>(txn.PartyId);
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
                await conn.UpdateAsync(party);
            }
        }

        // stock effect
        if (await IsOnAsync("item.stock_maintenance") &&
            txn.Type is TxnTypes.Sale or TxnTypes.Purchase or TxnTypes.SaleReturn or TxnTypes.PurchaseReturn)
        {
            var sign = txn.Type is TxnTypes.Sale or TxnTypes.PurchaseReturn ? -1 : 1;
            foreach (var line in lines.Where(l => l.ItemId > 0))
            {
                var item = await conn.FindAsync<CatalogItem>(line.ItemId);
                if (item is not null && item.Type != "Service")
                {
                    item.StockQty += sign * (line.Qty + line.FreeQty);
                    await conn.UpdateAsync(item);
                }
            }
        }
    }

    public async Task<List<BizTxn>> GetTxnsAsync()
    {
        var conn = await Conn();
        return await conn.Table<BizTxn>().OrderByDescending(t => t.Id).ToListAsync();
    }

    public async Task<List<BizTxnItem>> GetTxnLinesAsync(int txnId)
    {
        var conn = await Conn();
        return await conn.Table<BizTxnItem>().Where(l => l.TxnId == txnId).ToListAsync();
    }

    // ---------- dashboard KPIs ----------

    public async Task<(double youllGet, double youllGive, double monthSale)> GetKpisAsync()
    {
        var conn = await Conn();
        var parties = await conn.Table<Party>().ToListAsync();
        var get = parties.Where(p => p.CurrentBalance > 0).Sum(p => p.CurrentBalance);
        var give = -parties.Where(p => p.CurrentBalance < 0).Sum(p => p.CurrentBalance);

        var start = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var txns = await conn.Table<BizTxn>()
            .Where(t => t.Type == TxnTypes.Sale && t.Date >= start).ToListAsync();
        return (get, give, txns.Sum(t => t.Total));
    }

    // ---------- cash & bank ----------

    public async Task AdjustCashAsync(CashEntry entry)
    {
        var conn = await Conn();
        await conn.InsertAsync(entry);
    }

    public async Task<List<CashEntry>> GetCashEntriesAsync()
    {
        var conn = await Conn();
        return await conn.Table<CashEntry>().OrderByDescending(e => e.Id).ToListAsync();
    }

    /// <summary>Cash In-Hand = cash received on ledger txns − cash paid out ± manual adjustments.</summary>
    public async Task<double> GetCashBalanceAsync()
    {
        var conn = await Conn();
        var txns = await conn.Table<BizTxn>().Where(t => t.PaymentMode == "Cash").ToListAsync();
        var inflow = txns.Where(t => t.Type is TxnTypes.Sale or TxnTypes.PaymentIn).Sum(t => t.Received);
        var outflow = txns.Where(t => t.Type is TxnTypes.Purchase or TxnTypes.PaymentOut).Sum(t => t.Received);
        var adjustments = await conn.Table<CashEntry>().ToListAsync();
        var adj = adjustments.Sum(a => a.Kind == "add" ? a.Amount : -a.Amount);
        return inflow - outflow + adj;
    }

    public async Task<List<BizTxn>> GetChequesAsync()
    {
        var conn = await Conn();
        return await conn.Table<BizTxn>().Where(t => t.PaymentMode == "Cheque")
            .OrderByDescending(t => t.Id).ToListAsync();
    }

    public async Task SetChequeStatusAsync(int txnId, string status)
    {
        var conn = await Conn();
        var txn = await conn.FindAsync<BizTxn>(txnId);
        if (txn is null) return;
        txn.ChequeStatus = status;
        await conn.UpdateAsync(txn);
    }

    public async Task SaveBankAccountAsync(BankAccount account)
    {
        var conn = await Conn();
        if (account.Id == 0) await conn.InsertAsync(account);
        else await conn.UpdateAsync(account);
    }

    public async Task<List<BankAccount>> GetBankAccountsAsync()
    {
        var conn = await Conn();
        return await conn.Table<BankAccount>().ToListAsync();
    }

    // ---------- utilities ----------

    /// <summary>Recomputes every party balance from opening + ledger txns and fixes drift.</summary>
    public async Task<string> VerifyDataAsync()
    {
        var conn = await Conn();
        var parties = await conn.Table<Party>().ToListAsync();
        var txns = await conn.Table<BizTxn>().ToListAsync();
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
                await conn.UpdateAsync(p);
                fixedCount++;
            }
        }

        var orphanLines = 0;
        var txnIds = txns.Select(t => t.Id).ToHashSet();
        foreach (var line in await conn.Table<BizTxnItem>().ToListAsync())
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
