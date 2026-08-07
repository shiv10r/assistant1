using LuxInfra.Models;
using SQLite;

namespace LuxInfra.Services;

public class DatabaseService
{
    private readonly string _dbPath;
    private SQLiteAsyncConnection? _db;

    public DatabaseService(string dbPath) => _dbPath = dbPath;

    public string DbPath => _dbPath;

    private async Task<SQLiteAsyncConnection> GetDb()
    {
        if (_db is null)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_dbPath)!);
            _db = new SQLiteAsyncConnection(_dbPath,
                SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);
            await _db.CreateTableAsync<ExpenseEntry>();
        }
        return _db;
    }

    /// <summary>Shared connection for other services (billing) that add their own tables.</summary>
    public Task<SQLiteAsyncConnection> GetConnectionAsync() => GetDb();

    public async Task<int> AddAsync(ExpenseEntry entry)
    {
        var db = await GetDb();
        return await db.InsertAsync(entry);
    }

    public async Task<List<ExpenseEntry>> GetAllAsync()
    {
        var db = await GetDb();
        return await db.Table<ExpenseEntry>().OrderBy(e => e.Site).ToListAsync();
    }

    public async Task<List<ExpenseEntry>> GetByDateAsync(DateTime date)
    {
        var db = await GetDb();
        var start = date.Date;
        var end = start.AddDays(1);
        return await db.Table<ExpenseEntry>()
            .Where(e => e.Date >= start && e.Date < end)
            .ToListAsync();
    }

    public async Task<List<ExpenseEntry>> GetSinceAsync(DateTime start)
    {
        var db = await GetDb();
        return await db.Table<ExpenseEntry>()
            .Where(e => e.Date >= start)
            .ToListAsync();
    }

    public async Task<List<ExpenseEntry>> GetBySiteAsync(string site)
    {
        var db = await GetDb();
        var s = site.ToLowerInvariant();
        var all = await db.Table<ExpenseEntry>().ToListAsync();
        return all.Where(e => e.Site.ToLowerInvariant() == s).ToList();
    }

    public async Task<ExpenseEntry?> DeleteLastAsync()
    {
        var db = await GetDb();
        var last = await db.Table<ExpenseEntry>().OrderByDescending(e => e.Id).FirstOrDefaultAsync();
        if (last is not null)
            await db.DeleteAsync(last);
        return last;
    }
}
