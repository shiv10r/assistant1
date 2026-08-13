using LuxInfra.Models;

namespace LuxInfra.Api.Services;

/// <summary>
/// Builds the standard GST e-invoice JSON payload (GSTN IRP schema v1.03) for a Sale transaction.
/// The payload can be saved locally or posted to a GSP/IRP once the firm crosses the e-invoicing
/// threshold. Includes the mandatory blocks: TranDtls, SellerDtls, BuyerDtls, ItemList, ValDtls.
/// </summary>
public static class GstEInvoiceService
{
    public static (bool Ok, object? Json, string? Error) Build(BizTxn txn, Party? party, List<BizTxnItem> lines, Dictionary<string, string> s)
    {
        if (txn.Type != TxnTypes.Sale && txn.Type != TxnTypes.SaleReturn)
            return (false, null, "E-invoice applies to Sale / Sale Return only.");

        var seller = new Dictionary<string, object?>
        {
            ["Gstin"] = s.GetValueOrDefault("general.firm_gstin", ""),
            ["LglNm"] = s.GetValueOrDefault("general.firm_name", "LuxInfra"),
            ["Addr1"] = s.GetValueOrDefault("general.firm_address", ""),
            ["Loc"] = s.GetValueOrDefault("general.firm_city", ""),
            ["Pin"] = s.GetValueOrDefault("general.firm_pin", ""),
            ["Stcd"] = s.GetValueOrDefault("general.firm_state", ""),
            ["Ph"] = s.GetValueOrDefault("general.firm_phone", ""),
            ["Em"] = s.GetValueOrDefault("general.firm_email", ""),
        };

        var buyer = new Dictionary<string, object?>
        {
            ["Gstin"] = party?.Gstin ?? "",
            ["LglNm"] = string.IsNullOrEmpty(party?.Name) ? "Walk-in Customer" : party.Name,
            ["Addr1"] = party?.BillingAddress ?? "",
            ["Loc"] = party?.State ?? "",
            ["Stcd"] = party?.State ?? "",
            ["Ph"] = party?.Phone ?? "",
            ["Em"] = party?.Email ?? "",
        };

        var items = lines.Select(l => new Dictionary<string, object?>
        {
            ["SlNo"] = l.Id,
            ["IsServc"] = "N",
            ["HsnCd"] = string.IsNullOrEmpty(l.HsnSac) ? "9983" : l.HsnSac,
            ["ItmDet"] = new Dictionary<string, object?>
            {
                ["TxVal"] = Math.Round(l.Qty * l.Rate, 2),
                ["AssAmt"] = Math.Round(l.Qty * l.Rate, 2),
                ["TotAmt"] = Math.Round(l.Qty * l.Rate, 2),
            },
            ["GstRt"] = l.TaxRate,
            ["Qty"] = l.Qty,
            ["UnitPrice"] = Math.Round(l.Rate, 2),
            ["TotInvVal"] = Math.Round(l.Qty * l.Rate, 2),
        }).ToList();

        var values = new Dictionary<string, object?>
        {
            ["AssVal"] = Math.Round(txn.Subtotal, 2),
            ["TotInvVal"] = Math.Round(txn.Total, 2),
            ["TotTxVal"] = Math.Round(txn.Subtotal, 2),
        };

        var payload = new Dictionary<string, object?>
        {
            ["Version"] = "1.03",
            ["TranDtls"] = new Dictionary<string, object?> { ["TranTyp"] = txn.Type == TxnTypes.SaleReturn ? "DEB" : "SALE", ["SupTyp"] = "B2B" },
            ["DocDtls"] = new Dictionary<string, object?>
            {
                ["Typ"] = txn.Type == TxnTypes.SaleReturn ? "CRN" : "INV",
                ["No"] = txn.RefLabel,
                ["Dt"] = txn.Date.ToString("dd/MM/yyyy"),
            },
            ["SellerDtls"] = seller,
            ["BuyerDtls"] = buyer,
            ["ItemList"] = items,
            ["ValDtls"] = values,
        };

        return (true, payload, null);
    }
}
