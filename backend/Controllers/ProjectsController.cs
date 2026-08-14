using LuxInfra.Api.Services;
using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projects;
    private readonly IActivityService _activity;
    private readonly PushService? _push;

    public ProjectsController(IProjectService projects, IActivityService activity, PushService? push = null)
    {
        _projects = projects;
        _activity = activity;
        _push = push;
    }

    // ---- Projects ----
    [HttpGet]
    public async Task<List<Project>> All() => await _projects.GetProjectsAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult> Detail(int id)
    {
        var project = await _projects.GetProjectAsync(id);
        if (project is null) return NotFound();

        return Ok(new
        {
            project,
            parties = await _projects.GetPartiesAsync(id),
            tasks = await _projects.GetTasksAsync(id),
            txns = await _projects.GetTxnsAsync(id),
            materials = await _projects.GetMaterialTxnsAsync(id),
            inventory = await _projects.GetInventoryAsync(id),
            logs = await _projects.GetSiteLogsAsync(id),
            mom = await _projects.GetMeetingMinutesAsync(id),
            design = await _projects.GetDesignFilesAsync(id),
            folders = await _projects.GetFoldersAsync(id)
        });
    }

    [HttpPost]
    public async Task<ActionResult> Save([FromBody] Project p)
    {
        await _projects.SaveProjectAsync(p);
        await _activity.LogAsync(p.Id == 0 ? "Project created" : "Project updated", p.Name);
        return Ok(p);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] Project p)
    {
        p.Id = id;
        await _projects.SaveProjectAsync(p);
        return Ok(p);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _projects.DeleteProjectAsync(id);
        await _activity.LogAsync("Project deleted", $"#{id}");
        return Ok();
    }

    // ---- Site parties ----
    [HttpGet("{id:int}/parties")]
    public async Task<List<SiteParty>> Parties(int id) => await _projects.GetPartiesAsync(id);

    [HttpPost("{id:int}/parties")]
    public async Task<ActionResult> SaveParty(int id, [FromBody] SiteParty p)
    {
        p.ProjectId = id;
        await _projects.SavePartyAsync(p);
        await _activity.LogAsync(p.Id == 0 ? "Site party added" : "Site party updated", p.Name);
        return Ok(p);
    }

    // ---- Tasks ----
    [HttpGet("{id:int}/tasks")]
    public async Task<List<ProjectTask>> Tasks(int id) => await _projects.GetTasksAsync(id);

    [HttpPost("{id:int}/tasks")]
    public async Task<ActionResult> SaveTask(int id, [FromBody] ProjectTask t)
    {
        t.ProjectId = id;
        await _projects.SaveTaskAsync(t);
        await _activity.LogAsync(t.Id == 0 ? "Task created" : "Task updated", t.Name);
        return Ok(t);
    }

    // ---- Transactions (payments in/out) ----
    [HttpGet("{id:int}/txns")]
    public async Task<List<ProjectTxn>> Txns(int id) => await _projects.GetTxnsAsync(id);

    [HttpPost("{id:int}/txns")]
    public async Task<ActionResult> SaveTxn(int id, [FromBody] ProjectTxn txn)
    {
        txn.ProjectId = id;
        var party = await _projects.GetPartiesAsync(id);
        var p = party.FirstOrDefault(x => x.Id == txn.PartyId);
        if (p is null) return BadRequest("Party not found");
        await _projects.SaveTxnAsync(txn, p);
        await _activity.LogAsync($"Project payment {ProjectTxnTypes.Display(txn.Type)}",
            $"{txn.PartyName} — {ReportService.Money(txn.Amount)}");
        return Ok(txn);
    }

    // ---- Attendance ----
    [HttpGet("{id:int}/attendance")]
    public async Task<List<AttendanceRecord>> Attendance(int id, [FromQuery] DateTime date)
        => await _projects.GetAttendanceForDateAsync(id, date);

    // ---- Payroll (wages from attendance × daily rate) ----
    [HttpGet("{id:int}/payroll")]
    public async Task<ActionResult> Payroll(int id, [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var fromDay = from == default ? DateTime.Today.AddDays(-30) : from;
        var toDay = to == default ? DateTime.Today : to;
        if (toDay < fromDay) return BadRequest("'to' must be >= 'from'");

        var parties = await _projects.GetPartiesAsync(id);
        var records = await _projects.GetAttendanceInRangeAsync(id, fromDay, toDay);

        var rows = parties
            .Where(p => p.DailyRate > 0)
            .Select(p =>
            {
                var present = records.Where(r => r.PartyId == p.Id && r.Status == AttendanceStatuses.Present).ToList();
                var days = present.Count;
                var hours = present.Sum(r => r.HoursLogged);
                var amount = days * p.DailyRate;
                var totalHours = records.Where(r => r.PartyId == p.Id).Sum(r => r.HoursLogged);
                return new
                {
                    partyId = p.Id,
                    name = p.Name,
                    role = p.Role,
                    dailyRate = p.DailyRate,
                    days = days,
                    hours = Math.Round(hours, 1),
                    totalHours = Math.Round(totalHours, 1),
                    amount = Math.Round(amount, 2),
                    amountLabel = ReportService.Money(amount),
                    currentBalance = p.CurrentBalance,
                    netPayable = Math.Round(amount - p.CurrentBalance, 2),
                    netPayableLabel = ReportService.Money(Math.Abs(amount - p.CurrentBalance)),
                };
            })
            .OrderByDescending(r => r.amount)
            .ToList();

        return Ok(new
        {
            from = fromDay.ToString("yyyy-MM-dd"),
            to = toDay.ToString("yyyy-MM-dd"),
            totalDays = rows.Sum(r => r.days),
            totalAmount = Math.Round(rows.Sum(r => r.amount), 2),
            totalAmountLabel = ReportService.Money(rows.Sum(r => r.amount)),
            rows
        });
    }

    [HttpPost("{id:int}/attendance/status")]
    public async Task<ActionResult> SetAttendanceStatus(int id, [FromBody] AttendanceDto dto)
    {
        var p = await FindParty(id, dto.PartyId);
        await _projects.SetAttendanceStatusAsync(id, p, dto.Date, dto.Status ?? AttendanceStatuses.Registered);
        if (_push is not null)
            _ = _push.SendAsync("Attendance updated", $"{p.Name} marked {dto.Status} for {dto.Date:dd-MMM}", $"/projects/{id}/attendance");
        return Ok();
    }

    [HttpPost("{id:int}/attendance/hours")]
    public async Task<ActionResult> SetAttendanceHours(int id, [FromBody] AttendanceDto dto)
    {
        var p = await FindParty(id, dto.PartyId);
        await _projects.SetAttendanceHoursAsync(id, p, dto.Date, dto.Hours);
        return Ok();
    }

    // ---- Attendance: punches (manual / remote-GPS) ----
    [HttpGet("{id:int}/attendance/punches")]
    public async Task<List<AttendancePunch>> Punches(int id, [FromQuery] DateTime? date)
        => await _projects.GetPunchesAsync(id, date);

    [HttpPost("{id:int}/attendance/punch")]
    public async Task<ActionResult> Punch(int id, [FromBody] PunchDto dto)
    {
        var project = await _projects.GetProjectAsync(id);
        if (project is null) return NotFound();
        var p = await FindParty(id, dto.PartyId);
        var punch = await _projects.PunchAsync(project, p, new AttendancePunch
        {
            Kind = dto.Kind,
            Source = dto.Source,
            When = dto.When ?? DateTime.Now,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Accuracy = dto.Accuracy,
            DeviceId = dto.DeviceId,
            Note = dto.Note
        });
        if (_push is not null)
            _ = _push.SendAsync("Attendance punch", $"{p.Name} clocked {dto.Kind} · {(punch.InGeofence ? "in geofence" : "OUTSIDE geofence")}",
                $"/projects/{id}/attendance");
        return Ok(punch);
    }

    // ---- Biometric device webhook (e.g. ZKTeco) ----
    [HttpPost("{id:int}/attendance/biometric-push")]
    public async Task<ActionResult> BiometricPush(int id, [FromBody] BiometricPushDto dto)
    {
        var project = await _projects.GetProjectAsync(id);
        if (project is null) return NotFound();
        var party = await _projects.FindPartyByNameAsync(id, dto.Name);
        if (party is null) return BadRequest($"No site party matches biometric name '{dto.Name}'");

        var isCheckIn = dto.Event?.Trim() == "0" || dto.Event is null;   // ZKTeco: 0 = check-in, 1 = check-out
        var punch = await _projects.PunchAsync(project, party, new AttendancePunch
        {
            Kind = isCheckIn ? "In" : "Out",
            Source = PunchSources.Biometric,
            When = dto.When ?? DateTime.Now,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            DeviceId = dto.DeviceId
        });
        return Ok(punch);
    }

    // ---- Attendance: requests (WFH / leave) ----
    [HttpGet("{id:int}/attendance/requests")]
    public async Task<List<AttendanceRequest>> Requests(int id)
        => await _projects.GetRequestsAsync(id);

    [HttpPost("{id:int}/attendance/requests")]
    public async Task<ActionResult> SubmitRequest(int id, [FromBody] RequestDto dto)
    {
        var p = await FindParty(id, dto.PartyId);
        var req = await _projects.SubmitRequestAsync(id, p, new AttendanceRequest
        {
            Kind = dto.Kind,
            DateFrom = dto.DateFrom,
            DateTo = dto.DateTo,
            Reason = dto.Reason
        });
        if (_push is not null)
            _ = _push.SendAsync($"{dto.Kind} request", $"{p.Name} requested {dto.Kind} ({dto.DateFrom:dd-MMM} → {dto.DateTo:dd-MMM})",
                $"/projects/{id}/attendance");
        return Ok(req);
    }

    [HttpPost("{id:int}/attendance/requests/{requestId:int}/decide")]
    public async Task<ActionResult> DecideRequest(int id, int requestId, [FromBody] DecideDto dto)
    {
        var req = await _projects.DecideRequestAsync(id, requestId, dto.Status, dto.DecidedBy);
        if (req is null) return NotFound();
        if (_push is not null)
            _ = _push.SendAsync("Request " + dto.Status, $"{req.PartyName}'s {req.Kind} was {dto.Status} by {dto.DecidedBy}",
                $"/projects/{id}/attendance");
        return Ok(req);
    }

    // ---- SOS / emergency ----
    [HttpPost("{id:int}/attendance/sos")]
    public async Task<ActionResult> Sos(int id, [FromBody] SosDto dto)
    {
        var project = await _projects.GetProjectAsync(id);
        if (project is null) return NotFound();
        var p = await FindParty(id, dto.PartyId);
        var alert = await _projects.TriggerEmergencyAsync(project, p, new EmergencyAlert
        {
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Accuracy = dto.Accuracy,
            Note = dto.Note
        });
        if (_push is not null)
        {
            var title = "🚨 SOS — " + project.Name;
            var body = $"{p.Name} raised an emergency{(dto.Note is { Length: > 0 } n ? ": " + n : "")}";
            if (dto.Recipients is { Length: > 0 })
                _ = _push.SendToUsersAsync(dto.Recipients, title, body, $"/projects/{id}/attendance");
            else
                _ = _push.SendAsync(title, body, $"/projects/{id}/attendance");
        }
        return Ok(alert);
    }

    [HttpGet("{id:int}/attendance/emergencies")]
    public async Task<List<EmergencyAlert>> Emergencies(int id)
        => await _projects.GetEmergencyAlertsAsync(id);

    [HttpPost("{id:int}/attendance/sos/{alertId:int}/resolve")]
    public async Task<ActionResult> ResolveSos(int id, int alertId)
    {
        var alert = await _projects.ResolveEmergencyAsync(id, alertId);
        if (alert is null) return NotFound();
        if (_push is not null)
            _ = _push.SendAsync("SOS resolved", $"{alert.PartyName}'s emergency was marked as resolved.", $"/projects/{id}/attendance");
        return Ok(alert);
    }

    // ---- Materials ----
    [HttpGet("{id:int}/materials")]
    public async Task<List<MaterialTxn>> Materials(int id, [FromQuery] string? kind = null)
        => await _projects.GetMaterialTxnsAsync(id, kind);

    [HttpGet("{id:int}/inventory")]
    public async Task<ActionResult> Inventory(int id) => Ok(await _projects.GetInventoryAsync(id));

    [HttpPost("{id:int}/materials")]
    public async Task<ActionResult> SaveMaterial(int id, [FromBody] MaterialTxn m)
    {
        m.ProjectId = id;
        await _projects.SaveMaterialTxnAsync(m);
        if (_push is not null && m.Kind == MaterialTxnKinds.Delivered)
            _ = _push.SendAsync("Material used", $"{m.Quantity} {m.Unit} of {m.MaterialName} issued on site", $"/projects/{id}/material");
        return Ok(m);
    }

    // ---- Site logs (DPR) ----
    [HttpGet("{id:int}/logs")]
    public async Task<List<SiteLog>> Logs(int id) => await _projects.GetSiteLogsAsync(id);

    [HttpPost("{id:int}/logs")]
    public async Task<ActionResult> SaveLog(int id, [FromBody] SiteLog log)
    {
        log.ProjectId = id;
        await _projects.SaveSiteLogAsync(log);
        if (_push is not null)
            _ = _push.SendAsync("Site progress updated", $"Site at {log.ProgressPercent}% — {log.Note}", $"/projects/{id}/site");
        return Ok(log);
    }

    // ---- MOM ----
    [HttpGet("{id:int}/mom")]
    public async Task<List<MeetingMinute>> Mom(int id) => await _projects.GetMeetingMinutesAsync(id);

    [HttpPost("{id:int}/mom")]
    public async Task<ActionResult> SaveMom(int id, [FromBody] MeetingMinute m)
    {
        m.ProjectId = id;
        await _projects.SaveMeetingMinuteAsync(m);
        return Ok(m);
    }

    [HttpDelete("{id:int}/mom/{momId:int}")]
    public async Task<ActionResult> DeleteMom(int id, int momId)
    {
        await _projects.DeleteMeetingMinuteAsync(momId);
        await _activity.LogAsync("MOM deleted", $"#{momId}");
        return Ok();
    }

    // ---- Design ----
    [HttpGet("{id:int}/design")]
    public async Task<List<DesignFile>> Design(int id) => await _projects.GetDesignFilesAsync(id);

    [HttpPost("{id:int}/design")]
    public async Task<ActionResult> SaveDesign(int id, [FromBody] DesignFile d)
    {
        d.ProjectId = id;
        await _projects.SaveDesignFileAsync(d);
        return Ok(d);
    }

    // ---- Files & folders ----
    [HttpGet("{id:int}/folders")]
    public async Task<List<ProjectFolder>> Folders(int id) => await _projects.GetFoldersAsync(id);

    [HttpPost("{id:int}/folders")]
    public async Task<ActionResult> AddFolder(int id, [FromBody] ProjectFolder folder)
        => Ok(await _projects.AddFolderAsync(id, folder.Name));

    [HttpGet("files/{folderId:int}")]
    public async Task<List<ProjectFile>> Files(int folderId) => await _projects.GetFilesAsync(folderId);

    [HttpPost("{id:int}/files")]
    public async Task<ActionResult> AddFile(int id, [FromBody] ProjectFile file)
    {
        file.ProjectId = id;
        await _projects.AddFileAsync(id, file.FolderId, file.FileName, file.FilePath);
        return Ok(file);
    }

    [HttpPut("files/{fileId:int}")]
    public async Task<ActionResult> UpdateFile(int fileId, [FromBody] ProjectFile file)
    {
        file.Id = fileId;
        await _projects.UpdateFileAsync(file);
        return Ok(file);
    }

    [HttpDelete("files/{fileId:int}")]
    public async Task<ActionResult> DeleteFile(int fileId)
    {
        await _projects.DeleteFileAsync(fileId);
        await _activity.LogAsync("File deleted", $"#{fileId}");
        return Ok();
    }

    [HttpDelete("{id:int}/folders/{folderId:int}")]
    public async Task<ActionResult> DeleteFolder(int id, int folderId)
    {
        await _projects.DeleteFolderAsync(folderId);
        await _activity.LogAsync("Folder deleted", $"#{folderId}");
        return Ok();
    }

    // ---- Uploads (2D/3D models & files) ----

    [HttpGet("{id:int}/uploads")]
    public async Task<List<object>> Uploads(int id, [FromQuery] string? category = null)
    {
        var blobs = await _projects.GetUploadsAsync(id, category);
        return blobs.Select(b => (object)new
        {
            id = b.Id,
            projectId = b.ProjectId,
            category = b.Category,
            name = b.Name,
            contentType = b.ContentType,
            size = b.Size,
            sizeLabel = b.SizeLabel,
            uploadedAt = b.UploadedAt
        }).ToList();
    }

    [HttpPost("{id:int}/uploads")]
    public async Task<ActionResult> Upload(int id, [FromBody] UploadDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("File name required");
        byte[] bytes;
        try { bytes = Convert.FromBase64String(dto.DataBase64 ?? ""); }
        catch { return BadRequest("Invalid file data"); }
        if (bytes.Length == 0) return BadRequest("Empty file");

        var blob = await _projects.SaveUploadAsync(new FileBlob
        {
            ProjectId = id,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? DesignCategories.Layout2D : dto.Category,
            Name = dto.Name.Trim(),
            ContentType = string.IsNullOrWhiteSpace(dto.ContentType) ? "application/octet-stream" : dto.ContentType,
            Size = bytes.Length,
            Data = bytes
        });
        await _activity.LogAsync("File uploaded", $"{blob.Name} → {blob.Category}");
        return Ok(new { blob.Id, blob.ProjectId, blob.Category, blob.Name, blob.ContentType, blob.Size, blob.SizeLabel, blob.UploadedAt });
    }

    [HttpGet("{id:int}/uploads/{blobId:int}")]
    public async Task<ActionResult> Download(int id, int blobId)
    {
        var blob = await _projects.GetUploadAsync(blobId);
        if (blob is null || blob.ProjectId != id) return NotFound();
        return File(blob.Data, blob.ContentType, blob.Name);
    }

    [HttpDelete("{id:int}/uploads/{blobId:int}")]
    public async Task<ActionResult> DeleteUpload(int id, int blobId)
    {
        var blob = await _projects.GetUploadAsync(blobId);
        if (blob is null || blob.ProjectId != id) return NotFound();
        await _projects.DeleteUploadAsync(blobId);
        await _activity.LogAsync("File deleted", blob.Name);
        return Ok();
    }

    private async Task<SiteParty> FindParty(int projectId, int partyId)
    {
        var party = (await _projects.GetPartiesAsync(projectId)).FirstOrDefault(x => x.Id == partyId);
        return party ?? new SiteParty { Id = partyId, ProjectId = projectId, Name = "Unknown" };
    }

    public record AttendanceDto(int PartyId, DateTime Date, string? Status, double Hours);
    public record PunchDto(int PartyId, string Kind, DateTime? When, string? Source, double Latitude, double Longitude, double Accuracy, string? DeviceId, string? Note);
    public record BiometricPushDto(string DeviceId, string Name, string Event, DateTime? When, double Latitude, double Longitude);
    public record RequestDto(int PartyId, string Kind, DateTime DateFrom, DateTime DateTo, string Reason);
    public record DecideDto(string Status, string? DecidedBy);
    public record SosDto(int PartyId, double Latitude, double Longitude, double Accuracy, string? Note, string[]? Recipients);
    public record UploadDto(string Category, string Name, string ContentType, long Size, string DataBase64);
}