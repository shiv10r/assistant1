using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/activity")]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activity;

    public ActivityController(IActivityService activity) => _activity = activity;

    [HttpGet]
    public async Task<List<ActivityLogItemDto>> Recent([FromQuery] int count = 100)
    {
        var rows = await _activity.GetRecentAsync(count);
        return rows.Select(a => new ActivityLogItemDto(a.Id, a.Action, a.Detail, a.Source, a.TimeLabel)).ToList();
    }
}

public record ActivityLogItemDto(int Id, string Action, string Detail, string Source, string TimeLabel);
