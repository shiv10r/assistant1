using LuxInfra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/backup")]
public class BackupController : ControllerBase
{
    private readonly TursoSyncService _sync;
    private readonly FirebaseSyncService _firebase;

    public BackupController(TursoSyncService sync, FirebaseSyncService firebase)
    {
        _sync = sync;
        _firebase = firebase;
    }

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

    // ---- Firebase mirror ----

    [HttpGet("version")]
    public async Task<ActionResult> Version() => Ok(await _firebase.StatusAsync());

    [HttpPost("firebase-push")]
    public async Task<ActionResult> FirebasePush()
    {
        var (ok, message) = await _firebase.PushNowAsync();
        return Ok(new { ok, message });
    }

    [HttpPost("firebase-pull")]
    public async Task<ActionResult> FirebasePull()
    {
        var (ok, message) = await _firebase.PullNowAsync();
        return Ok(new { ok, message });
    }
}
