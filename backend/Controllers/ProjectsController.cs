using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService _projects;

    public ProjectsController(ProjectService projects) => _projects = projects;

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
        return Ok(txn);
    }

    // ---- Attendance ----
    [HttpGet("{id:int}/attendance")]
    public async Task<List<AttendanceRecord>> Attendance(int id, [FromQuery] DateTime date)
        => await _projects.GetAttendanceForDateAsync(id, date);

    [HttpPost("{id:int}/attendance/status")]
    public async Task<ActionResult> SetAttendanceStatus(int id, [FromBody] AttendanceDto dto)
    {
        var p = await FindParty(id, dto.PartyId);
        await _projects.SetAttendanceStatusAsync(id, p, dto.Date, dto.Status ?? AttendanceStatuses.Registered);
        return Ok();
    }

    [HttpPost("{id:int}/attendance/hours")]
    public async Task<ActionResult> SetAttendanceHours(int id, [FromBody] AttendanceDto dto)
    {
        var p = await FindParty(id, dto.PartyId);
        await _projects.SetAttendanceHoursAsync(id, p, dto.Date, dto.Hours);
        return Ok();
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

    private async Task<SiteParty> FindParty(int projectId, int partyId)
    {
        var party = (await _projects.GetPartiesAsync(projectId)).FirstOrDefault(x => x.Id == partyId);
        return party ?? new SiteParty { Id = partyId, ProjectId = projectId, Name = "Unknown" };
    }

    public record AttendanceDto(int PartyId, DateTime Date, string? Status, double Hours);
}