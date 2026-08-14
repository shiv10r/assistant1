using LuxInfra.Models;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Repositories;

/// <summary>Generic persistence for the lightweight business modules (contracts, milestones,
/// vendor price book, equipment, fuel, snags, contractor ratings).</summary>
public interface IModuleRepository
{
    Task<List<T>> AllAsync<T>() where T : class, new();
    Task<List<T>> AllFilteredAsync<T>(int? projectId) where T : class, new();
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
            await conn.CreateTableAsync<TimeEntry>();
            await conn.CreateTableAsync<Room>();
            await conn.CreateTableAsync<MoodBoardItem>();
            await conn.CreateTableAsync<VendorCatalogueItem>();
            await conn.CreateTableAsync<RoomScene>();
            await conn.CreateTableAsync<DesignRevision>();
            await conn.CreateTableAsync<DesignComment>();
            await conn.CreateTableAsync<ChecklistTemplate>();
            await conn.CreateTableAsync<ChecklistItem>();
            await conn.CreateTableAsync<InspectionRecord>();
            await conn.CreateTableAsync<NcrRecord>();
            await conn.CreateTableAsync<SubcontractorWorkOrder>();
            await conn.CreateTableAsync<QrInventoryItem>();
            await conn.CreateTableAsync<QrInventoryScan>();
            await conn.CreateTableAsync<AiCostPrediction>();
            await conn.CreateTableAsync<AiDailySummary>();
            await conn.CreateTableAsync<LightingLayout>();
            await conn.CreateTableAsync<FinishSwatch>();
            await conn.CreateTableAsync<QuotationRoom>();
            await conn.CreateTableAsync<DesignerPayout>();
            await conn.CreateTableAsync<ClientProject>();
            await conn.CreateTableAsync<ClientSelection>();
            await conn.CreateTableAsync<RoomBoqItem>();
            await conn.CreateTableAsync<InstallationTask>();
            await conn.CreateTableAsync<RoomProcurementOrder>();
            await conn.CreateTableAsync<ProjectTimelineStage>();
            await conn.CreateTableAsync<ArMeasurement>();
            await conn.CreateTableAsync<ResourceAllocation>();
            await conn.CreateTableAsync<ChangeOrder>();
            await conn.CreateTableAsync<EquipmentMaintenance>();
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

    /// <summary>Returns all rows, optionally filtered by the ProjectId property of T (if present).</summary>
    public async Task<List<T>> AllFilteredAsync<T>(int? projectId) where T : class, new()
    {
        var conn = await Conn();
        if (projectId is > 0 && typeof(T).GetProperty("ProjectId") is not null)
        {
            return await conn.Table<T>().Where(BuildProjectFilter<T>(projectId.Value)).ToListAsync();
        }
        return await conn.Table<T>().ToListAsync();
    }

    private static System.Linq.Expressions.Expression<Func<T, bool>> BuildProjectFilter<T>(int projectId)
    {
        var param = System.Linq.Expressions.Expression.Parameter(typeof(T), "x");
        var prop = typeof(T).GetProperty("ProjectId")!;
        return System.Linq.Expressions.Expression.Lambda<Func<T, bool>>(
            System.Linq.Expressions.Expression.Equal(
                System.Linq.Expressions.Expression.Property(param, prop),
                System.Linq.Expressions.Expression.Constant(projectId)),
            param);
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
