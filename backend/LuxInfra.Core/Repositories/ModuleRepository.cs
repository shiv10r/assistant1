using LuxInfra.Models;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Repositories;

/// <summary>Generic persistence for the lightweight business modules (contracts, milestones,
/// vendor price book, equipment, fuel, snags, contractor ratings).</summary>
public interface IModuleRepository
{
    Task<List<T>> AllAsync<T>() where T : class, new();
    Task<T?> GetAsync<T>(int id) where T : class, new();
    Task SaveAsync<T>(T item) where T : class, new();
    Task DeleteAsync<T>(int id) where T : class, new();
}

public class ModuleRepository : IModuleRepository
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public ModuleRepository(DatabaseService db) => _db = db;

    private async Task<SQLiteAsyncConnection> Conn()
    {
        var conn = await _db.GetConnectionAsync();
        if (!_initialized)
        {
            await conn.CreateTableAsync<SiteContract>();
            await conn.CreateTableAsync<ContractMilestone>();
            await conn.CreateTableAsync<VendorPrice>();
            await conn.CreateTableAsync<EquipmentLog>();
            await conn.CreateTableAsync<FuelLog>();
            await conn.CreateTableAsync<Snag>();
            await conn.CreateTableAsync<ContractorRating>();
            await conn.CreateTableAsync<Broadcast>();
            _initialized = true;
        }
        return conn;
    }

    public async Task<List<T>> AllAsync<T>() where T : class, new()
    {
        var conn = await Conn();
        return await conn.Table<T>().ToListAsync();
    }

    public async Task<T?> GetAsync<T>(int id) where T : class, new()
    {
        var conn = await Conn();
        return await conn.FindAsync<T>(id);
    }

    public async Task SaveAsync<T>(T item) where T : class, new()
    {
        var conn = await Conn();
        var id = item.GetType().GetProperty("Id")?.GetValue(item) is int i && i > 0;
        if (id) await conn.UpdateAsync(item);
        else await conn.InsertAsync(item);
    }

    public async Task DeleteAsync<T>(int id) where T : class, new()
    {
        var conn = await Conn();
        await conn.DeleteAsync<T>(id);
    }
}
