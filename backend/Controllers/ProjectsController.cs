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
            logs = await _projects.GetSiteLogsAsync(id),
            mom = await _projects.GetMeetingMinutesAsync(id)
        });
    }
}