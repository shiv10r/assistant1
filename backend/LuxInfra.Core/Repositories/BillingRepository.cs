using LuxInfra.Models;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Repositories;

public class BillingRepository : IBillingRepository
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public BillingRepository(DatabaseService db) => _db = db;

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
            foreach (var (key, value) in BillingService.Defaults)
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
        return row?.Value ?? (BillingService.Defaults.TryGetValue(key, out var d) ? d : "");
    }

    public async Task SetSettingAsync(string key, string value)
    {
        var conn = await Conn();
        await conn.InsertOrReplaceAsync(new AppSetting { Key = key, Value = value });
    }

    public async Task<Dictionary<string, string>> GetAllSettingsAsync()
    {
        var conn = await Conn();
        var rows = await conn.Table<AppSetting>().ToListAsync();
        var dict = new Dictionary<string, string>(BillingService.Defaults);
        foreach (var r in rows) dict[r.Key] = r.Value;
        return dict;
    }

    // ---------- parties ----------

    public async Task InsertPartyAsync(Party p)
    {
        var conn = await Conn();
        await conn.InsertAsync(p);
    }

    public async Task UpdatePartyAsync(Party p)
    {
        var conn = await Conn();
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

    public async Task InsertItemAsync(CatalogItem item)
    {
        var conn = await Conn();
        await conn.InsertAsync(item);
    }

    public async Task UpdateItemAsync(CatalogItem item)
    {
        var conn = await Conn();
        await conn.UpdateAsync(item);
    }

    public async Task DeleteItemAsync(int id)
    {
        var conn = await Conn();
        await conn.DeleteAsync<CatalogItem>(id);
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

    public async Task InsertTxnAsync(BizTxn txn)
    {
        var conn = await Conn();
        await conn.InsertAsync(txn);
    }

    public async Task InsertLineAsync(BizTxnItem line)
    {
        var conn = await Conn();
        await conn.InsertAsync(line);
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

    public async Task<List<BizTxnItem>> GetAllLinesAsync()
    {
        var conn = await Conn();
        return await conn.Table<BizTxnItem>().ToListAsync();
    }

    public async Task<CatalogItem?> GetItemAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<CatalogItem>(id);
    }

    public async Task<List<BizTxn>> GetMonthSalesAsync(DateTime start)
    {
        var conn = await Conn();
        return await conn.Table<BizTxn>()
            .Where(t => t.Type == TxnTypes.Sale && t.Date >= start).ToListAsync();
    }

    // ---------- cash & cheques ----------

    public async Task InsertCashEntryAsync(CashEntry entry)
    {
        var conn = await Conn();
        await conn.InsertAsync(entry);
    }

    public async Task<List<CashEntry>> GetCashEntriesAsync()
    {
        var conn = await Conn();
        return await conn.Table<CashEntry>().OrderByDescending(e => e.Id).ToListAsync();
    }

    public async Task<List<BizTxn>> GetCashTxnsAsync()
    {
        var conn = await Conn();
        return await conn.Table<BizTxn>().Where(t => t.PaymentMode == "Cash").ToListAsync();
    }

    public async Task<List<BizTxn>> GetChequesAsync()
    {
        var conn = await Conn();
        return await conn.Table<BizTxn>().Where(t => t.PaymentMode == "Cheque")
            .OrderByDescending(t => t.Id).ToListAsync();
    }

    public async Task<BizTxn?> GetTxnAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<BizTxn>(id);
    }

    public async Task UpdateTxnAsync(BizTxn txn)
    {
        var conn = await Conn();
        await conn.UpdateAsync(txn);
    }

    // ---------- banks ----------

    public async Task InsertBankAccountAsync(BankAccount account)
    {
        var conn = await Conn();
        await conn.InsertAsync(account);
    }

    public async Task UpdateBankAccountAsync(BankAccount account)
    {
        var conn = await Conn();
        await conn.UpdateAsync(account);
    }

    public async Task<List<BankAccount>> GetBankAccountsAsync()
    {
        var conn = await Conn();
        return await conn.Table<BankAccount>().ToListAsync();
    }

    public async Task DeleteBankAccountAsync(int id)
    {
        var conn = await Conn();
        await conn.DeleteAsync<BankAccount>(id);
    }
}
