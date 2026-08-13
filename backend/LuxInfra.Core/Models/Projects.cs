using SQLite;

namespace LuxInfra.Models;

/// <summary>A construction/interior-design job you track separately from day-to-day billing.</summary>
[Table("projects")]
public class Project
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public double Value { get; set; }
    public string Status { get; set; } = ProjectStatuses.Ongoing;
    public DateTime CreatedAt { get; set; } = DateTime.Today;
    /// <summary>Optional map coordinates for the site map view (e.g. 28.6139, 77.2090).</summary>
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    [Ignore] public string ValueLabel => Services.ReportService.Money(Value);
    [Ignore] public bool HasCoordinates => Latitude != 0 || Longitude != 0;
}

public static class ProjectStatuses
{
    public const string InDiscussion = "In Discussion";
    public const string NotStarted = "Not Started";
    public const string Ongoing = "Ongoing";
    public const string OnHold = "On Hold";
    public const string Completed = "Completed";

    public static readonly string[] All = { InDiscussion, NotStarted, Ongoing, OnHold, Completed };
}

/// <summary>Site staff, sub-contractors or material suppliers scoped to one project.</summary>
[Table("site_parties")]
public class SiteParty
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Role { get; set; } = SitePartyRoles.SiteStaff;
    public double OpeningBalance { get; set; }
    public string BalanceType { get; set; } = "pending";     // advance | pending
    /// <summary>+ve → advance paid to them, −ve → pending amount we owe them.</summary>
    public double CurrentBalance { get; set; }
    /// <summary>Daily wage for payroll-from-attendance (₹ / day).</summary>
    public double DailyRate { get; set; }
    public bool IsActive { get; set; } = true;

    [Ignore] public string BalanceLabel => Services.ReportService.Money(Math.Abs(CurrentBalance));
    [Ignore] public bool IsAdvance => CurrentBalance >= 0;
}

public static class SitePartyRoles
{
    public const string SiteStaff = "Site Staff";
    public const string SubContractor = "Sub-contractor";
    public const string MaterialSupplier = "Material Supplier";

    public static readonly string[] All = { SiteStaff, SubContractor, MaterialSupplier };
}

public static class TaskStatuses
{
    public const string NotStarted = "Not Started";
    public const string Ongoing = "Ongoing";
    public const string Completed = "Completed";

    public static readonly string[] All = { NotStarted, Ongoing, Completed };
}

[Table("project_tasks")]
public class ProjectTask
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = "";
    public string Status { get; set; } = TaskStatuses.NotStarted;
    public string Members { get; set; } = "";
    public string Location { get; set; } = "";
    public int DurationDays { get; set; }
    public DateTime StartDate { get; set; } = DateTime.Today;
    public DateTime EndDate { get; set; } = DateTime.Today;
    public double EstQuantity { get; set; }
    public double ProgressPercent { get; set; }
    public string ImagePath { get; set; } = "";
    public string Link { get; set; } = "";

    [Ignore] public string TaskIdLabel => $"#T{Id:0000}";
    [Ignore] public string ProgressLabel => $"{ProgressPercent:0}%";
    [Ignore] public string DateRangeLabel => $"{StartDate:dd MMM} – {EndDate:dd MMM}";
    [Ignore] public bool HasImage => !string.IsNullOrWhiteSpace(ImagePath);
}

public static class ProjectTxnTypes
{
    public const string PaymentIn = "PAYMENT_IN";
    public const string PaymentOut = "PAYMENT_OUT";

    public static string Display(string type) => type switch
    {
        PaymentIn => "Payment In",
        PaymentOut => "Payment Out",
        _ => type
    };
}

[Table("project_txns")]
public class ProjectTxn
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Type { get; set; } = ProjectTxnTypes.PaymentIn;
    public int PartyId { get; set; }
    public string PartyName { get; set; } = "";
    public double Amount { get; set; }
    public string Description { get; set; } = "";
    public string ReferenceNumber { get; set; } = "";
    public string PaymentMethod { get; set; } = "Cash";
    public string CostCode { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;

    [Ignore] public string TypeLabel => ProjectTxnTypes.Display(Type);
    [Ignore] public string AmountLabel => Services.ReportService.Money(Amount);
    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
    [Ignore] public bool IsIn => Type == ProjectTxnTypes.PaymentIn;
}

public static class AttendanceStatuses
{
    public const string Registered = "Registered";
    public const string Upcoming = "Upcoming";
    public const string Present = "Present";
    public const string Absent = "Absent";

    public static readonly string[] All = { Registered, Upcoming, Present, Absent };
}

/// <summary>One row per (project, site party, calendar day).</summary>
[Table("attendance_records")]
public class AttendanceRecord
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int PartyId { get; set; }
    public string PartyName { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public string Status { get; set; } = AttendanceStatuses.Registered;
    public double HoursLogged { get; set; }

    [Ignore] public string HoursLabel => $"{HoursLogged:0.#} hrs";
}

public static class PunchSources
{
    public const string Manual = "Manual";
    public const string Remote = "Remote";
    public const string Biometric = "Biometric";

    public static readonly string[] All = { Manual, Remote, Biometric };
}

/// <summary>A clock-in/out event captured from the site (manual, remote GPS or a biometric device webhook).</summary>
[Table("attendance_punches")]
public class AttendancePunch
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int PartyId { get; set; }
    public string PartyName { get; set; } = "";
    public string Kind { get; set; } = "In";              // In | Out
    public string Source { get; set; } = PunchSources.Manual;
    public DateTime When { get; set; } = DateTime.Now;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double Accuracy { get; set; }
    /// <summary>True when the punch coords fall inside the project's geofence radius.</summary>
    public bool InGeofence { get; set; } = true;
    public double DistanceMeters { get; set; }
    public string? DeviceId { get; set; }
    public string? Note { get; set; }
}

public static class RequestKinds
{
    public const string Wfh = "WFH";
    public const string Sick = "Sick Leave";
    public const string Casual = "Casual Leave";
    public const string EmergencyLeave = "Emergency Leave";

    public static readonly string[] All = { Wfh, Sick, Casual, EmergencyLeave };
}

public static class RequestStatuses
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";

    public static readonly string[] All = { Pending, Approved, Rejected };
}

/// <summary>Remote / leave request: WFH, sick leave, casual leave or emergency leave.</summary>
[Table("attendance_requests")]
public class AttendanceRequest
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int PartyId { get; set; }
    public string PartyName { get; set; } = "";
    public string Kind { get; set; } = RequestKinds.Wfh;
    public DateTime DateFrom { get; set; } = DateTime.Today;
    public DateTime DateTo { get; set; } = DateTime.Today;
    public string Reason { get; set; } = "";
    public string Status { get; set; } = RequestStatuses.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string? DecidedBy { get; set; }
}

/// <summary>SOS / emergency alert raised from the site, capturing GPS coords.</summary>
[Table("emergency_alerts")]
public class EmergencyAlert
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int PartyId { get; set; }
    public string PartyName { get; set; } = "";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double Accuracy { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool Handled { get; set; }
}

public static class MaterialTxnKinds
{
    public const string Request = "Request";
    public const string Received = "Received";
    public const string Delivered = "Delivered";

    public static readonly string[] All = { Request, Received, Delivered };
}

[Table("material_txns")]
public class MaterialTxn
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Kind { get; set; } = MaterialTxnKinds.Request;
    public string MaterialName { get; set; } = "";
    public double Quantity { get; set; }
    public string Unit { get; set; } = "Pcs";
    public string VendorName { get; set; } = "";
    public string VendorLocation { get; set; } = "";
    public string PaymentMode { get; set; } = "Cash";
    public double Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.Today;

    [Ignore] public string QtyLabel => $"{Quantity:0.##} {Unit}";
    [Ignore] public string AmountLabel => Services.ReportService.Money(Amount);
    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
}

[Table("site_logs")]
public class SiteLog
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public DateTime Date { get; set; } = DateTime.Today;
    public double ProgressPercent { get; set; }
    public string Note { get; set; } = "";

    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
    [Ignore] public string ProgressLabel => $"{ProgressPercent:0}%";
}

[Table("meeting_minutes")]
public class MeetingMinute
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public string Attendees { get; set; } = "";
    public string Notes { get; set; } = "";

    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
}

public static class DesignCategories
{
    public const string Layout2D = "2D Layout";
    public const string Layout3D = "3D Layout";
    public const string ProductionFiles = "Production Files";

    public static readonly string[] All = { Layout2D, Layout3D, ProductionFiles };
}

[Table("design_files")]
public class DesignFile
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Category { get; set; } = DesignCategories.Layout2D;
    public string Name { get; set; } = "";
    public string ImagePath { get; set; } = "";
    public string Note { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;

    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
    [Ignore] public bool HasImage => !string.IsNullOrWhiteSpace(ImagePath);
}

[Table("project_folders")]
public class ProjectFolder
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.Today;
}

[Table("project_files")]
public class ProjectFile
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int FolderId { get; set; }
    public string FileName { get; set; } = "";
    public string FilePath { get; set; } = "";
    public DateTime UploadedAt { get; set; } = DateTime.Today;
}

/// <summary>Stores the actual bytes of an uploaded 2D/3D model or any project file.</summary>
[Table("file_blobs")]
public class FileBlob
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Category { get; set; } = DesignCategories.Layout2D;
    public string Name { get; set; } = "";
    public string ContentType { get; set; } = "application/octet-stream";
    public long Size { get; set; }
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string SizeLabel => Size switch
    {
        < 1024 => $"{Size} B",
        < 1024 * 1024 => $"{Size / 1024.0:0.#} KB",
        _ => $"{Size / (1024.0 * 1024.0):0.##} MB"
    };
}
