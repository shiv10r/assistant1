using SQLite;

namespace LuxInfra.Models;

[Table("parties")]
public class Party
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public double OpeningBalance { get; set; }
    public string BalanceType { get; set; } = "pay";        // receive | pay
    public DateTime AsOfDate { get; set; } = DateTime.Today;
    public double CreditLimit { get; set; }
    public string GstType { get; set; } = "Unregistered/Consumer";
    public string Gstin { get; set; } = "";
    public string State { get; set; } = "";
    public string BillingAddress { get; set; } = "";
    public string Email { get; set; } = "";
    /// <summary>+ve → they owe you ("You'll Get"), −ve → you owe them ("You'll Give")</summary>
    public double CurrentBalance { get; set; }

    [Ignore] public string BalanceLabel => Services.ReportService.Money(Math.Abs(CurrentBalance));
    [Ignore] public bool IsReceivable => CurrentBalance >= 0;
    [Ignore] public string BalanceDirection => CurrentBalance >= 0 ? "You'll Get" : "You'll Give";
}

[Table("catalog_items")]
public class CatalogItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "Product";           // Product | Service
    public double SalePrice { get; set; }
    public double PurchasePrice { get; set; }
    public double WholesalePrice { get; set; }
    public string Unit { get; set; } = "Pcs";
    public string Category { get; set; } = "";
    public string HsnSac { get; set; } = "";
    public double TaxRate { get; set; }                     // GST %
    public double StockQty { get; set; }
    public double MinStock { get; set; }
    public string Barcode { get; set; } = "";
    public string Description { get; set; } = "";

    [Ignore] public string PriceLabel => Services.ReportService.Money(SalePrice);
    [Ignore] public string StockLabel => Type == "Service" ? "service" : $"{StockQty:0.##} {Unit}";
}

public static class TxnTypes
{
    public const string Sale = "SALE";
    public const string Purchase = "PURCHASE";
    public const string SaleReturn = "SALE_RETURN";
    public const string PurchaseReturn = "PURCHASE_RETURN";
    public const string Estimate = "ESTIMATE";
    public const string SaleOrder = "SALE_ORDER";
    public const string PurchaseOrder = "PURCHASE_ORDER";
    public const string DeliveryChallan = "DELIVERY_CHALLAN";
    public const string PaymentIn = "PAYMENT_IN";
    public const string PaymentOut = "PAYMENT_OUT";

    public static readonly string[] All =
        { Sale, Purchase, Estimate, SaleOrder, PurchaseOrder, DeliveryChallan, PaymentIn, PaymentOut };

    public static string Display(string type) => type switch
    {
        Sale => "Sale",
        Purchase => "Purchase",
        SaleReturn => "Sale Return",
        PurchaseReturn => "Purchase Return",
        Estimate => "Estimate",
        SaleOrder => "Sale Order",
        PurchaseOrder => "Purchase Order",
        DeliveryChallan => "Delivery Challan",
        PaymentIn => "Payment-In",
        PaymentOut => "Payment-Out",
        _ => type
    };

    public static string DocTitle(string type) => type switch
    {
        Sale => "TAX INVOICE",
        Purchase => "PURCHASE BILL",
        Estimate => "ESTIMATE / QUOTATION",
        SaleOrder => "SALE ORDER",
        PurchaseOrder => "PURCHASE ORDER",
        DeliveryChallan => "DELIVERY CHALLAN",
        PaymentIn => "PAYMENT RECEIPT",
        PaymentOut => "PAYMENT VOUCHER",
        _ => type
    };

    /// <summary>Non-ledger documents don't touch party balance or stock.</summary>
    public static bool IsLedger(string type) =>
        type is Sale or Purchase or SaleReturn or PurchaseReturn or PaymentIn or PaymentOut;
}

[Table("biz_txns")]
public class BizTxn
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int PartyId { get; set; }
    public string PartyName { get; set; } = "";
    public string Type { get; set; } = TxnTypes.Sale;
    public int RefNo { get; set; }
    public string Prefix { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public DateTime DueDate { get; set; } = DateTime.Today;
    public double Subtotal { get; set; }
    public double Discount { get; set; }
    public double Tax { get; set; }
    public double RoundOff { get; set; }
    public double Total { get; set; }
    public double Received { get; set; }
    public double Balance { get; set; }
    public string PaymentMode { get; set; } = "Cash";
    public string ChequeStatus { get; set; } = "";          // open | cleared | bounced (when PaymentMode=Cheque)
    public string Description { get; set; } = "";
    public string StateOfSupply { get; set; } = "";
    public string Status { get; set; } = "OPEN";

    [Ignore] public string TypeLabel => TxnTypes.Display(Type);
    [Ignore] public string RefLabel => string.IsNullOrEmpty(Prefix) ? $"#{RefNo}" : $"{Prefix}{RefNo}";
    [Ignore] public string TotalLabel => Services.ReportService.Money(Total);
    [Ignore] public string BalanceLabel => Services.ReportService.Money(Balance);
    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
}

[Table("biz_txn_items")]
public class BizTxnItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int TxnId { get; set; }
    public int ItemId { get; set; }
    public string ItemName { get; set; } = "";
    public string HsnSac { get; set; } = "";
    public string Unit { get; set; } = "";
    public double Qty { get; set; } = 1;
    public double FreeQty { get; set; }
    public double Rate { get; set; }
    public double DiscountPct { get; set; }
    public double TaxRate { get; set; }
    public double Amount { get; set; }
}

[Table("app_settings")]
public class AppSetting
{
    [PrimaryKey] public string Key { get; set; } = "";
    public string Value { get; set; } = "";
}

[Table("cash_entries")]
public class CashEntry
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Kind { get; set; } = "add";               // add | reduce
    public double Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.Today;
    public string Description { get; set; } = "";

    [Ignore] public string Label => Kind == "add" ? "＋ Cash added" : "− Cash reduced";
    [Ignore] public string AmountLabel => Services.ReportService.Money(Amount);
    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
    [Ignore] public bool IsAdd => Kind == "add";
}

[Table("bank_accounts")]
public class BankAccount
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string AccNo { get; set; } = "";
    public string Ifsc { get; set; } = "";
    public string UpiId { get; set; } = "";
    public double OpeningBalance { get; set; }
    public DateTime AsOf { get; set; } = DateTime.Today;

    [Ignore] public string BalanceLabel => Services.ReportService.Money(OpeningBalance);
}
