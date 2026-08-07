using LuxInfra.Models;
using SQLite;

namespace LuxInfra.Services;

/// <summary>
/// Backs the "Projects" module (construction/interior-design job tracking: parties,
/// tasks and payments per project) — separate from the general billing ledger.
/// </summary>
public class ProjectService
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public ProjectService(DatabaseService db) => _db = db;

    private async Task<SQLiteAsyncConnection> Conn()
    {
        var conn = await _db.GetConnectionAsync();
        if (!_initialized)
        {
            await conn.CreateTableAsync<Project>();
            await conn.CreateTableAsync<SiteParty>();
            await conn.CreateTableAsync<ProjectTask>();
            await conn.CreateTableAsync<ProjectTxn>();
            await conn.CreateTableAsync<AttendanceRecord>();
            await conn.CreateTableAsync<MaterialTxn>();
            await conn.CreateTableAsync<SiteLog>();
            await conn.CreateTableAsync<MeetingMinute>();
            await conn.CreateTableAsync<DesignFile>();
            await conn.CreateTableAsync<ProjectFolder>();
            await conn.CreateTableAsync<ProjectFile>();
            _initialized = true;
        }
        return conn;
    }

    // ---------- projects ----------

    public async Task<List<Project>> GetProjectsAsync()
    {
        var conn = await Conn();
        return await conn.Table<Project>().OrderByDescending(p => p.Id).ToListAsync();
    }

    public async Task<Project?> GetProjectAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<Project>(id);
    }

    public async Task SaveProjectAsync(Project p)
    {
        var conn = await Conn();
        if (p.Id == 0) await conn.InsertAsync(p);
        else await conn.UpdateAsync(p);
    }

    public async Task DeleteProjectAsync(int id)
    {
        var conn = await Conn();
        await conn.Table<Project>().DeleteAsync(p => p.Id == id);
        await conn.Table<SiteParty>().DeleteAsync(p => p.ProjectId == id);
        await conn.Table<ProjectTask>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<ProjectTxn>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<AttendanceRecord>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<MaterialTxn>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<SiteLog>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<MeetingMinute>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<DesignFile>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<ProjectFolder>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<ProjectFile>().DeleteAsync(t => t.ProjectId == id);
    }

    // ---------- parties ----------

    public async Task<List<SiteParty>> GetPartiesAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<SiteParty>().Where(p => p.ProjectId == projectId).OrderBy(p => p.Name).ToListAsync();
    }

    public async Task<SiteParty?> FindPartyByNameAsync(int projectId, string name)
    {
        var parties = await GetPartiesAsync(projectId);
        return parties.FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task SavePartyAsync(SiteParty p)
    {
        var conn = await Conn();
        if (p.Id == 0)
        {
            p.CurrentBalance = p.BalanceType == "advance" ? p.OpeningBalance : -p.OpeningBalance;
            await conn.InsertAsync(p);
        }
        else await conn.UpdateAsync(p);
    }

    // ---------- tasks ----------

    public async Task<List<ProjectTask>> GetTasksAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectTask>().Where(t => t.ProjectId == projectId).OrderBy(t => t.StartDate).ToListAsync();
    }

    public async Task SaveTaskAsync(ProjectTask t)
    {
        var conn = await Conn();
        if (t.Id == 0) await conn.InsertAsync(t);
        else await conn.UpdateAsync(t);
    }

    // ---------- transactions ----------

    public async Task<List<ProjectTxn>> GetTxnsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectTxn>().Where(t => t.ProjectId == projectId).OrderByDescending(t => t.Id).ToListAsync();
    }

    /// <summary>Records the payment and reflects it on the party's advance/pending balance.</summary>
    public async Task SaveTxnAsync(ProjectTxn txn, SiteParty party)
    {
        var conn = await Conn();
        await conn.InsertAsync(txn);

        party.CurrentBalance += txn.Type == ProjectTxnTypes.PaymentOut ? txn.Amount : -txn.Amount;
        await conn.UpdateAsync(party);
    }

    // ---------- attendance ----------

    public async Task<List<AttendanceRecord>> GetAttendanceForDateAsync(int projectId, DateTime date)
    {
        var conn = await Conn();
        var day = date.Date;
        return await conn.Table<AttendanceRecord>()
            .Where(a => a.ProjectId == projectId && a.Date == day).ToListAsync();
    }

    /// <summary>Upserts today's (or the given date's) attendance row for a party.</summary>
    public async Task SetAttendanceStatusAsync(int projectId, SiteParty party, DateTime date, string status)
    {
        var conn = await Conn();
        var day = date.Date;
        var existing = (await conn.Table<AttendanceRecord>()
            .Where(a => a.ProjectId == projectId && a.PartyId == party.Id && a.Date == day).ToListAsync())
            .FirstOrDefault();

        if (existing is null)
            await conn.InsertAsync(new AttendanceRecord
            {
                ProjectId = projectId,
                PartyId = party.Id,
                PartyName = party.Name,
                Date = day,
                Status = status
            });
        else
        {
            existing.Status = status;
            await conn.UpdateAsync(existing);
        }
    }

    public async Task SetAttendanceHoursAsync(int projectId, SiteParty party, DateTime date, double hours)
    {
        var conn = await Conn();
        var day = date.Date;
        var existing = (await conn.Table<AttendanceRecord>()
            .Where(a => a.ProjectId == projectId && a.PartyId == party.Id && a.Date == day).ToListAsync())
            .FirstOrDefault();

        if (existing is null)
            await conn.InsertAsync(new AttendanceRecord
            {
                ProjectId = projectId,
                PartyId = party.Id,
                PartyName = party.Name,
                Date = day,
                Status = AttendanceStatuses.Present,
                HoursLogged = hours
            });
        else
        {
            existing.HoursLogged = hours;
            await conn.UpdateAsync(existing);
        }
    }

    // ---------- material ----------

    public async Task<List<MaterialTxn>> GetMaterialTxnsAsync(int projectId, string? kind = null)
    {
        var conn = await Conn();
        var all = await conn.Table<MaterialTxn>().Where(m => m.ProjectId == projectId).OrderByDescending(m => m.Id).ToListAsync();
        return kind is null ? all : all.Where(m => m.Kind == kind).ToList();
    }

    public async Task SaveMaterialTxnAsync(MaterialTxn m)
    {
        var conn = await Conn();
        await conn.InsertAsync(m);
    }

    /// <summary>Current stock per material = Received − Delivered, across all recorded transactions.</summary>
    public async Task<List<(string Material, double Qty, string Unit)>> GetInventoryAsync(int projectId)
    {
        var all = await GetMaterialTxnsAsync(projectId);
        return all.GroupBy(m => m.MaterialName)
            .Select(g => (
                Material: g.Key,
                Qty: g.Where(m => m.Kind == MaterialTxnKinds.Received).Sum(m => m.Quantity)
                   - g.Where(m => m.Kind == MaterialTxnKinds.Delivered).Sum(m => m.Quantity),
                Unit: g.First().Unit))
            .Where(x => x.Qty != 0)
            .OrderBy(x => x.Material)
            .ToList();
    }

    // ---------- site logs (DPR) ----------

    public async Task<List<SiteLog>> GetSiteLogsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<SiteLog>().Where(s => s.ProjectId == projectId).OrderByDescending(s => s.Id).ToListAsync();
    }

    public async Task SaveSiteLogAsync(SiteLog log)
    {
        var conn = await Conn();
        await conn.InsertAsync(log);
    }

    // ---------- MOM ----------

    public async Task<List<MeetingMinute>> GetMeetingMinutesAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<MeetingMinute>().Where(m => m.ProjectId == projectId).OrderByDescending(m => m.Id).ToListAsync();
    }

    public async Task SaveMeetingMinuteAsync(MeetingMinute m)
    {
        var conn = await Conn();
        await conn.InsertAsync(m);
    }

    // ---------- design ----------

    public async Task<List<DesignFile>> GetDesignFilesAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<DesignFile>().Where(d => d.ProjectId == projectId).OrderByDescending(d => d.Id).ToListAsync();
    }

    public async Task SaveDesignFileAsync(DesignFile d)
    {
        var conn = await Conn();
        await conn.InsertAsync(d);
    }

    // ---------- files ----------

    public async Task<List<ProjectFolder>> GetFoldersAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectFolder>().Where(f => f.ProjectId == projectId).OrderBy(f => f.Name).ToListAsync();
    }

    public async Task<ProjectFolder> AddFolderAsync(int projectId, string name)
    {
        var conn = await Conn();
        var folder = new ProjectFolder { ProjectId = projectId, Name = name };
        await conn.InsertAsync(folder);
        return folder;
    }

    public async Task<List<ProjectFile>> GetFilesAsync(int folderId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectFile>().Where(f => f.FolderId == folderId).OrderByDescending(f => f.Id).ToListAsync();
    }

    public async Task AddFileAsync(int projectId, int folderId, string fileName, string filePath)
    {
        var conn = await Conn();
        await conn.InsertAsync(new ProjectFile { ProjectId = projectId, FolderId = folderId, FileName = fileName, FilePath = filePath });
    }
}
