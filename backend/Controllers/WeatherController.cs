using LuxInfra.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api")]
public class WeatherController : ControllerBase
{
    private readonly IWeatherService _weather;

    public WeatherController(IWeatherService weather) => _weather = weather;

    /// <summary>Current weather for a project site. Weather data by Open-Meteo.</summary>
    [HttpGet("weather")]
    public async Task<ActionResult<ProjectWeatherDto>> Weather(
        [FromQuery] double latitude = 20.5937,
        [FromQuery] double longitude = 78.9629)
    {
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
            return BadRequest(new { ok = false, message = "Invalid coordinates." });
        var dto = await _weather.GetWeatherAsync(latitude, longitude);
        if (dto is null) return Ok(new { ok = false, message = "Weather temporarily unavailable." });
        return Ok(new { ok = true, weather = dto });
    }
}