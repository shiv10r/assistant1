using SQLite;

namespace LuxInfra.Models;

/// <summary>Audit trail row — one entry per notable user action across the app.</summary>
[Table("activity_logs")]
public class ActivityLog
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Action { get; set; } = "";
    public string Detail { get; set; } = "";
    public string Source { get; set; } = "web";
    public DateTime Timestamp { get; set; } = DateTime.Now;

    [Ignore] public string TimeLabel => Timestamp.ToString("dd MMM, hh:mm tt");
}
