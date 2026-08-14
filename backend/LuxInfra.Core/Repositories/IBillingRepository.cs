using LuxInfra.Models;

namespace LuxInfra.Repositories;

/// <summary>Raw data access for the billing ledger (settings, parties, items, txns, cash, bank).</summary>
public interface IBillingRepository
{
    Task<string> GetSettingAsync(string key);
    Task SetSettingAsync(string key, string value);
    Task<Dictionary<string, string>> GetAllSettingsAsync();

    Task InsertPartyAsync(Party p);
    Task UpdatePartyAsync(Party p);
    Task DeletePartyAsync(int id);
    Task<List<Party>> GetPartiesAsync();
    Task<Party?> GetPartyAsync(int id);
    Task<int> CountTxnsForPartyAsync(int partyId);

    Task InsertItemAsync(CatalogItem item);
    Task UpdateItemAsync(CatalogItem item);
    Task DeleteItemAsync(int id);
    Task<List<CatalogItem>> GetItemsAsync();

    Task<int> NextRefNoAsync(string type);
    Task InsertTxnAsync(BizTxn txn);
    Task InsertLineAsync(BizTxnItem line);
    Task DeleteTxnAsync(int id);
    Task<List<BizTxn>> GetTxnsAsync();
    Task<List<BizTxnItem>> GetTxnLinesAsync(int txnId);
    Task<List<BizTxnItem>> GetAllLinesAsync();
    Task<CatalogItem?> GetItemAsync(int id);
    Task<List<BizTxn>> GetMonthSalesAsync(DateTime start);

    Task InsertCashEntryAsync(CashEntry entry);
    Task<List<CashEntry>> GetCashEntriesAsync();
    Task<List<BizTxn>> GetCashTxnsAsync();
    Task<List<BizTxn>> GetChequesAsync();
    Task<BizTxn?> GetTxnAsync(int id);
    Task UpdateTxnAsync(BizTxn txn);

    Task InsertBankAccountAsync(BankAccount account);
    Task UpdateBankAccountAsync(BankAccount account);
    Task<List<BankAccount>> GetBankAccountsAsync();
    Task DeleteBankAccountAsync(int id);
}
