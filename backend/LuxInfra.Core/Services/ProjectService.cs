using LuxInfra.Models;
using LuxInfra.Repositories;

namespace LuxInfra.Services;

/// <summary>
/// Backs the "Projects" module (construction/interior-design job tracking: parties,
/// tasks and payments per project) — separate from the general billing ledger.
/// Business logic lives here; all persistence is delegated to <see cref="IProjectRepository"/>.
/// </summary>
public class ProjectService : IProjectService
{
    private readonly IProjectRepository _repo;

    public ProjectService(IProjectRepository repo) => _repo = repo;

    // ---------- projects ----------

    public Task<List<Project>> GetProjectsAsync() => _repo.GetProjectsAsync();

    public Task<Project?> GetProjectAsync(int id) => _repo.GetProjectAsync(id);

    public Task SaveProjectAsync(Project p)
        => p.Id == 0 ? _repo.InsertProjectAsync(p) : _repo.UpdateProjectAsync(p);

    public Task DeleteProjectAsync(int id) => _repo.DeleteProjectDataAsync(id);

    // ---------- parties ----------

    public Task<List<SiteParty>> GetPartiesAsync(int projectId) => _repo.GetPartiesAsync(projectId);

    public async Task<SiteParty?> FindPartyByNameAsync(int projectId, string name)
    {
        var parties = await GetPartiesAsync(projectId);
        return parties.FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task SavePartyAsync(SiteParty p)
    {
        if (p.Id == 0)
        {
            p.CurrentBalance = p.BalanceType == "advance" ? p.OpeningBalance : -p.OpeningBalance;
            await _repo.InsertPartyAsync(p);
        }
        else await _repo.UpdatePartyAsync(p);
    }

    // ---------- tasks ----------

    public Task<List<ProjectTask>> GetTasksAsync(int projectId) => _repo.GetTasksAsync(projectId);

    public Task SaveTaskAsync(ProjectTask t)
        => t.Id == 0 ? _repo.InsertTaskAsync(t) : _repo.UpdateTaskAsync(t);

    // ---------- transactions ----------

    public Task<List<ProjectTxn>> GetTxnsAsync(int projectId) => _repo.GetTxnsAsync(projectId);

    /// <summary>Records the payment and reflects it on the party's advance/pending balance.</summary>
    public async Task SaveTxnAsync(ProjectTxn txn, SiteParty party)
    {
        await _repo.InsertTxnAsync(txn);
        party.CurrentBalance += txn.Type == ProjectTxnTypes.PaymentOut ? txn.Amount : -txn.Amount;
        await _repo.UpdatePartyAsync(party);
    }

    // ---------- attendance ----------

    public Task<List<AttendanceRecord>> GetAttendanceForDateAsync(int projectId, DateTime date)
        => _repo.GetAttendanceForDateAsync(projectId, date);

    /// <summary>Upserts today's (or the given date's) attendance row for a party.</summary>
    public async Task SetAttendanceStatusAsync(int projectId, SiteParty party, DateTime date, string status)
    {
        var day = date.Date;
        var existing = await _repo.GetAttendanceAsync(projectId, party.Id, day);
        if (existing is null)
            await _repo.InsertAttendanceAsync(new AttendanceRecord
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
            await _repo.UpdateAttendanceAsync(existing);
        }
    }

    public async Task SetAttendanceHoursAsync(int projectId, SiteParty party, DateTime date, double hours)
    {
        var day = date.Date;
        var existing = await _repo.GetAttendanceAsync(projectId, party.Id, day);
        if (existing is null)
            await _repo.InsertAttendanceAsync(new AttendanceRecord
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
            await _repo.UpdateAttendanceAsync(existing);
        }
    }

    // ---------- material ----------

    public async Task<List<MaterialTxn>> GetMaterialTxnsAsync(int projectId, string? kind = null)
    {
        var all = await _repo.GetMaterialTxnsAsync(projectId);
        return kind is null ? all : all.Where(m => m.Kind == kind).ToList();
    }

    public Task SaveMaterialTxnAsync(MaterialTxn m) => _repo.InsertMaterialTxnAsync(m);

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

    public Task<List<SiteLog>> GetSiteLogsAsync(int projectId) => _repo.GetSiteLogsAsync(projectId);

    public Task SaveSiteLogAsync(SiteLog log) => _repo.InsertSiteLogAsync(log);

    // ---------- MOM ----------

    public Task<List<MeetingMinute>> GetMeetingMinutesAsync(int projectId) => _repo.GetMeetingMinutesAsync(projectId);

    public Task SaveMeetingMinuteAsync(MeetingMinute m) => _repo.InsertMeetingMinuteAsync(m);

    // ---------- design ----------

    public Task<List<DesignFile>> GetDesignFilesAsync(int projectId) => _repo.GetDesignFilesAsync(projectId);

    public Task SaveDesignFileAsync(DesignFile d) => _repo.InsertDesignFileAsync(d);

    // ---------- files ----------

    public Task<List<ProjectFolder>> GetFoldersAsync(int projectId) => _repo.GetFoldersAsync(projectId);

    public Task<ProjectFolder> AddFolderAsync(int projectId, string name) => _repo.InsertFolderAsync(projectId, name);

    public Task<List<ProjectFile>> GetFilesAsync(int folderId) => _repo.GetFilesAsync(folderId);

    public Task AddFileAsync(int projectId, int folderId, string fileName, string filePath)
        => _repo.InsertFileAsync(projectId, folderId, fileName, filePath);

    // ---------- uploads (2D/3D models & files) ----------

    public Task<List<FileBlob>> GetUploadsAsync(int projectId, string? category = null)
        => _repo.GetUploadsAsync(projectId, category);

    public Task<FileBlob?> GetUploadAsync(int id) => _repo.GetBlobAsync(id);

    public Task<FileBlob> SaveUploadAsync(FileBlob blob) => _repo.InsertBlobAsync(blob);

    public Task DeleteUploadAsync(int id) => _repo.DeleteBlobAsync(id);
}
