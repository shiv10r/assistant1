using LuxInfra.Models;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public ProjectRepository(DatabaseService db) => _db = db;

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
            await conn.CreateTableAsync<AttendancePunch>();
            await conn.CreateTableAsync<AttendanceRequest>();
            await conn.CreateTableAsync<EmergencyAlert>();
            await conn.CreateTableAsync<MaterialTxn>();
            await conn.CreateTableAsync<SiteLog>();
            await conn.CreateTableAsync<MeetingMinute>();
            await conn.CreateTableAsync<DesignFile>();
            await conn.CreateTableAsync<ProjectFolder>();
            await conn.CreateTableAsync<ProjectFile>();
            await conn.CreateTableAsync<FileBlob>();
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

    public async Task InsertProjectAsync(Project p)
    {
        var conn = await Conn();
        await conn.InsertAsync(p);
    }

    public async Task UpdateProjectAsync(Project p)
    {
        var conn = await Conn();
        await conn.UpdateAsync(p);
    }

    public async Task DeleteProjectDataAsync(int id)
    {
        var conn = await Conn();
        await conn.Table<Project>().DeleteAsync(p => p.Id == id);
        await conn.Table<SiteParty>().DeleteAsync(p => p.ProjectId == id);
        await conn.Table<ProjectTask>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<ProjectTxn>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<AttendanceRecord>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<AttendancePunch>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<AttendanceRequest>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<EmergencyAlert>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<MaterialTxn>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<SiteLog>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<MeetingMinute>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<DesignFile>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<ProjectFolder>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<ProjectFile>().DeleteAsync(t => t.ProjectId == id);
        await conn.Table<FileBlob>().DeleteAsync(t => t.ProjectId == id);
    }

    // ---------- parties ----------

    public async Task InsertPartyAsync(SiteParty p)
    {
        var conn = await Conn();
        await conn.InsertAsync(p);
    }

    public async Task UpdatePartyAsync(SiteParty p)
    {
        var conn = await Conn();
        await conn.UpdateAsync(p);
    }

    public async Task<List<SiteParty>> GetPartiesAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<SiteParty>().Where(p => p.ProjectId == projectId).OrderBy(p => p.Name).ToListAsync();
    }

    // ---------- tasks ----------

    public async Task InsertTaskAsync(ProjectTask t)
    {
        var conn = await Conn();
        await conn.InsertAsync(t);
    }

    public async Task UpdateTaskAsync(ProjectTask t)
    {
        var conn = await Conn();
        await conn.UpdateAsync(t);
    }

    public async Task<List<ProjectTask>> GetTasksAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectTask>().Where(t => t.ProjectId == projectId).OrderBy(t => t.StartDate).ToListAsync();
    }

    // ---------- transactions ----------

    public async Task InsertTxnAsync(ProjectTxn txn)
    {
        var conn = await Conn();
        await conn.InsertAsync(txn);
    }

    public async Task<List<ProjectTxn>> GetTxnsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectTxn>().Where(t => t.ProjectId == projectId).OrderByDescending(t => t.Id).ToListAsync();
    }

    // ---------- attendance ----------

    public async Task<List<AttendanceRecord>> GetAttendanceForDateAsync(int projectId, DateTime date)
    {
        var conn = await Conn();
        var day = date.Date;
        return await conn.Table<AttendanceRecord>()
            .Where(a => a.ProjectId == projectId && a.Date == day).ToListAsync();
    }

    public async Task<List<AttendanceRecord>> GetAttendanceInRangeAsync(int projectId, DateTime from, DateTime to)
    {
        var conn = await Conn();
        var start = from.Date;
        var end = to.Date.AddDays(1);
        return await conn.Table<AttendanceRecord>()
            .Where(a => a.ProjectId == projectId && a.Date >= start && a.Date < end)
            .ToListAsync();
    }

    public async Task<AttendanceRecord?> GetAttendanceAsync(int projectId, int partyId, DateTime date)
    {
        var conn = await Conn();
        var day = date.Date;
        return (await conn.Table<AttendanceRecord>()
            .Where(a => a.ProjectId == projectId && a.PartyId == partyId && a.Date == day).ToListAsync())
            .FirstOrDefault();
    }

    public async Task InsertAttendanceAsync(AttendanceRecord r)
    {
        var conn = await Conn();
        await conn.InsertAsync(r);
    }

    public async Task UpdateAttendanceAsync(AttendanceRecord r)
    {
        var conn = await Conn();
        await conn.UpdateAsync(r);
    }

    public async Task InsertAttendancePunchAsync(AttendancePunch p)
    {
        var conn = await Conn();
        await conn.InsertAsync(p);
    }

    public async Task<List<AttendancePunch>> GetAttendancePunchesInRangeAsync(int projectId, DateTime from, DateTime to)
    {
        var conn = await Conn();
        var start = from.Date;
        var end = to.Date.AddDays(1);
        return await conn.Table<AttendancePunch>()
            .Where(a => a.ProjectId == projectId && a.When >= start && a.When < end)
            .OrderByDescending(a => a.When)
            .ToListAsync();
    }

    public async Task InsertAttendanceRequestAsync(AttendanceRequest r)
    {
        var conn = await Conn();
        await conn.InsertAsync(r);
    }

    public async Task UpdateAttendanceRequestAsync(AttendanceRequest r)
    {
        var conn = await Conn();
        await conn.UpdateAsync(r);
    }

    public async Task<AttendanceRequest?> GetAttendanceRequestAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<AttendanceRequest>(id);
    }

    public async Task<List<AttendanceRequest>> GetAttendanceRequestsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<AttendanceRequest>()
            .Where(r => r.ProjectId == projectId)
            .OrderByDescending(r => r.Id)
            .ToListAsync();
    }

    public async Task InsertEmergencyAlertAsync(EmergencyAlert a)
    {
        var conn = await Conn();
        await conn.InsertAsync(a);
    }

    public async Task<List<EmergencyAlert>> GetEmergencyAlertsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<EmergencyAlert>()
            .Where(a => a.ProjectId == projectId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<EmergencyAlert?> GetEmergencyAlertAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<EmergencyAlert>(id);
    }

    public async Task UpdateEmergencyAlertAsync(EmergencyAlert a)
    {
        var conn = await Conn();
        await conn.UpdateAsync(a);
    }

    // ---------- materials ----------

    public async Task InsertMaterialTxnAsync(MaterialTxn m)
    {
        var conn = await Conn();
        await conn.InsertAsync(m);
    }

    public async Task<List<MaterialTxn>> GetMaterialTxnsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<MaterialTxn>().Where(m => m.ProjectId == projectId).OrderByDescending(m => m.Id).ToListAsync();
    }

    // ---------- site logs ----------

    public async Task InsertSiteLogAsync(SiteLog log)
    {
        var conn = await Conn();
        await conn.InsertAsync(log);
    }

    public async Task<List<SiteLog>> GetSiteLogsAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<SiteLog>().Where(s => s.ProjectId == projectId).OrderByDescending(s => s.Id).ToListAsync();
    }

    // ---------- MOM ----------

    public async Task InsertMeetingMinuteAsync(MeetingMinute m)
    {
        var conn = await Conn();
        await conn.InsertAsync(m);
    }

    public async Task<List<MeetingMinute>> GetMeetingMinutesAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<MeetingMinute>().Where(m => m.ProjectId == projectId).OrderByDescending(m => m.Id).ToListAsync();
    }

    // ---------- design ----------

    public async Task InsertDesignFileAsync(DesignFile d)
    {
        var conn = await Conn();
        await conn.InsertAsync(d);
    }

    public async Task<List<DesignFile>> GetDesignFilesAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<DesignFile>().Where(d => d.ProjectId == projectId).OrderByDescending(d => d.Id).ToListAsync();
    }

    // ---------- files & folders ----------

    public async Task<ProjectFolder> InsertFolderAsync(int projectId, string name)
    {
        var conn = await Conn();
        var folder = new ProjectFolder { ProjectId = projectId, Name = name };
        await conn.InsertAsync(folder);
        return folder;
    }

    public async Task<List<ProjectFolder>> GetFoldersAsync(int projectId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectFolder>().Where(f => f.ProjectId == projectId).OrderBy(f => f.Name).ToListAsync();
    }

    public async Task InsertFileAsync(int projectId, int folderId, string fileName, string filePath)
    {
        var conn = await Conn();
        await conn.InsertAsync(new ProjectFile { ProjectId = projectId, FolderId = folderId, FileName = fileName, FilePath = filePath });
    }

    public async Task<List<ProjectFile>> GetFilesAsync(int folderId)
    {
        var conn = await Conn();
        return await conn.Table<ProjectFile>().Where(f => f.FolderId == folderId).OrderByDescending(f => f.Id).ToListAsync();
    }

    // ---------- uploads ----------

    public async Task<FileBlob> InsertBlobAsync(FileBlob blob)
    {
        var conn = await Conn();
        await conn.InsertAsync(blob);
        return blob;
    }

    public async Task<List<FileBlob>> GetUploadsAsync(int projectId, string? category)
    {
        var conn = await Conn();
        var all = await conn.Table<FileBlob>().Where(b => b.ProjectId == projectId).OrderByDescending(b => b.Id).ToListAsync();
        return category is null ? all : all.Where(b => b.Category == category).ToList();
    }

    public async Task<FileBlob?> GetBlobAsync(int id)
    {
        var conn = await Conn();
        return await conn.FindAsync<FileBlob>(id);
    }

    public async Task DeleteBlobAsync(int id)
    {
        var conn = await Conn();
        await conn.Table<FileBlob>().DeleteAsync(b => b.Id == id);
    }
}
