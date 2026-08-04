namespace LuxInfra.Models;

public enum ReportPeriod
{
    Today,
    Week,
    Month,
    All
}

public class ReportRow
{
    public string DateLabel { get; set; } = "";
    public string Site { get; set; } = "";
    public string Client { get; set; } = "";
    public string Category { get; set; } = "";
    public string AmountLabel { get; set; } = "";
    public double Amount { get; set; }
}

public class CategoryTotal
{
    public string Category { get; set; } = "";
    public int Count { get; set; }
    public double Total { get; set; }
    public string TotalLabel { get; set; } = "";
    public string CountLabel => Count == 1 ? "1 entry" : $"{Count} entries";
}

public class ReportData
{
    public ReportPeriod Period { get; set; }
    public string PeriodLabel { get; set; } = "";
    public List<ReportRow> Rows { get; set; } = new();
    public List<CategoryTotal> CategoryTotals { get; set; } = new();
    public List<CategoryTotal> SiteTotals { get; set; } = new();
    public double Total { get; set; }
    public string TotalLabel { get; set; } = "";
    public int Count => Rows.Count;
}
