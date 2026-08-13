using SQLite;

namespace LuxInfra.Models;

[Table("expenses")]
public class ExpenseEntry
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    public string Site { get; set; } = "General";

    public string Client { get; set; } = "";

    public string Category { get; set; } = "Misc";

    public double Amount { get; set; }

    public DateTime Date { get; set; }

    public string RawText { get; set; } = "";
}
