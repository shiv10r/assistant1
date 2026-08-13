using LuxInfra.Models;
using LuxInfra.Repositories;

namespace LuxInfra.Services;

/// <summary>Appends an audit trail of user actions and exposes the recent list.</summary>
public class ActivityService : IActivityService
{
    private readonly IActivityRepository _repo;

    public ActivityService(IActivityRepository repo) => _repo = repo;

    public Task LogAsync(string action, string detail, string source = "web")
        => _repo.InsertAsync(new ActivityLog
        {
            Action = action,
            Detail = detail,
            Source = source,
            Timestamp = DateTime.Now
        });

    public Task<List<ActivityLog>> GetRecentAsync(int count = 100)
        => _repo.GetRecentAsync(count);
}
