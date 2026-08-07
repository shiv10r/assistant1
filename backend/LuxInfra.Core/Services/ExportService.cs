using ClosedXML.Excel;
using LuxInfra.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LuxInfra.Services;

public static class ExportService
{
    static ExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    // ---------- EXCEL ----------
    public static byte[] BuildExcel(ReportData data)
    {
        using var wb = new XLWorkbook();

        var ws = wb.Worksheets.Add("Expenses");
        ws.Cell(1, 1).Value = $"LuxInfra Expense Report — {data.PeriodLabel}";
        ws.Range(1, 1, 1, 5).Merge().Style.Font.SetBold().Font.SetFontSize(14);

        string[] headers = { "Date", "Site", "Client", "Category", "Amount (₹)" };
        for (var i = 0; i < headers.Length; i++)
        {
            var c = ws.Cell(3, i + 1);
            c.Value = headers[i];
            c.Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.FromHtml("#7C4DFF")).Font.SetFontColor(XLColor.White);
        }

        var r = 4;
        foreach (var row in data.Rows)
        {
            ws.Cell(r, 1).Value = row.DateLabel;
            ws.Cell(r, 2).Value = row.Site;
            ws.Cell(r, 3).Value = row.Client;
            ws.Cell(r, 4).Value = row.Category;
            ws.Cell(r, 5).Value = row.Amount;
            ws.Cell(r, 5).Style.NumberFormat.Format = "#,##0";
            r++;
        }
        ws.Cell(r, 4).Value = "TOTAL";
        ws.Cell(r, 4).Style.Font.SetBold();
        ws.Cell(r, 5).Value = data.Total;
        ws.Cell(r, 5).Style.Font.SetBold();
        ws.Cell(r, 5).Style.NumberFormat.Format = "#,##0";
        ws.Columns().AdjustToContents();

        AddSummarySheet(wb, "By Category", data.CategoryTotals);
        AddSummarySheet(wb, "By Site", data.SiteTotals);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    private static void AddSummarySheet(XLWorkbook wb, string name, List<CategoryTotal> totals)
    {
        var ws = wb.Worksheets.Add(name);
        ws.Cell(1, 1).Value = name;
        ws.Cell(1, 1).Style.Font.SetBold().Font.SetFontSize(13);
        ws.Cell(3, 1).Value = name == "By Site" ? "Site" : "Category";
        ws.Cell(3, 2).Value = "Entries";
        ws.Cell(3, 3).Value = "Total (₹)";
        ws.Range(3, 1, 3, 3).Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.FromHtml("#00B8D9")).Font.SetFontColor(XLColor.White);

        var r = 4;
        foreach (var t in totals)
        {
            ws.Cell(r, 1).Value = t.Category;
            ws.Cell(r, 2).Value = t.Count;
            ws.Cell(r, 3).Value = t.Total;
            ws.Cell(r, 3).Style.NumberFormat.Format = "#,##0";
            r++;
        }
        ws.Cell(r, 1).Value = "TOTAL";
        ws.Cell(r, 1).Style.Font.SetBold();
        ws.Cell(r, 3).Value = totals.Sum(t => t.Total);
        ws.Cell(r, 3).Style.Font.SetBold();
        ws.Cell(r, 3).Style.NumberFormat.Format = "#,##0";
        ws.Columns().AdjustToContents();
    }

    // ---------- ITEM CATALOG (utilities: import/export) ----------
    public static byte[] ExportItemsExcel(List<CatalogItem> items)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Items");
        string[] headers = { "Name", "Type", "Sale Price", "Purchase Price", "Unit", "Category", "HSN/SAC", "GST %", "Stock Qty", "Min Stock" };
        for (var i = 0; i < headers.Length; i++)
        {
            var c = ws.Cell(1, i + 1);
            c.Value = headers[i];
            c.Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.FromHtml("#7C4DFF")).Font.SetFontColor(XLColor.White);
        }
        var r = 2;
        foreach (var it in items)
        {
            ws.Cell(r, 1).Value = it.Name;
            ws.Cell(r, 2).Value = it.Type;
            ws.Cell(r, 3).Value = it.SalePrice;
            ws.Cell(r, 4).Value = it.PurchasePrice;
            ws.Cell(r, 5).Value = it.Unit;
            ws.Cell(r, 6).Value = it.Category;
            ws.Cell(r, 7).Value = it.HsnSac;
            ws.Cell(r, 8).Value = it.TaxRate;
            ws.Cell(r, 9).Value = it.StockQty;
            ws.Cell(r, 10).Value = it.MinStock;
            r++;
        }
        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    /// <summary>Reads items from an .xlsx using the same column layout ExportItemsExcel writes.</summary>
    public static List<CatalogItem> ImportItemsExcel(Stream xlsx)
    {
        using var wb = new XLWorkbook(xlsx);
        var ws = wb.Worksheets.First();
        var items = new List<CatalogItem>();
        foreach (var row in ws.RowsUsed().Skip(1))
        {
            var name = row.Cell(1).GetString().Trim();
            if (string.IsNullOrEmpty(name)) continue;
            items.Add(new CatalogItem
            {
                Name = name,
                Type = string.IsNullOrEmpty(row.Cell(2).GetString()) ? "Product" : row.Cell(2).GetString().Trim(),
                SalePrice = row.Cell(3).TryGetValue<double>(out var sp) ? sp : 0,
                PurchasePrice = row.Cell(4).TryGetValue<double>(out var pp) ? pp : 0,
                Unit = string.IsNullOrEmpty(row.Cell(5).GetString()) ? "Pcs" : row.Cell(5).GetString().Trim(),
                Category = row.Cell(6).GetString().Trim(),
                HsnSac = row.Cell(7).GetString().Trim(),
                TaxRate = row.Cell(8).TryGetValue<double>(out var tr) ? tr : 0,
                StockQty = row.Cell(9).TryGetValue<double>(out var sq) ? sq : 0,
                MinStock = row.Cell(10).TryGetValue<double>(out var ms2) ? ms2 : 0,
            });
        }
        return items;
    }

    // ---------- PDF ----------
    public static byte[] BuildPdf(ReportData data) => BuildDocument(data).GeneratePdf();

    // ---------- PNG ----------
    public static byte[] BuildPng(ReportData data)
    {
        var settings = new ImageGenerationSettings { ImageFormat = ImageFormat.Png, RasterDpi = 144 };
        return BuildDocument(data).GenerateImages(settings).First();
    }

    private static Document BuildDocument(ReportData data)
    {
        const string purple = "#7C4DFF";
        const string aqua = "#00A896";
        const string dim = "#666677";

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(t => t.FontSize(10).FontColor("#222233"));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text(t =>
                        {
                            t.Span("Lux").FontSize(22).Bold();
                            t.Span("Infra").FontSize(22).Bold().FontColor(aqua);
                        });
                        row.ConstantItem(200).AlignRight().AlignMiddle()
                            .Text($"Expense Report\n{data.PeriodLabel}").FontSize(10).FontColor(dim);
                    });
                    col.Item().PaddingTop(6).LineHorizontal(2).LineColor(purple);
                });

                page.Content().PaddingVertical(12).Column(col =>
                {
                    // main table
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(60);
                            c.RelativeColumn(2);
                            c.RelativeColumn(2);
                            c.RelativeColumn(2);
                            c.ConstantColumn(80);
                        });

                        table.Header(h =>
                        {
                            foreach (var text in new[] { "Date", "Site", "Client", "Category", "Amount" })
                                h.Cell().Background(purple).Padding(6)
                                    .Text(text).Bold().FontColor("#FFFFFF");
                        });

                        var even = false;
                        foreach (var row in data.Rows)
                        {
                            var bg = even ? "#F4F2FB" : "#FFFFFF";
                            table.Cell().Background(bg).Padding(5).Text(row.DateLabel);
                            table.Cell().Background(bg).Padding(5).Text(row.Site);
                            table.Cell().Background(bg).Padding(5).Text(row.Client);
                            table.Cell().Background(bg).Padding(5).Text(row.Category);
                            table.Cell().Background(bg).Padding(5).AlignRight().Text(row.AmountLabel);
                            even = !even;
                        }

                        table.Cell().ColumnSpan(4).Background("#EAE4FA").Padding(6).Text("TOTAL").Bold();
                        table.Cell().Background("#EAE4FA").Padding(6).AlignRight().Text(data.TotalLabel).Bold();
                    });

                    // category summary
                    col.Item().PaddingTop(18).Text("Summary by category").FontSize(13).Bold().FontColor(purple);
                    col.Item().PaddingTop(6).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                        });
                        table.Header(h =>
                        {
                            foreach (var text in new[] { "Category", "Entries", "Total" })
                                h.Cell().Background(aqua).Padding(6).Text(text).Bold().FontColor("#FFFFFF");
                        });
                        foreach (var t in data.CategoryTotals)
                        {
                            table.Cell().Padding(5).BorderBottom(0.5f).BorderColor("#DDDDE5").Text(t.Category);
                            table.Cell().Padding(5).BorderBottom(0.5f).BorderColor("#DDDDE5").Text(t.Count.ToString());
                            table.Cell().Padding(5).BorderBottom(0.5f).BorderColor("#DDDDE5").AlignRight().Text(t.TotalLabel);
                        }
                    });

                    // site summary
                    col.Item().PaddingTop(18).Text("Summary by site").FontSize(13).Bold().FontColor(purple);
                    col.Item().PaddingTop(6).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                        });
                        table.Header(h =>
                        {
                            foreach (var text in new[] { "Site", "Entries", "Total" })
                                h.Cell().Background(aqua).Padding(6).Text(text).Bold().FontColor("#FFFFFF");
                        });
                        foreach (var t in data.SiteTotals)
                        {
                            table.Cell().Padding(5).BorderBottom(0.5f).BorderColor("#DDDDE5").Text(t.Category);
                            table.Cell().Padding(5).BorderBottom(0.5f).BorderColor("#DDDDE5").Text(t.Count.ToString());
                            table.Cell().Padding(5).BorderBottom(0.5f).BorderColor("#DDDDE5").AlignRight().Text(t.TotalLabel);
                        }
                    });
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("LuxInfra · interior design expense tracker · page ").FontColor(dim).FontSize(8);
                    t.CurrentPageNumber().FontColor(dim).FontSize(8);
                });
            });
        });
    }
}
