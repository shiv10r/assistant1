using LuxInfra.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LuxInfra.Services;

public static class AmountWords
{
    private static readonly string[] Ones =
    {
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };
    private static readonly string[] Tens =
        { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

    private static string TwoDigits(long n) =>
        n < 20 ? Ones[n] : $"{Tens[n / 10]}{(n % 10 > 0 ? " " + Ones[n % 10] : "")}";

    private static string ThreeDigits(long n) =>
        n >= 100 ? $"{Ones[n / 100]} Hundred{(n % 100 > 0 ? " " + TwoDigits(n % 100) : "")}" : TwoDigits(n);

    /// <summary>Indian system: crore / lakh / thousand.</summary>
    public static string InWords(double amount)
    {
        var rupees = (long)Math.Floor(Math.Abs(amount));
        var paise = (int)Math.Round((Math.Abs(amount) - rupees) * 100);

        if (rupees == 0 && paise == 0) return "Zero Rupees Only";

        var parts = new List<string>();
        if (rupees / 10_000_000 > 0) { parts.Add($"{ThreeDigits(rupees / 10_000_000)} Crore"); rupees %= 10_000_000; }
        if (rupees / 100_000 > 0) { parts.Add($"{TwoDigits(rupees / 100_000)} Lakh"); rupees %= 100_000; }
        if (rupees / 1_000 > 0) { parts.Add($"{TwoDigits(rupees / 1_000)} Thousand"); rupees %= 1_000; }
        if (rupees > 0) parts.Add(ThreeDigits(rupees));

        var words = parts.Count > 0 ? string.Join(" ", parts) + " Rupees" : "";
        if (paise > 0) words += $"{(words.Length > 0 ? " and " : "")}{TwoDigits(paise)} Paise";
        return words + " Only";
    }
}

public static class InvoicePdfService
{
    static InvoicePdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public static byte[] Build(BizTxn txn, Party? party, List<BizTxnItem> lines, Dictionary<string, string> s)
    {
        const string purple = "#7C4DFF";
        const string dim = "#666677";

        bool On(string key) => s.GetValueOrDefault(key) == "1";
        var firm = s.GetValueOrDefault("general.firm_name", "LuxInfra");
        var firmState = s.GetValueOrDefault("general.firm_state", "");
        var firmPhone = s.GetValueOrDefault("general.firm_phone", "");
        var firmGstin = s.GetValueOrDefault("general.firm_gstin", "");
        string Money2(double v) => On("print.amount_decimal")
            ? string.Format(new System.Globalization.CultureInfo("en-IN"), "₹{0:N2}", v)
            : ReportService.Money(v);
        var docTitle = TxnTypes.DocTitle(txn.Type);
        if (On("print.bill_of_supply_non_tax") && txn.Type == TxnTypes.Sale && txn.Tax <= 0)
            docTitle = "BILL OF SUPPLY";
        var sameState = string.IsNullOrEmpty(firmState) || string.IsNullOrEmpty(txn.StateOfSupply) ||
                        string.Equals(firmState, txn.StateOfSupply, StringComparison.OrdinalIgnoreCase);
        var savedAmount = txn.Discount + lines.Sum(l => l.Qty * l.Rate * l.DiscountPct / 100);

        var pageSize = s.GetValueOrDefault("print.regular.page_size", "A4") == "A5" ? PageSizes.A5 : PageSizes.A4;
        if (string.Equals(s.GetValueOrDefault("print.regular.orientation", "Portrait"), "Landscape", StringComparison.OrdinalIgnoreCase))
            pageSize = pageSize.Landscape();
        var baseFont = s.GetValueOrDefault("print.regular.text_size", "Medium") switch
        {
            "Small" => 8.5f,
            "Large" => 11f,
            _ => 9.5f
        };
        var firmAddress = s.GetValueOrDefault("general.firm_address", "");
        var firmEmail = s.GetValueOrDefault("general.firm_email", "");

        return Document.Create(doc => doc.Page(page =>
        {
            page.Size(pageSize);
            page.Margin(36);
            page.DefaultTextStyle(t => t.FontSize(baseFont).FontColor("#222233"));

            page.Header().Column(col =>
            {
                col.Item().Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        if (On("print.header.company_name"))
                            c.Item().Text(firm).FontSize(baseFont + 8.5f).Bold().FontColor(purple);
                        if (On("print.header.address") && !string.IsNullOrEmpty(firmAddress))
                            c.Item().Text(firmAddress).FontSize(baseFont - 1).FontColor(dim);
                        if (On("print.header.email") && !string.IsNullOrEmpty(firmEmail))
                            c.Item().Text(firmEmail).FontSize(baseFont - 1).FontColor(dim);
                        if (On("print.phone") && !string.IsNullOrEmpty(firmPhone))
                            c.Item().Text($"Ph: {firmPhone}").FontSize(8.5f).FontColor(dim);
                        if (On("print.gstin_on_sale") && !string.IsNullOrEmpty(firmGstin))
                            c.Item().Text($"GSTIN: {firmGstin}").FontSize(8.5f).FontColor(dim);
                        if (!string.IsNullOrEmpty(firmState))
                            c.Item().Text($"State: {firmState}").FontSize(8.5f).FontColor(dim);
                    });
                    row.ConstantItem(200).AlignRight().Column(c =>
                    {
                        if (On("print.original_duplicate"))
                            c.Item().AlignRight().Text("ORIGINAL FOR RECIPIENT").FontSize(7).FontColor(dim);
                        c.Item().AlignRight().Text(docTitle).FontSize(13).Bold();
                        c.Item().AlignRight().Text($"No: {txn.RefLabel}   Date: {txn.Date:dd/MM/yyyy}").FontSize(9);
                        if (txn.DueDate != txn.Date)
                            c.Item().AlignRight().Text($"Due: {txn.DueDate:dd/MM/yyyy}").FontSize(9).FontColor(dim);
                    });
                });
                col.Item().PaddingTop(6).LineHorizontal(1.5f).LineColor(purple);
            });

            page.Content().PaddingVertical(10).Column(col =>
            {
                // bill to
                col.Item().Background("#F4F2FB").Padding(10).Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text("BILL TO").FontSize(8).Bold().FontColor(dim);
                        c.Item().Text(string.IsNullOrEmpty(txn.PartyName) ? "Cash Sale" : txn.PartyName).FontSize(11).Bold();
                        if (party is not null)
                        {
                            if (!string.IsNullOrEmpty(party.BillingAddress)) c.Item().Text(party.BillingAddress).FontSize(8.5f);
                            if (!string.IsNullOrEmpty(party.Phone)) c.Item().Text($"Ph: {party.Phone}").FontSize(8.5f);
                            if (!string.IsNullOrEmpty(party.Gstin)) c.Item().Text($"GSTIN: {party.Gstin}").FontSize(8.5f);
                        }
                    });
                    if (On("gst.state_of_supply") && !string.IsNullOrEmpty(txn.StateOfSupply))
                        row.ConstantItem(160).AlignRight().Text($"State of Supply: {txn.StateOfSupply}").FontSize(8.5f);
                });

                // items table
                if (lines.Count > 0)
                {
                    col.Item().PaddingTop(10).Table(table =>
                    {
                        var showHsn = On("gst.hsn") && lines.Any(l => !string.IsNullOrEmpty(l.HsnSac));
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(22);
                            c.RelativeColumn(3);
                            if (showHsn) c.ConstantColumn(52);
                            c.ConstantColumn(55);
                            c.ConstantColumn(62);
                            if (On("print.tax_details")) c.ConstantColumn(45);
                            c.ConstantColumn(70);
                        });

                        table.Header(h =>
                        {
                            void Th(string text) => h.Cell().Background(purple).Padding(4).Text(text).Bold().FontColor("#FFF").FontSize(8.5f);
                            Th("#"); Th("Item");
                            if (showHsn) Th("HSN");
                            Th("Qty"); Th("Rate");
                            if (On("print.tax_details")) Th("GST%");
                            Th("Amount");
                        });

                        var i = 1;
                        foreach (var l in lines)
                        {
                            void Td(string text, bool right = false)
                            {
                                var cell = table.Cell().BorderBottom(0.5f).BorderColor("#DDDDE5").Padding(4);
                                if (right) cell.AlignRight().Text(text).FontSize(8.5f);
                                else cell.Text(text).FontSize(8.5f);
                            }
                            Td(i++.ToString());
                            Td(l.ItemName);
                            if (showHsn) Td(l.HsnSac);
                            Td($"{l.Qty:0.##} {l.Unit}", true);
                            Td(ReportService.Money(l.Rate), true);
                            if (On("print.tax_details")) Td($"{l.TaxRate:0.#}%", true);
                            Td(ReportService.Money(l.Amount), true);
                        }
                    });
                }

                // totals
                col.Item().PaddingTop(8).AlignRight().MaxWidth(240).Column(c =>
                {
                    void RowLine(string label, string value, bool bold = false)
                    {
                        c.Item().Row(r =>
                        {
                            var l = r.RelativeItem().Text(label).FontSize(9);
                            var v = r.ConstantItem(90).AlignRight().Text(value).FontSize(9);
                            if (bold) { l.Bold(); v.Bold(); }
                        });
                    }

                    if (On("print.total_item_qty") && lines.Count > 0)
                        RowLine("Total qty", lines.Sum(l => l.Qty).ToString("0.##"));
                    RowLine("Subtotal", Money2(txn.Subtotal));
                    if (txn.Discount > 0) RowLine("Discount", "− " + ReportService.Money(txn.Discount));
                    if (On("print.tax_details") && txn.Tax > 0)
                    {
                        if (sameState)
                        {
                            RowLine("CGST", ReportService.Money(txn.Tax / 2));
                            RowLine("SGST", ReportService.Money(txn.Tax / 2));
                        }
                        else
                            RowLine("IGST", ReportService.Money(txn.Tax));
                    }
                    if (txn.Tcs > 0) RowLine("TCS (2%/1%)", ReportService.Money(txn.Tcs));
                    if (txn.Tds > 0) RowLine("TDS", "− " + ReportService.Money(txn.Tds));
                    if (txn.ReverseCharge) RowLine("Reverse charge", "Yes");
                    if (Math.Abs(txn.RoundOff) > 0.001) RowLine("Round off", ReportService.Money(txn.RoundOff));
                    c.Item().PaddingVertical(2).LineHorizontal(1).LineColor(purple);
                    RowLine("TOTAL", Money2(txn.Total), bold: true);
                    if (txn.Received > 0 && On("print.received_amount"))
                        RowLine("Received", Money2(txn.Received));
                    if (txn.Received > 0 && On("print.balance_amount"))
                        RowLine("Balance", Money2(txn.Balance), bold: true);
                    if (On("print.you_saved") && savedAmount > 0)
                        c.Item().AlignRight().Text($"You saved {ReportService.Money(savedAmount)} 🎉").FontSize(9).FontColor("#1D6F42");
                    if (On("print.payment_mode"))
                        c.Item().AlignRight().Text($"Payment mode: {txn.PaymentMode}").FontSize(8.5f).FontColor(dim);
                });

                if (On("print.amount_words"))
                    col.Item().PaddingTop(8).Text($"Amount in words: {AmountWords.InWords(txn.Total)}").FontSize(9).Italic();

                if (On("print.description") && !string.IsNullOrEmpty(txn.Description))
                    col.Item().PaddingTop(6).Text($"Description: {txn.Description}").FontSize(8.5f).FontColor(dim);

                if (On("print.party_balance") && party is not null)
                    col.Item().PaddingTop(4).Text($"Party balance: {party.BalanceDirection} {party.BalanceLabel}").FontSize(8.5f).FontColor(dim);

                // footer block
                col.Item().PaddingTop(18).Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        if (On("print.terms"))
                        {
                            c.Item().Text("Terms & Conditions").FontSize(8.5f).Bold();
                            c.Item().Text(s.GetValueOrDefault("txn.terms_text", "")).FontSize(8).FontColor(dim);
                        }
                        if (On("print.received_by")) c.Item().PaddingTop(10).Text("Received by: ______________").FontSize(8.5f);
                        if (On("print.delivered_by")) c.Item().Text("Delivered by: ______________").FontSize(8.5f);
                    });
                    if (On("print.signature"))
                        row.ConstantItem(170).AlignBottom().Column(c =>
                        {
                            c.Item().PaddingTop(24).LineHorizontal(0.8f).LineColor("#999999");
                            c.Item().AlignCenter().Text($"For {firm}").FontSize(8.5f);
                            c.Item().AlignCenter().Text(s.GetValueOrDefault("print.signature_text", "Authorized Signatory")).FontSize(8.5f).Bold();
                        });
                });

                if (On("print.acknowledgement"))
                {
                    col.Item().PaddingTop(16).LineHorizontal(0.5f).LineColor("#BBBBBB");
                    col.Item().PaddingTop(4).Text($"ACKNOWLEDGEMENT — {firm} · {TxnTypes.DocTitle(txn.Type)} {txn.RefLabel} · {txn.Date:dd/MM/yyyy} · {ReportService.Money(txn.Total)} · Receiver sign: ____________").FontSize(8).FontColor(dim);
                }
            });

            page.Footer().AlignCenter().Text(t =>
            {
                t.Span($"{firm} · generated by LuxInfra Billing").FontSize(7.5f).FontColor(dim);
                if (On("print.page_numbers"))
                {
                    t.Span(" · page ").FontSize(7.5f).FontColor(dim);
                    t.CurrentPageNumber().FontSize(7.5f).FontColor(dim);
                    t.Span(" of ").FontSize(7.5f).FontColor(dim);
                    t.TotalPages().FontSize(7.5f).FontColor(dim);
                }
            });
        })).GeneratePdf();
    }
}
