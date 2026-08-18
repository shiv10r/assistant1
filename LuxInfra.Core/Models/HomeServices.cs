using System.Text.Json;
using System.Text.Json.Serialization;
using SQLite;

namespace LuxInfra.Models;

// VSR Home Services Marketplace — SQLite models (doc #115-#119).
// JSON contracts mirror frontend/src/services/home-services/homeServicesData.ts
// exactly (camelCase) so the React app can switch to this API without reshaping.
// Child collections are stored as JSON text columns; the [Ignore] properties
// expose them as arrays to the JSON serializer.

// ---------------------------------------------------------------------------
// Location model (doc #20, #105)
// ---------------------------------------------------------------------------

public class HsLocality
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Pincode { get; set; } = "";
}

[Table("hs_cities")]
public class HsCity
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";

    public string ZonesJson { get; set; } = "[]";
    public string LocalitiesJson { get; set; } = "[]";

    [Ignore, JsonIgnore] public string[] Zones
    {
        get => JsonSerializer.Deserialize<string[]>(ZonesJson) ?? [];
        set => ZonesJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public List<HsLocality> Localities
    {
        get => JsonSerializer.Deserialize<List<HsLocality>>(LocalitiesJson) ?? [];
        set => LocalitiesJson = JsonSerializer.Serialize(value);
    }
}

// ---------------------------------------------------------------------------
// Service catalog (doc #31-#47, #103)
// ---------------------------------------------------------------------------

[Table("hs_categories")]
public class HsCategory
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Tagline { get; set; } = "";
    public string Image { get; set; } = "";
    public string Gradient { get; set; } = "";
}

public class HsPackage
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";              // Basic | Standard | Premium
    public double BasePrice { get; set; }
    public int DurationMins { get; set; }
    public string[] Inclusions { get; set; } = [];
    public string[] Exclusions { get; set; } = [];
}

public class HsAddOn
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public double Price { get; set; }
    public string Category { get; set; } = "";
}

[Table("hs_services")]
public class HsService
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string CategoryId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public double StartingPrice { get; set; }
    public string TimeEstimate { get; set; } = "";
    public bool InspectionRequired { get; set; }
    public string[] Tags { get; set; } = [];
    public bool Active { get; set; } = true;

    public string PackagesJson { get; set; } = "[]";
    public string AddOnsJson { get; set; } = "[]";

    [Ignore] public List<HsPackage> Packages
    {
        get => JsonSerializer.Deserialize<List<HsPackage>>(PackagesJson) ?? [];
        set => PackagesJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public List<HsAddOn> AddOns
    {
        get => JsonSerializer.Deserialize<List<HsAddOn>>(AddOnsJson) ?? [];
        set => AddOnsJson = JsonSerializer.Serialize(value);
    }
}

// ---------------------------------------------------------------------------
// Professional (doc #55-#59, #101)
// ---------------------------------------------------------------------------

[Table("hs_professionals")]
public class HsProfessional
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string CityId { get; set; } = "";
    public string Image { get; set; } = "";
    public string Status { get; set; } = "Active";      // PendingVerification | Active | Suspended
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int CompletedJobs { get; set; }
    public int ExperienceYears { get; set; }
    public string Level { get; set; } = "Standard";     // Standard | Silver | Gold | Elite
    public bool Verified { get; set; }
    public string JoinedAt { get; set; } = "";
    public string Bio { get; set; } = "";

    public string SkillsJson { get; set; } = "[]";      // serviceIds
    public string AreasJson { get; set; } = "[]";       // localityIds

    [Ignore] public string[] Skills
    {
        get => JsonSerializer.Deserialize<string[]>(SkillsJson) ?? [];
        set => SkillsJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public string[] Areas
    {
        get => JsonSerializer.Deserialize<string[]>(AreasJson) ?? [];
        set => AreasJson = JsonSerializer.Serialize(value);
    }
}

// ---------------------------------------------------------------------------
// Coupons / membership (doc #110, #136, #156)
// ---------------------------------------------------------------------------

[Table("hs_coupons")]
public class HsCoupon
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Type { get; set; } = "percent";       // percent | flat
    public double Value { get; set; }
    public double MinOrder { get; set; }
    public double MaxDiscount { get; set; }
    public string ValidUntil { get; set; } = "";
    public string? CategoryId { get; set; }
    public bool Active { get; set; }
}

[Table("hs_memberships")]
public class HsMembership
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public double Price { get; set; }
    public int ValidityMonths { get; set; }
    public double ServiceDiscountPct { get; set; }
    public bool PlatformFeeWaiver { get; set; }
    public bool PrioritySupport { get; set; }

    public string BenefitsJson { get; set; } = "[]";

    [Ignore] public string[] Benefits
    {
        get => JsonSerializer.Deserialize<string[]>(BenefitsJson) ?? [];
        set => BenefitsJson = JsonSerializer.Serialize(value);
    }
}

// ---------------------------------------------------------------------------
// Customer (doc #152)
// ---------------------------------------------------------------------------

[Table("hs_customers")]
public class HsCustomer
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string CityId { get; set; } = "";
    public string? MembershipId { get; set; }
    public string MemberSince { get; set; } = "";
    public int BookingsCount { get; set; }
}

// ---------------------------------------------------------------------------
// Booking (doc #117-#119, #132-#133)
// ---------------------------------------------------------------------------

public class HsBookingHistoryEntry
{
    public string? From { get; set; }
    public string To { get; set; } = "";
    public string ChangedAt { get; set; } = "";
    public string ChangedBy { get; set; } = "";
    public string? Reason { get; set; }
}

[Table("hs_bookings")]
public class HsBooking
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string Number { get; set; } = "";
    public string CustomerId { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string ServiceId { get; set; } = "";
    public string PackageId { get; set; } = "";
    public string CityId { get; set; } = "";
    public string LocalityId { get; set; } = "";
    public string AddressLine { get; set; } = "";
    public string ScheduledStart { get; set; } = "";
    public string ExpectedEnd { get; set; } = "";
    public string Status { get; set; } = "New";         // New | SearchingProvider | AwaitingProvider | Upcoming | OnTheWay | Arrived | InService | WaitingCustomerApproval | PaymentPending | Problem | Completed | Cancelled
    public string? AssignedProfessionalId { get; set; }
    public double OriginalQuote { get; set; }
    public double CurrentQuote { get; set; }
    public string PaymentStatus { get; set; } = "Pending";  // Pending | Paid | Refunded | Failed
    public string PaymentMethod { get; set; } = "UPI";
    public string CustomerNotes { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
    public bool Emergency { get; set; }
    public string? ServiceReport { get; set; }
    public double? AdditionalQuote { get; set; }
    public string AdditionalQuoteStatus { get; set; } = "None";  // None | Requested | Approved | Declined
    public string? ReviewId { get; set; }
    public string? DisputeId { get; set; }

    public string AddOnIdsJson { get; set; } = "[]";
    public string HistoryJson { get; set; } = "[]";
    public string ChecklistJson { get; set; } = "[]";
    public string BeforePhotosJson { get; set; } = "[]";
    public string AfterPhotosJson { get; set; } = "[]";

    [Ignore] public string[] AddOnIds
    {
        get => JsonSerializer.Deserialize<string[]>(AddOnIdsJson) ?? [];
        set => AddOnIdsJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public List<HsBookingHistoryEntry> History
    {
        get => JsonSerializer.Deserialize<List<HsBookingHistoryEntry>>(HistoryJson) ?? [];
        set => HistoryJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public string[] Checklist
    {
        get => JsonSerializer.Deserialize<string[]>(ChecklistJson) ?? [];
        set => ChecklistJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public string[] BeforePhotos
    {
        get => JsonSerializer.Deserialize<string[]>(BeforePhotosJson) ?? [];
        set => BeforePhotosJson = JsonSerializer.Serialize(value);
    }

    [Ignore] public string[] AfterPhotos
    {
        get => JsonSerializer.Deserialize<string[]>(AfterPhotosJson) ?? [];
        set => AfterPhotosJson = JsonSerializer.Serialize(value);
    }
}

// ---------------------------------------------------------------------------
// Reviews / support / disputes / notifications (doc #76-#77, #79-#81, #85)
// ---------------------------------------------------------------------------

[Table("hs_reviews")]
public class HsReview
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string BookingId { get; set; } = "";
    public string CustomerId { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string ProfessionalId { get; set; } = "";
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public string CreatedAt { get; set; } = "";
}

[Table("hs_support_tickets")]
public class HsSupportTicket
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string TicketNumber { get; set; } = "";
    public string CustomerId { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "Open";        // Open | InProgress | Resolved | Closed
    public string Priority { get; set; } = "Medium";    // Low | Medium | High | Critical
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

[Table("hs_disputes")]
public class HsDispute
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string DisputeNumber { get; set; } = "";
    public string BookingId { get; set; } = "";
    public string CustomerId { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string ProfessionalId { get; set; } = "";
    public string Reason { get; set; } = "";
    public string Status { get; set; } = "Open";        // Open | UnderReview | Resolved | Closed
    public string? Resolution { get; set; }
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

[Table("hs_notifications")]
public class HsNotification
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public bool Read { get; set; }
    public string Kind { get; set; } = "system";        // booking | payment | promo | system
}

// ---------------------------------------------------------------------------
// Earnings / payouts / commission (doc #90-#95)
// ---------------------------------------------------------------------------

[Table("hs_earnings")]
public class HsEarning
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string ProfessionalId { get; set; } = "";
    public string BookingId { get; set; } = "";
    public string BookingNumber { get; set; } = "";
    public double GrossAmount { get; set; }
    public double CommissionPct { get; set; }
    public double CommissionAmount { get; set; }
    public double EarningAmount { get; set; }
    public string Status { get; set; } = "Eligible";    // Eligible | Paid
    public string CreatedAt { get; set; } = "";
}

[Table("hs_payouts")]
public class HsPayout
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string ProfessionalId { get; set; } = "";
    public double Amount { get; set; }
    public string Status { get; set; } = "Pending";     // Pending | Processing | Paid | Failed
    public string Method { get; set; } = "Bank Transfer";
    public string Reference { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string? PaidAt { get; set; }
}

[Table("hs_commission_rules")]
public class HsCommissionRule
{
    [PrimaryKey, AutoIncrement] public int RowId { get; set; }
    public string Id { get; set; } = "";
    public string? CategoryId { get; set; }
    public double CommissionPct { get; set; }
    public string EffectiveFrom { get; set; } = "";
}

// ---------------------------------------------------------------------------
// Booking status / payment helpers (doc #50, #86-#87)
// ---------------------------------------------------------------------------

public static class HsStatus
{
    public static readonly string[] BookingStates =
        { "New", "SearchingProvider", "AwaitingProvider", "Upcoming", "OnTheWay", "Arrived",
          "InService", "WaitingCustomerApproval", "PaymentPending", "Problem", "Completed", "Cancelled" };

    public static readonly string[] PaymentStates = { "Pending", "Paid", "Refunded", "Failed" };

    public static bool IsActive(string status) =>
        status is not ("Completed" or "Cancelled");
}
