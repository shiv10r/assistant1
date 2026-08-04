namespace LuxInfra.Models;

public class ChatMessage
{
    public string Text { get; set; } = "";
    public bool IsUser { get; set; }
    public DateTime Time { get; set; } = DateTime.Now;
    public string TimeLabel => Time.ToString("hh:mm tt");

    // Report-card messages render as a structured table instead of a text bubble.
    public bool IsReport { get; set; }
    public string ReportTitle { get; set; } = "";
    public List<ReportRow> Rows { get; set; } = new();
    public List<CategoryTotal> CategoryTotals { get; set; } = new();
    public string TotalLabel { get; set; } = "";
}
