using LuxInfra.Models;

namespace LuxInfra.Services;

/// <summary>Business layer for the audit trail (activity log).</summary>
public interface IActivityService
{
    Task LogAsync(string action, string detail, string source = "web");
    Task<List<ActivityLog>> GetRecentAsync(int count = 100);
}
