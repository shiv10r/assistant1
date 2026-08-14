using SQLite;

namespace LuxInfra.Models;

/// <summary>Client contract / agreement with terms + escalation clause (features 21 & 38).</summary>
[Table("contracts")]
public class SiteContract
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string PartyName { get; set; } = "";
    public string Title { get; set; } = "";
    public double Amount { get; set; }
    public DateTime StartDate { get; set; } = DateTime.Today;
    public DateTime EndDate { get; set; } = DateTime.Today;
    public string Terms { get; set; } = "";
    /// <summary>Rate escalation / price-revision clause text (feature 38).</summary>
    public string EscalationClause { get; set; } = "";
    public string Status { get; set; } = "Active";     // Active | Completed | Terminated

    [Ignore] public string AmountLabel => Services.ReportService.Money(Amount);
}

/// <summary>Billing milestones on a project/contract (feature 5) — % of work vs billed.</summary>
[Table("contract_milestones")]
public class ContractMilestone
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int ContractId { get; set; }
    public string Title { get; set; } = "";
    public double Amount { get; set; }
    public double Percentage { get; set; }      // % of contract value
    public DateTime DueDate { get; set; } = DateTime.Today;
    public string Status { get; set; } = "Pending";   // Pending | Billed | Paid
    public bool IsPaid { get; set; }

    [Ignore] public string AmountLabel => Services.ReportService.Money(Amount);
}

/// <summary>Supplier quotes for materials (feature 15 — vendor price book).</summary>
[Table("vendor_prices")]
public class VendorPrice
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Vendor { get; set; } = "";
    public string Item { get; set; } = "";
    public double Price { get; set; }
    public string Unit { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public string Notes { get; set; } = "";

    [Ignore] public string PriceLabel => Services.ReportService.Money(Price);
}

/// <summary>Machinery / equipment rental tracking (feature 17).</summary>
[Table("equipment_logs")]
public class EquipmentLog
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Equipment { get; set; } = "";
    public string Purpose { get; set; } = "";
    public double RentalCost { get; set; }
    public double FuelCost { get; set; }
    public DateTime Date { get; set; } = DateTime.Today;
    public string Notes { get; set; } = "";

    [Ignore] public string TotalLabel => Services.ReportService.Money(RentalCost + FuelCost);
}

/// <summary>Fuel &amp; diesel log per vehicle (feature 24).</summary>
[Table("fuel_logs")]
public class FuelLog
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Vehicle { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public double Litres { get; set; }
    public double Cost { get; set; }
    public double Kms { get; set; }
    public string Notes { get; set; } = "";

    [Ignore] public string CostLabel => Services.ReportService.Money(Cost);
}

/// <summary>Snag / punch-list items per project (feature 18).</summary>
[Table("snags")]
public class Snag
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = "";
    public string Severity { get; set; } = "Medium";   // Low | Medium | High
    public string Status { get; set; } = "Open";       // Open | In Progress | Fixed
    public string Assignee { get; set; } = "";
    public DateTime DueDate { get; set; } = DateTime.Today;
    public string Notes { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

/// <summary>App-wide announcement shown as a scrolling marquee + FCM push to all devices (advanced/premium feature).</summary>
[Table("broadcasts")]
public class Broadcast
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Message { get; set; } = "";
    public DateTime PublishedAt { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = true;

    [Ignore] public string PublishedLabel => PublishedAt.ToString("dd MMM yyyy HH:mm");
}

/// <summary>Contractor / vendor rating list (feature 30).</summary>
[Table("contractor_ratings")]
public class ContractorRating
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public double Quality { get; set; } = 5;
    public double Punctuality { get; set; } = 5;
    public double Cost { get; set; } = 5;
    public string Notes { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;

    [Ignore] public double Average => Math.Round((Quality + Punctuality + Cost) / 3.0, 1);
}
