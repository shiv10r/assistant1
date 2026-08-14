using LuxInfra.Models;

namespace LuxInfra.Repositories;

/// <summary>Raw data access for the projects module (projects, parties, tasks, txns, attendance, materials, logs, MOM, design, files, uploads).</summary>
public interface IProjectRepository
{
    Task<List<Project>> GetProjectsAsync();
    Task<Project?> GetProjectAsync(int id);
    Task InsertProjectAsync(Project p);
    Task UpdateProjectAsync(Project p);
    Task DeleteProjectDataAsync(int id);

    Task InsertPartyAsync(SiteParty p);
    Task UpdatePartyAsync(SiteParty p);
    Task<List<SiteParty>> GetPartiesAsync(int projectId);

    Task InsertTaskAsync(ProjectTask t);
    Task UpdateTaskAsync(ProjectTask t);
    Task<List<ProjectTask>> GetTasksAsync(int projectId);

    Task InsertTxnAsync(ProjectTxn txn);
    Task<List<ProjectTxn>> GetTxnsAsync(int projectId);

    Task<List<AttendanceRecord>> GetAttendanceForDateAsync(int projectId, DateTime date);
    Task<List<AttendanceRecord>> GetAttendanceInRangeAsync(int projectId, DateTime from, DateTime to);
    Task<AttendanceRecord?> GetAttendanceAsync(int projectId, int partyId, DateTime date);
    Task InsertAttendanceAsync(AttendanceRecord r);
    Task UpdateAttendanceAsync(AttendanceRecord r);

    Task InsertAttendancePunchAsync(AttendancePunch p);
    Task<List<AttendancePunch>> GetAttendancePunchesInRangeAsync(int projectId, DateTime from, DateTime to);

    Task InsertAttendanceRequestAsync(AttendanceRequest r);
    Task UpdateAttendanceRequestAsync(AttendanceRequest r);
    Task<AttendanceRequest?> GetAttendanceRequestAsync(int id);
    Task<List<AttendanceRequest>> GetAttendanceRequestsAsync(int projectId);

    Task InsertEmergencyAlertAsync(EmergencyAlert a);
    Task<List<EmergencyAlert>> GetEmergencyAlertsAsync(int projectId);
    Task<EmergencyAlert?> GetEmergencyAlertAsync(int id);
    Task UpdateEmergencyAlertAsync(EmergencyAlert a);

    Task InsertMaterialTxnAsync(MaterialTxn m);
    Task<List<MaterialTxn>> GetMaterialTxnsAsync(int projectId);

    Task InsertSiteLogAsync(SiteLog log);
    Task<List<SiteLog>> GetSiteLogsAsync(int projectId);

    Task InsertMeetingMinuteAsync(MeetingMinute m);
    Task UpdateMeetingMinuteAsync(MeetingMinute m);
    Task DeleteMeetingMinuteAsync(int id);
    Task<List<MeetingMinute>> GetMeetingMinutesAsync(int projectId);

    Task InsertDesignFileAsync(DesignFile d);
    Task<List<DesignFile>> GetDesignFilesAsync(int projectId);

    Task<ProjectFolder> InsertFolderAsync(int projectId, string name);
    Task<List<ProjectFolder>> GetFoldersAsync(int projectId);

    Task InsertFileAsync(int projectId, int folderId, string fileName, string filePath);
    Task UpdateFileAsync(ProjectFile f);
    Task DeleteFileAsync(int id);
    Task DeleteFolderAsync(int folderId);
    Task<List<ProjectFile>> GetFilesAsync(int folderId);

    Task<FileBlob> InsertBlobAsync(FileBlob blob);
    Task<List<FileBlob>> GetUploadsAsync(int projectId, string? category);
    Task<FileBlob?> GetBlobAsync(int id);
    Task DeleteBlobAsync(int id);
}
