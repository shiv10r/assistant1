using LuxInfra.Models;

namespace LuxInfra.Services;

/// <summary>Business layer for the billing ledger (parties, items, transactions, cash, bank, settings).</summary>
public interface IBillingService
{
    Task<string> GetSettingAsync(string key);
    Task<bool> IsOnAsync(string key);
    Task SetSettingAsync(string key, string value);
    Task<Dictionary<string, string>> GetAllSettingsAsync();

    Task SavePartyAsync(Party p);
    Task<List<Party>> GetPartiesAsync();
    Task<Party?> GetPartyAsync(int id);

    Task SaveItemAsync(CatalogItem item);
    Task<List<CatalogItem>> GetItemsAsync();

    Task<int> NextRefNoAsync(string type);
    Task SaveTxnAsync(BizTxn txn, List<BizTxnItem> lines);
    Task<List<BizTxn>> GetTxnsAsync();
    Task<List<BizTxnItem>> GetTxnLinesAsync(int txnId);

    Task<(double youllGet, double youllGive, double monthSale)> GetKpisAsync();

    Task AdjustCashAsync(CashEntry entry);
    Task<List<CashEntry>> GetCashEntriesAsync();
    Task<double> GetCashBalanceAsync();
    Task<List<BizTxn>> GetChequesAsync();
    Task SetChequeStatusAsync(int txnId, string status);

    Task SaveBankAccountAsync(BankAccount account);
    Task<List<BankAccount>> GetBankAccountsAsync();
    Task DeleteBankAccountAsync(int id);

    Task<string> VerifyDataAsync();
    string BuildShareMessage(BizTxn txn, Dictionary<string, string> settings);
}
