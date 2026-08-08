using LuxInfra.Models;
using SQLite;

namespace LuxInfra.Services;

/// <summary>Appends an audit trail of user actions and exposes the recent list.</summary>
public class ActivityService
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public ActivityService(DatabaseService db) => _db = db;

    private async Task<SQLiteAsyncConnection> Conn()
    {
        var conn = await _db.GetConnectionAsync();
        if (!_initialized)
        {
            await conn.CreateTableAsync<ActivityLog>();
            _initialized = true;
        }
        return conn;
    }

    public async Task LogAsync(string action, string detail, string source = "web")
    {
        var conn = await Conn();
        await conn.InsertAsync(new ActivityLog
        {
            Action = action,
            Detail = detail,
            Source = source,
            Timestamp = DateTime.Now
        });
    }

    public async Task<List<ActivityLog>> GetRecentAsync(int count = 100)
    {
        var conn = await Conn();
        return await conn.Table<ActivityLog>()
            .OrderByDescending(a => a.Id)
            .Take(count)
            .ToListAsync();
    }
}
