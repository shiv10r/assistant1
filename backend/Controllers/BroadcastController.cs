using LuxInfra.Api.Services;
using LuxInfra.Models;
using LuxInfra.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

/// <summary>
/// Broadcast / announcement engine (advanced, premium feature). Publishing a message stores it
/// as the active broadcast (shown as a scrolling marquee app-wide) and pushes a notification to
/// every registered device via FCM.
/// </summary>
[ApiController]
[Route("api/broadcast")]
public class BroadcastController : ControllerBase
{
    private readonly IModuleRepository _mods;
    private readonly PushService _push;

    public BroadcastController(IModuleRepository mods, PushService push)
    {
        _mods = mods;
        _push = push;
    }

    /// <summary>The current active broadcast (for the app-wide marquee).</summary>
    [HttpGet("active")]
    public async Task<ActionResult> Active()
    {
        var all = await _mods.AllAsync<Broadcast>();
        var active = all.Where(b => b.IsActive).OrderByDescending(b => b.PublishedAt).FirstOrDefault();
        return Ok(new { active });
    }

    /// <summary>Publish history (most recent first).</summary>
    [HttpGet]
    public async Task<ActionResult> History()
    {
        var all = await _mods.AllAsync<Broadcast>();
        return Ok(all.OrderByDescending(b => b.PublishedAt).ToList());
    }

    /// <summary>Publish a new broadcast: store it as active and push to all devices.</summary>
    [HttpPost]
    public async Task<ActionResult> Publish([FromBody] BroadcastDto dto)
    {
        var message = dto?.Message?.Trim();
        if (string.IsNullOrWhiteSpace(message)) return BadRequest(new { ok = false, message = "Message is required" });

        var all = await _mods.AllAsync<Broadcast>();
        foreach (var b in all.Where(b => b.IsActive))
        {
            b.IsActive = false;
            await _mods.SaveAsync(b);
        }

        var bc = new Broadcast { Message = message, PublishedAt = DateTime.Now, IsActive = true };
        await _mods.SaveAsync(bc);

        var sent = await _push.SendAsync("📢 Announcement", message, "/");
        return Ok(new { ok = true, broadcast = bc, sent, enabled = _push.Enabled });
    }

    /// <summary>Stop the current broadcast (clears the marquee).</summary>
    [HttpPost("stop")]
    public async Task<ActionResult> Stop()
    {
        var all = await _mods.AllAsync<Broadcast>();
        foreach (var b in all.Where(b => b.IsActive))
        {
            b.IsActive = false;
            await _mods.SaveAsync(b);
        }
        return Ok(new { ok = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _mods.DeleteAsync<Broadcast>(id);
        return Ok(new { ok = true });
    }

    public record BroadcastDto(string? Message);
}