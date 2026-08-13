using LuxInfra.Models;

namespace LuxInfra.Services;

/// <summary>Business layer for the projects module (construction/interior-design job tracking).</summary>
public interface IProjectService
{
    Task<List<Project>> GetProjectsAsync();
    Task<Project?> GetProjectAsync(int id);
    Task SaveProjectAsync(Project p);
    Task DeleteProjectAsync(int id);

    Task<List<SiteParty>> GetPartiesAsync(int projectId);
    Task<SiteParty?> FindPartyByNameAsync(int projectId, string name);
    Task SavePartyAsync(SiteParty p);

    Task<List<ProjectTask>> GetTasksAsync(int projectId);
    Task SaveTaskAsync(ProjectTask t);

    Task<List<ProjectTxn>> GetTxnsAsync(int projectId);
    Task SaveTxnAsync(ProjectTxn txn, SiteParty party);

    Task<List<AttendanceRecord>> GetAttendanceForDateAsync(int projectId, DateTime date);
    Task<List<AttendanceRecord>> GetAttendanceInRangeAsync(int projectId, DateTime from, DateTime to);
    Task SetAttendanceStatusAsync(int projectId, SiteParty party, DateTime date, string status);
    Task SetAttendanceHoursAsync(int projectId, SiteParty party, DateTime date, double hours);

    Task<AttendancePunch> PunchAsync(Project project, SiteParty party, AttendancePunch punch);
    Task<List<AttendancePunch>> GetPunchesAsync(int projectId, DateTime? date);

    Task<AttendanceRequest> SubmitRequestAsync(int projectId, SiteParty party, AttendanceRequest req);
    Task<List<AttendanceRequest>> GetRequestsAsync(int projectId);
    Task<AttendanceRequest?> DecideRequestAsync(int projectId, int requestId, string status, string? decidedBy);

    Task<EmergencyAlert> TriggerEmergencyAsync(Project project, SiteParty party, EmergencyAlert alert);
    Task<List<EmergencyAlert>> GetEmergencyAlertsAsync(int projectId);

    Task<List<MaterialTxn>> GetMaterialTxnsAsync(int projectId, string? kind = null);
    Task SaveMaterialTxnAsync(MaterialTxn m);
    Task<List<(string Material, double Qty, string Unit)>> GetInventoryAsync(int projectId);

    Task<List<SiteLog>> GetSiteLogsAsync(int projectId);
    Task SaveSiteLogAsync(SiteLog log);

    Task<List<MeetingMinute>> GetMeetingMinutesAsync(int projectId);
    Task SaveMeetingMinuteAsync(MeetingMinute m);

    Task<List<DesignFile>> GetDesignFilesAsync(int projectId);
    Task SaveDesignFileAsync(DesignFile d);

    Task<List<ProjectFolder>> GetFoldersAsync(int projectId);
    Task<ProjectFolder> AddFolderAsync(int projectId, string name);

    Task<List<ProjectFile>> GetFilesAsync(int folderId);
    Task AddFileAsync(int projectId, int folderId, string fileName, string filePath);

    Task<List<FileBlob>> GetUploadsAsync(int projectId, string? category = null);
    Task<FileBlob?> GetUploadAsync(int id);
    Task<FileBlob> SaveUploadAsync(FileBlob blob);
    Task DeleteUploadAsync(int id);
}
