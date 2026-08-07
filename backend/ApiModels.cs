using LuxInfra.Models;

namespace LuxInfra.Api;

public record ParseRequest(string Text);

public record ChatMessageDto(string Text, bool IsUser, string? TimeLabel,
    bool IsReport = false, string? ReportTitle = null,
    List<ReportRow>? Rows = null, string? TotalLabel = null);

public record DashboardDto(double TodayTotal, string TodayLabel,
    double MonthTotal, string MonthLabel,
    double GrandTotal, string GrandTotalLabel,
    int SiteCount, bool IsEmpty,
    List<SiteGroupDto> Groups);

public record SiteGroupDto(string Site, int Count, string TotalLabel, double Total);

public record BillingKpisDto(double YoullGet, double YoullGive, double MonthSale);