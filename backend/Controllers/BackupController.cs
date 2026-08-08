using LuxInfra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/backup")]
public class BackupController : ControllerBase
{
    private readonly TursoSyncService _sync;

    public BackupController(TursoSyncService sync) => _sync = sync;

    [HttpGet]
    public async Task<ActionResult> Status() => Ok(await _sync.StatusAsync());

    [HttpPost("push")]
    public async Task<ActionResult> Push()
    {
        var (ok, message) = await _sync.PushNowAsync();
        return Ok(new { ok, message });
    }

    [HttpPost("pull")]
    public async Task<ActionResult> Pull()
    {
        var (ok, message) = await _sync.PullNowAsync();
        return Ok(new { ok, message });
    }
}
