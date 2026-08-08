using LuxInfra.Models;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Repositories;

/// <summary>Raw data access for the audit trail (activity log).</summary>
public interface IActivityRepository
{
    Task InsertAsync(ActivityLog log);
    Task<List<ActivityLog>> GetRecentAsync(int count);
}

public class ActivityRepository : IActivityRepository
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public ActivityRepository(DatabaseService db) => _db = db;

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

    public async Task InsertAsync(ActivityLog log)
    {
        var conn = await Conn();
        await conn.InsertAsync(log);
    }

    public async Task<List<ActivityLog>> GetRecentAsync(int count)
    {
        var conn = await Conn();
        return await conn.Table<ActivityLog>()
            .OrderByDescending(a => a.Id)
            .Take(count)
            .ToListAsync();
    }
}
