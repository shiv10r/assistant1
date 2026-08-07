using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/billing")]
public class BillingController : ControllerBase
{
    private readonly BillingService _billing;

    public BillingController(BillingService billing) => _billing = billing;

    // ---- KPIs ----
    [HttpGet("kpis")]
    public async Task<ActionResult> Kpis()
    {
        var (get, give, sale) = await _billing.GetKpisAsync();
        return Ok(new BillingKpisDto(get, give, sale));
    }

    // ---- Parties ----
    [HttpGet("parties")]
    public async Task<List<Party>> Parties() => await _billing.GetPartiesAsync();

    [HttpGet("parties/{id:int}")]
    public async Task<ActionResult> Party(int id)
    {
        var p = await _billing.GetPartyAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost("parties")]
    public async Task<ActionResult> SaveParty([FromBody] Party p)
    {
        await _billing.SavePartyAsync(p);
        return Ok(p);
    }

    // ---- Catalog items ----
    [HttpGet("items")]
    public async Task<List<CatalogItem>> Items() => await _billing.GetItemsAsync();

    [HttpPost("items")]
    public async Task<ActionResult> SaveItem([FromBody] CatalogItem item)
    {
        await _billing.SaveItemAsync(item);
        return Ok(item);
    }

    // ---- Transactions (bills / invoices / payments) ----
    [HttpGet("txns")]
    public async Task<List<BizTxn>> Txns() => await _billing.GetTxnsAsync();

    [HttpGet("txns/{id:int}/lines")]
    public async Task<List<BizTxnItem>> Lines(int id) => await _billing.GetTxnLinesAsync(id);

    [HttpGet("next-ref/{type}")]
    public async Task<ActionResult> NextRef(string type) => Ok(await _billing.NextRefNoAsync(type));

    [HttpPost("txns")]
    public async Task<ActionResult> SaveTxn([FromBody] TxnDto dto)
    {
        var saved = dto.Txn;
        if (saved.RefNo == 0) saved.RefNo = await _billing.NextRefNoAsync(saved.Type);
        await _billing.SaveTxnAsync(saved, dto.Lines ?? new List<BizTxnItem>());
        return Ok(saved);
    }

    // ---- Cash & bank ----
    [HttpGet("cash")]
    public async Task<ActionResult> Cash()
    {
        var balance = await _billing.GetCashBalanceAsync();
        return Ok(new { balance, entries = await _billing.GetCashEntriesAsync() });
    }

    [HttpPost("cash")]
    public async Task<ActionResult> AdjustCash([FromBody] CashEntry entry)
    {
        await _billing.AdjustCashAsync(entry);
        return Ok(entry);
    }

    [HttpGet("banks")]
    public async Task<List<BankAccount>> Banks() => await _billing.GetBankAccountsAsync();

    [HttpPost("banks")]
    public async Task<ActionResult> SaveBank([FromBody] BankAccount account)
    {
        await _billing.SaveBankAccountAsync(account);
        return Ok(account);
    }

    // ---- Cheques ----
    [HttpGet("cheques")]
    public async Task<List<BizTxn>> Cheques() => await _billing.GetChequesAsync();

    [HttpPost("cheques/{id:int}/cleared")]
    public async Task<ActionResult> ClearCheque(int id)
    {
        await _billing.SetChequeStatusAsync(id, "cleared");
        return Ok();
    }

    // ---- Settings ----
    [HttpGet("settings")]
    public async Task<ActionResult> Settings() => Ok(await _billing.GetAllSettingsAsync());

    [HttpGet("settings/{key}")]
    public async Task<ActionResult> Setting(string key) => Ok(new { value = await _billing.GetSettingAsync(key) });

    [HttpPost("settings")]
    public async Task<ActionResult> SetSetting([FromBody] AppSetting setting)
    {
        await _billing.SetSettingAsync(setting.Key, setting.Value);
        return Ok();
    }

    public record TxnDto(BizTxn Txn, List<BizTxnItem>? Lines);
}