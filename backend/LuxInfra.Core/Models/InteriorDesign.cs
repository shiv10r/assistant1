using SQLite;

namespace LuxInfra.Models;

/// <summary>Worker/staff time-tracking entry: who, which project/room, when, how many hours.</summary>
[Table("time_entries")]
public class TimeEntry
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public int PartyId { get; set; }
    public string WorkerName { get; set; } = "";
    public string WorkerPhone { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public double Hours { get; set; }
    public string Notes { get; set; } = "";
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
    [Ignore] public string HoursLabel => $"{Hours:0.##} hrs";
    [Ignore] public string WeekdayLabel => Date.ToString("ddd");
    [Ignore] public string DisplayName => string.IsNullOrWhiteSpace(WorkerName) ? $"Worker #{PartyId}" : WorkerName;
}

/// <summary>A room inside a project — used for room-wise BOQ, scheduling and cost tracking.</summary>
[Table("rooms")]
public class Room
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public double? AreaSqFt { get; set; }
    public string? Dimensions { get; set; }
    public string Status { get; set; } = RoomStatuses.InProgress;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string AreaLabel => AreaSqFt.HasValue ? $"{AreaSqFt:0.##} sqft" : "—";
    public static readonly Dictionary<string, string> StatusColors = new()
    {
        { RoomStatuses.NotStarted, "bg-slate-100 text-slate-600" },
        { RoomStatuses.InProgress, "bg-blue-100 text-blue-700" },
        { RoomStatuses.Completed, "bg-emerald-100 text-emerald-700" },
        { RoomStatuses.OnHold, "bg-amber-100 text-amber-700" }
    };
}

public static class RoomStatuses
{
    public const string NotStarted = "Not Started";
    public const string InProgress = "In Progress";
    public const string Completed = "Completed";
    public const string OnHold = "On Hold";
    public static readonly string[] All = { NotStarted, InProgress, Completed, OnHold };
}

/// <summary>A design item/product pinned onto a mood-board / spec sheet.</summary>
[Table("moodboard_items")]
public class MoodBoardItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string Title { get; set; } = "";
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public string? VendorName { get; set; }
    public double Price { get; set; }
    public string? Unit { get; set; }
    public double? Quantity { get; set; }
    public string? Notes { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string PriceLabel => Services.ReportService.Money(Price);
    [Ignore] public string TotalLabel => Services.ReportService.Money(Price * (Quantity ?? 1));
    [Ignore] public string SubLabel => string.IsNullOrWhiteSpace(Category) ? "Design Item" : Category;
}

/// <summary>Vendor catalogue entry with optional 3D/AR asset (GLB, USDZ, model-viewer). */</summary>
[Table("vendor_catalogue")]
public class VendorCatalogueItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Category { get; set; }
    public string? Description { get; set; }
    public double Price { get; set; }
    public string? Unit { get; set; }
    public double? LeadTimeDays { get; set; }
    public string? VendorName { get; set; }
    public string? VendorPhone { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? ModelUrl { get; set; }
    public string? ModelFormat { get; set; } = "glb";
    public double? DimensionsL { get; set; }
    public double? DimensionsW { get; set; }
    public double? DimensionsH { get; set; }
    public string? SpecJson { get; set; }
    public bool IsActive { get; set; } = true;

    [Ignore] public string PriceLabel => Services.ReportService.Money(Price);
    [Ignore] public string DimLabel => (DimensionsL, DimensionsW, DimensionsH).ToString() is var _ && DimensionsL.HasValue ? $"{DimensionsL}×{DimensionsW}×{DimensionsH}" : "—";
}

/// <summary>A 3D scene (room) with walls, camera, lighting and placed furniture models.</summary>
[Table("room_scenes")]
public class RoomScene
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = "";
    public string? RoomRef { get; set; }
    public string? SceneJson { get; set; }
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [Ignore] public string VersionLabel => $"v{Version}";
}

/// <summary>Revision-controlled version of a design file/drawing/mood-board.</summary>
[Table("design_revisions")]
public class DesignRevision
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string? FileUrl { get; set; }
    public int Version { get; set; } = 1;
    public string Status { get; set; } = RevisionStatuses.Draft;
    public int CreatedById { get; set; }
    public string CreatedByName { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public static readonly Dictionary<string, string> StatusColors = new()
    {
        { RevisionStatuses.Draft, "bg-slate-100 text-slate-600" },
        { RevisionStatuses.InReview, "bg-blue-100 text-blue-700" },
        { RevisionStatuses.Approved, "bg-emerald-100 text-emerald-700" },
        { RevisionStatuses.Rejected, "bg-red-100 text-red-700" }
    };
}

public static class RevisionStatuses
{
    public const string Draft = "Draft";
    public const string InReview = "In Review";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public static readonly string[] All = { Draft, InReview, Approved, Rejected };
}

/// <summary>Comment/pin dropped by a client on a design revision or 3D model.</summary>
[Table("design_comments")]
public class DesignComment
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int RevisionId { get; set; }
    public int ProjectId { get; set; }
    public double? PositionX { get; set; }
    public double? PositionY { get; set; }
    public string? PinColor { get; set; }
    public string Author { get; set; } = "";
    public string? AuthorRole { get; set; }
    public string Text { get; set; } = "";
    public int? ParentCommentId { get; set; }
    public string Status { get; set; } = CommentStatuses.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}

public static class CommentStatuses
{
    public const string Open = "Open";
    public const string InProgress = "In Progress";
    public const string Resolved = "Resolved";
    public static readonly string[] All = { Open, InProgress, Resolved };
}

/// <summary>Safety / quality inspection checklist header.</summary>
[Table("checklist_templates")]
public class ChecklistTemplate
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Category { get; set; }
    public string? ItemsJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>One checklist item within a template.</summary>
[Table("checklist_items")]
public class ChecklistItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int TemplateId { get; set; }
    public string Text { get; set; } = "";
    public int SortOrder { get; set; }
}

/// <summary>A completed safety/quality inspection run on site.</summary>
[Table("inspection_records")]
public class InspectionRecord
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = "";
    public DateTime Date { get; set; } = DateTime.Today;
    public string InspectorName { get; set; } = "";
    public string? Notes { get; set; }
    public bool IsPassed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? AnswersJson { get; set; }
    public string? PhotosJson { get; set; }

    [Ignore] public string DateLabel => Date.ToString("dd MMM, yy");
    [Ignore] public string ResultLabel => IsPassed ? "PASS" : "FAIL";
    [Ignore] public string ResultColor => IsPassed ? "text-emerald-600" : "text-red-600";
    [Ignore] public string PhotoCount => (string.IsNullOrWhiteSpace(PhotosJson) ? 0 : System.Text.Json.JsonSerializer.Deserialize<List<string>>(PhotosJson)?.Count ?? 0).ToString();
}

/// <summary>Non-conformance report raised from an inspection.</summary>
[Table("ncr_records")]
public class NcrRecord
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int InspectionId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Severity { get; set; } = NcrSeverity.Medium;
    public string Status { get; set; } = NcrStatuses.Open;
    public string? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string DateLabel => DueDate?.ToString("dd MMM, yy") ?? "—";
}

public static class NcrSeverity
{
    public const string Low = "Low";
    public const string Medium = "Medium";
    public const string High = "High";
    public const string Critical = "Critical";
    public static readonly string[] All = { Low, Medium, High, Critical };
}

public static class NcrStatuses
{
    public const string Open = "Open";
    public const string InProgress = "In Progress";
    public const string Closed = "Closed";
    public static readonly string[] All = { Open, InProgress, Closed };
}

/// <summary>Sub-contractor work order with measurement sheet and billing.</summary>
[Table("subcontractor_workorders")]
public class SubcontractorWorkOrder
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int PartyId { get; set; }
    public string ContractorName { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string? Category { get; set; }
    public double AgreedRate { get; set; }
    public string Unit { get; set; } = "Pcs";
    public double Quantity { get; set; }
    public double? BilledQuantity { get; set; }
    public string Status { get; set; } = WorkOrderStatuses.Pending;
    public DateTime StartDate { get; set; } = DateTime.Today;
    public DateTime? EndDate { get; set; }
    public string? MeasurementJson { get; set; }
    public string? FileUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string AgreedRateLabel => Services.ReportService.Money(AgreedRate);
    [Ignore] public string ValueLabel => Services.ReportService.Money(AgreedRate * Quantity);
    [Ignore] public double ProgressPct => Quantity > 0 ? ((BilledQuantity ?? 0) / Quantity * 100) : 0;
}

public static class WorkOrderStatuses
{
    public const string Pending = "Pending";
    public const string Ongoing = "Ongoing";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";
    public static readonly string[] All = { Pending, Ongoing, Completed, Cancelled };
}

/// <summary>A QR-coded inventory/item in the project store-room.</summary>
[Table("qr_inventory_items")]
public class QrInventoryItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = "";
    public string? Category { get; set; }
    public string? Unit { get; set; }
    public double QtyOnHand { get; set; }
    public double? MinStock { get; set; }
    public string? Location { get; set; }
    public string? SupplierName { get; set; }
    public double? UnitPrice { get; set; }
    public string? Barcode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>A scan/event against a QR inventory item.</summary>
[Table("qr_inventory_scans")]
public class QrInventoryScan
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ItemId { get; set; }
    public int ProjectId { get; set; }
    public string ItemName { get; set; } = "";
    public string Action { get; set; } = QrScanActions.In;
    public double Quantity { get; set; }
    public string? Note { get; set; }
    public string? ScannedBy { get; set; }
    public DateTime ScannedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string DateLabel => ScannedAt.ToString("dd MMM, hh:mm tt");
    [Ignore] public string ActionColor => Action == QrScanActions.Out ? "text-red-600" : "text-emerald-600";
}

public static class QrScanActions
{
    public const string In = "IN";
    public const string Out = "OUT";
    public static readonly string[] All = { In, Out };
}

/// <summary>Predicted/projected cost for a project/room using AI regression.</summary>
[Table("ai_cost_predictions")]
public class AiCostPrediction
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string Model { get; set; } = "regression";
    public double PredictedCost { get; set; }
    public double? ConfidenceLow { get; set; }
    public double? ConfidenceHigh { get; set; }
    public double? ActualCost { get; set; }
    public string? FeatureJson { get; set; }
    public DateTime PredictedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ActualisedAt { get; set; }

    [Ignore] public string PredictedLabel => Services.ReportService.Money(PredictedCost);
    [Ignore] public string ConfidenceLabel => ConfidenceLow.HasValue && ConfidenceHigh.HasValue ? $"₹{ConfidenceLow:0}–₹{ConfidenceHigh:0}" : "—";
    [Ignore] public string ResidualLabel => ActualCost.HasValue ? Services.ReportService.Money(ActualCost.Value - PredictedCost) : "—";
}

/// <summary>End-of-day AI-generated summary for a project.</summary>
[Table("ai_daily_summaries")]
public class AiDailySummary
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public DateTime ForDate { get; set; } = DateTime.Today;
    public string? Summary { get; set; }
    public string? HighlightsJson { get; set; }
    public string? RisksJson { get; set; }
    public string? SuggestionsJson { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public bool IsConfigured { get; set; }

    [Ignore] public string DateLabel => ForDate.ToString("dd MMM, yy");
}

/// <summary>Lights/fixtures placed on a room's electrical layout.</summary>
[Table("lighting_layouts")]
public class LightingLayout
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string Name { get; set; } = "";
    public string? Type { get; set; }
    public double? Wattage { get; set; }
    public double? Voltage { get; set; }
    public double? Quantity { get; set; }
    public double? X { get; set; }
    public double? Y { get; set; }
    public string? Circuit { get; set; }
    public string? Notes { get; set; }

    [Ignore] public string WattageLabel => Wattage.HasValue ? $"{Wattage} W" : "—";
}

/// <summary>Finish/material swatch library (fabrics, tiles, laminates, paints).</summary>
[Table("finish_library")]
public class FinishSwatch
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Category { get; set; }
    public string? Manufacturer { get; set; }
    public string? ColorCode { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? SpecJson { get; set; }
    public double? Price { get; set; }
    public string? Unit { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string PriceLabel => Price.HasValue ? Services.ReportService.Money(Price.Value) : "—";
}

/// <summary>Quotation line item tied to a room.</summary>
[Table("quotation_rooms")]
public class QuotationRoom
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string RoomName { get; set; } = "";
    public string? Description { get; set; }
    public double? Amount { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsOptional { get; set; }

    [Ignore] public string AmountLabel => Amount.HasValue ? Services.ReportService.Money(Amount.Value) : "—";
}

/// <summary>Tenant/designer payout per project/room.</summary>
[Table("designer_payouts")]
public class DesignerPayout
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public int DesignerId { get; set; }
    public string DesignerName { get; set; } = "";
    public string? RoomId { get; set; }
    public string Stage { get; set; } = PayoutStages.Completion;
    public double GrossAmount { get; set; }
    public double? RetentionAmount { get; set; }
    public double? NetAmount { get; set; }
    public string Status { get; set; } = PayoutStatuses.Pending;
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string GrossLabel => Services.ReportService.Money(GrossAmount);
    [Ignore] public string NetLabel => NetAmount.HasValue ? Services.ReportService.Money(NetAmount.Value) : Services.ReportService.Money(GrossAmount);
}

public static class PayoutStages
{
    public const string Design = "Design";
    public const string Procurement = "Procurement";
    public const string Installation = "Installation";
    public const string Completion = "Completion";
    public static readonly string[] All = { Design, Procurement, Installation, Completion };
}

public static class PayoutStatuses
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Held = "Held";
    public static readonly string[] All = { Pending, Paid, Held };
}

/// <summary>Client-facing project with a shareable access token for the client portal.</summary>
[Table("client_projects")]
public class ClientProject
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = "";
    public string ClientName { get; set; } = "";
    public string? ClientEmail { get; set; }
    public string? ClientPhone { get; set; }
    public string? AccessToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string ExpiryLabel => ExpiresAt.HasValue ? ExpiresAt.Value.ToString("dd MMM, yy") : "Never";
    [Ignore] public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
}

/// <summary>Selection (material choice) made by the client for a room.</summary>
[Table("client_selections")]
public class ClientSelection
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string Category { get; set; } = "";
    public string ItemName { get; set; } = "";
    public string? ImageUrl { get; set; }
    public double? Price { get; set; }
    public string? Notes { get; set; }
    public string? ApprovalStatus { get; set; } = ClientSelectionStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }

    [Ignore] public string PriceLabel => Price.HasValue ? Services.ReportService.Money(Price.Value) : "—";
}

public static class ClientSelectionStatus
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public static readonly string[] All = { Pending, Approved, Rejected };
}

/// <summary>Room-wise BOQ item.</summary>
[Table("room_boq_items")]
public class RoomBoqItem
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string RoomName { get; set; } = "";
    public string ItemName { get; set; } = "";
    public string? Category { get; set; }
    public double Quantity { get; set; }
    public string Unit { get; set; } = "Pcs";
    public double Rate { get; set; }
    public string? Notes { get; set; }
    public string? VendorName { get; set; }
    public double? ActualCost { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string RateLabel => Services.ReportService.Money(Rate);
    [Ignore] public string TotalLabel => Services.ReportService.Money(Rate * Quantity);
    [Ignore] public string ActualTotalLabel => ActualCost.HasValue ? Services.ReportService.Money(ActualCost.Value) : "—";
}

/// <summary>Installation milestone/task per room/trade.</summary>
[Table("installation_tasks")]
public class InstallationTask
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string Trade { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = InstallationTaskStatus.Pending;
    public double DurationDays { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? PredecessorId { get; set; }
    public string? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string DateRangeLabel => (StartDate, EndDate) is var (s, e) && s.HasValue && e.HasValue ? $"{s:dd MMM}–{e:dd MMM}" : "—";
}

public static class InstallationTaskStatus
{
    public const string Pending = "Pending";
    public const string Ongoing = "Ongoing";
    public const string Completed = "Completed";
    public const string Blocked = "Blocked";
    public static readonly string[] All = { Pending, Ongoing, Completed, Blocked };
}

/// <summary>Procurement order (PO) grouped by room.</summary>
[Table("room_procurement_orders")]
public class RoomProcurementOrder
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string VendorName { get; set; } = "";
    public string? VendorPhone { get; set; }
    public string? ExpectedDel { get; set; }
    public string Status { get; set; } = ProcurementOrderStatus.Pending;
    public string? ItemsJson { get; set; }
    public double? TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? PoNumber { get; set; }

    [Ignore] public string TotalLabel => TotalAmount.HasValue ? Services.ReportService.Money(TotalAmount.Value) : "—";
}

public static class ProcurementOrderStatus
{
    public const string Pending = "Pending";
    public const string Ordered = "Ordered";
    public const string Received = "Received";
    public const string Cancelled = "Cancelled";
    public static readonly string[] All = { Pending, Ordered, Received, Cancelled };
}

/// <summary>Project timeline stage (design → procurement → install → handoff).</summary>
[Table("project_timelines")]
public class ProjectTimelineStage
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Stage { get; set; } = TimelineStages.Design;
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public double ProgressPct { get; set; }
    public DateTime StartDate { get; set; } = DateTime.Today;
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }

    [Ignore] public string PctLabel => $"{ProgressPct:0}%";
}

public static class TimelineStages
{
    public const string Design = "Design";
    public const string Procurement = "Procurement";
    public const string Installation = "Installation";
    public const string Handoff = "Handoff";
    public static readonly string[] All = { Design, Procurement, Installation, Handoff };
}

/// <summary>AR/LiDAR site measurement record.</summary>
[Table("ar_measurements")]
public class ArMeasurement
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? RoomId { get; set; }
    public string? ScanJson { get; set; }
    public double? AreaSqFt { get; set; }
    public double? Perimeter { get; set; }
    public double? Volume { get; set; }
    public string? Notes { get; set; }
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
    public string? ModelUrl { get; set; }

    [Ignore] public string AreaLabel => AreaSqFt.HasValue ? $"{AreaSqFt:0.##} sqft" : "—";
}

/// <summary>Resource allocation — workers and materials assigned to a project with capacity tracking.</summary>
[Table("resource_allocations")]
public class ResourceAllocation
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Type { get; set; } = ResourceTypes.Worker;   // Worker | Material
    public string Name { get; set; } = "";                             // worker name or material name
    public string? Designation { get; set; }                           // role / trade for workers
    public double Capacity { get; set; }                               // max units per day (hours for worker, qty for material)
    public double Allocated { get; set; }                              // currently allocated units
    public string? Unit { get; set; }                                  // hrs / pcs / kg etc
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public double UtilizationPct => Capacity > 0 ? Math.Min(100, (Allocated / Capacity) * 100) : 0;
    [Ignore] public string UtilLabel => $"{Allocated:0.##} / {Capacity:0.##}";
}

public static class ResourceTypes
{
    public const string Worker = "Worker";
    public const string Material = "Material";
    public static readonly string[] All = { Worker, Material };
}

/// <summary>Change order — formal change request with approval workflow and billing linkage.</summary>
[Table("change_orders")]
public class ChangeOrder
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public double Amount { get; set; }
    public string Status { get; set; } = ChangeOrderStatus.Draft;   // Draft | Submitted | Approved | Rejected | Billed
    public string? RequestedBy { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? LinkedTxnId { get; set; }                           // links to a BizTxn once billed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Ignore] public string AmountLabel => Services.ReportService.Money(Amount);
}

public static class ChangeOrderStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Billed = "Billed";
    public static readonly string[] All = { Draft, Submitted, Approved, Rejected, Billed };
}

/// <summary>Equipment maintenance schedule and service history.</summary>
[Table("equipment_maintenances")]
public class EquipmentMaintenance
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public int? EquipmentLogId { get; set; }                        // nullable for equipment not tracked via EquipmentLog
    public string EquipmentName { get; set; } = "";
    public string MaintType { get; set; } = MaintTypes.Service;   // Service | Repair
    public string? Description { get; set; }
    public double Cost { get; set; }
    public string? Vendor { get; set; }
    public DateTime ScheduledDate { get; set; } = DateTime.Today;
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = MaintStatuses.Scheduled;   // Scheduled | Completed | Overdue
    public string? Notes { get; set; }

    [Ignore] public string StatusColor => Status switch
    {
        MaintStatuses.Scheduled => "bg-blue-500",
        MaintStatuses.Completed => "bg-green-500",
        MaintStatuses.Overdue => "bg-red-500",
        _ => "bg-gray-500"
    };
    [Ignore] public string CostLabel => Services.ReportService.Money(Cost);
}

public static class MaintTypes
{
    public const string Service = "Service";
    public const string Repair = "Repair";
    public static readonly string[] All = { Service, Repair };
}

public static class MaintStatuses
{
    public const string Scheduled = "Scheduled";
    public const string Completed = "Completed";
    public const string Overdue = "Overdue";
    public static readonly string[] All = { Scheduled, Completed, Overdue };
}
