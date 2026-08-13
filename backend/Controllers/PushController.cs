using LuxInfra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/push")]
public class PushController : ControllerBase
{
    private readonly PushService _push;

    public PushController(PushService push) => _push = push;

    /// <summary>Registers this browser's FCM token so the backend can notify it.</summary>
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterTokenDto dto)
    {
        var username = HttpContext.Items["Username"] as string ?? "admin";
        var (ok, message) = await _push.RegisterAsync(dto.Token, dto.Platform, username);
        return ok ? Ok(new { ok, message }) : BadRequest(new { ok, message });
    }

    [HttpGet("devices")]
    public async Task<ActionResult> Devices() => Ok(await _push.DevicesAsync());

    [HttpDelete("{token}")]
    public async Task<ActionResult> Remove(string token)
    {
        await _push.RemoveAsync(token);
        return Ok(new { ok = true });
    }

    /// <summary>Admin test: push a notification to all registered devices.</summary>
    [HttpPost("test")]
    public async Task<ActionResult> Test([FromBody] TestPushDto dto)
    {
        var title = dto?.Title ?? "LuxInfra";
        var body = dto?.Body ?? "You're all set — notifications are working!";
        var sent = await _push.SendAsync(title, body);
        return Ok(new { ok = _push.Enabled, enabled = _push.Enabled, sent });
    }

    /// <summary>Sends a notification only to the devices of the given usernames.</summary>
    [HttpPost("notify")]
    public async Task<ActionResult> Notify([FromBody] NotifyDto dto)
    {
        if (dto.Recipients is not { Length: > 0 })
            return BadRequest(new { ok = false, message = "Select at least one recipient." });
        var sent = await _push.SendToUsersAsync(dto.Recipients, dto.Title ?? "LuxInfra", dto.Body ?? "", dto.Url);
        return Ok(new { ok = _push.Enabled, enabled = _push.Enabled, sent });
    }

    public record RegisterTokenDto(string Token, string Platform);
    public record TestPushDto(string? Title, string? Body);
    public record NotifyDto(string[] Recipients, string? Title, string? Body, string? Url);
}