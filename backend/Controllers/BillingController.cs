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

    [HttpGet("kpis")]
    public async Task<ActionResult> Kpis()
    {
        var (get, give, sale) = await _billing.GetKpisAsync();
        return Ok(new BillingKpisDto(get, give, sale));
    }

    [HttpGet("parties")]
    public async Task<List<Party>> Parties() => await _billing.GetPartiesAsync();

    [HttpGet("items")]
    public async Task<List<CatalogItem>> Items() => await _billing.GetItemsAsync();

    [HttpGet("txns")]
    public async Task<List<BizTxn>> Txns() => await _billing.GetTxnsAsync();

    [HttpGet("cash")]
    public async Task<ActionResult> Cash()
    {
        var balance = await _billing.GetCashBalanceAsync();
        return Ok(new { balance, entries = await _billing.GetCashEntriesAsync() });
    }

    [HttpGet("settings")]
    public async Task<ActionResult> Settings() => Ok(await _billing.GetAllSettingsAsync());
}