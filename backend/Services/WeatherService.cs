using System.Net.Http.Json;

namespace LuxInfra.Api.Services;

/// <summary>
/// Site weather for a project location.
/// </summary>
public record ProjectWeatherDto
{
    public double Temperature { get; init; }
    public double FeelsLike { get; init; }
    public int Humidity { get; init; }
    public double WindSpeed { get; init; }
    public double RainProbability { get; init; }
    public double Precipitation { get; init; }
    public int WeatherCode { get; init; }
    public bool IsDay { get; init; }
    public string Condition { get; init; } = "";
    public List<DailyForecastDto> Forecast { get; init; } = new();
    public DateTime UpdatedAt { get; init; } = DateTime.Now;
}

/// <summary>
/// One day of the short-range site forecast.
/// </summary>
public record DailyForecastDto
{
    public string Date { get; init; } = "";
    public int WeatherCode { get; init; }
    public double TempMax { get; init; }
    public double TempMin { get; init; }
    public double RainProbability { get; init; }
}

/// <summary>
/// Thin weather provider abstraction. Swap Open-Meteo for a commercial API
/// later (OpenWeather, WeatherAPI.com, etc.) without touching the frontend.
/// </summary>
public interface IWeatherService
{
    Task<ProjectWeatherDto?> GetWeatherAsync(double latitude, double longitude);
}

/// <summary>
/// Free, key-less weather via Open-Meteo (non-commercial use; attribution required).
/// Caches per-location so N users viewing the same site share one upstream call.
/// </summary>
public sealed class OpenMeteoWeatherService : IWeatherService
{
    private static readonly string[] Conditions =
    {
        "Clear", "Mainly Clear", "Partly Cloudy", "Overcast",
        "Fog", "Fog", "Depositing Rime Fog", "Depositing Rime Fog",
        "Drizzle", "Drizzle", "Drizzle", "Freezing Drizzle", "Freezing Drizzle",
        "Rain", "Rain", "Rain", "Freezing Rain", "Freezing Rain",
        "Snow", "Snow", "Snow", "Snow Grains",
        "Rain Showers", "Rain Showers", "Rain Showers",
        "Snow Showers", "Snow Showers",
        "Thunderstorm", "Thunderstorm", "Thunderstorm", "Thunderstorm",
    };

    private readonly HttpClient _http;
    private readonly ILogger<OpenMeteoWeatherService> _log;
    private readonly Dictionary<string, (ProjectWeatherDto Dto, DateTime At)> _cache = new();

    private static readonly TimeSpan CacheLifetime = TimeSpan.FromMinutes(20);

    public OpenMeteoWeatherService(ILogger<OpenMeteoWeatherService> log)
    {
        _log = log;
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
    }

    public async Task<ProjectWeatherDto?> GetWeatherAsync(double latitude, double longitude)
    {
        var key = $"{latitude:0.####},{longitude:0.####}";
        lock (_cache)
        {
            if (_cache.TryGetValue(key, out var hit) && DateTime.UtcNow - hit.At < CacheLifetime)
                return hit.Dto;
        }

        try
        {
            var url =
                $"https://api.open-meteo.com/v1/forecast?latitude={latitude:0.####}&longitude={longitude:0.####}" +
                "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,is_day" +
                "&hourly=temperature_2m,precipitation_probability,weather_code" +
                "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
                "&forecast_days=5&forecast_hours=12&timezone=auto";

            var doc = await _http.GetFromJsonAsync<System.Text.Json.Nodes.JsonObject>(url);
            if (doc is null) return null;

            var current = doc["current"]?.AsObject();
            var hourly = doc["hourly"]?.AsObject();
            var daily = doc["daily"]?.AsObject();
            if (current is null) return null;

            var code = current["weather_code"]?.GetValue<int?>() ?? 0;
            var isDay = current["is_day"]?.GetValue<int?>() == 1;
            var precipitationProbability = 0.0;

            // Rain probability = max precip_probability over the next 6 hourly slots.
            if (hourly?["precipitation_probability"] is System.Text.Json.Nodes.JsonArray probs)
            {
                for (var i = 0; i < Math.Min(6, probs.Count); i++)
                {
                    var v = probs[i]?.GetValue<double?>() ?? 0;
                    if (v > precipitationProbability) precipitationProbability = v;
                }
            }

            // 5-day forecast from the daily arrays.
            var forecast = new List<DailyForecastDto>();
            if (daily is not null)
            {
                var dates = daily["time"] as System.Text.Json.Nodes.JsonArray;
                var codes = daily["weather_code"] as System.Text.Json.Nodes.JsonArray;
                var maxT = daily["temperature_2m_max"] as System.Text.Json.Nodes.JsonArray;
                var minT = daily["temperature_2m_min"] as System.Text.Json.Nodes.JsonArray;
                var rain = daily["precipitation_probability_max"] as System.Text.Json.Nodes.JsonArray;
                if (dates is not null)
                {
                    for (var i = 0; i < dates.Count; i++)
                    {
                        forecast.Add(new DailyForecastDto
                        {
                            Date = dates[i]?.GetValue<string?>() ?? "",
                            WeatherCode = codes is not null && i < codes.Count ? codes[i]?.GetValue<int?>() ?? 0 : 0,
                            TempMax = maxT is not null && i < maxT.Count ? maxT[i]?.GetValue<double?>() ?? 0 : 0,
                            TempMin = minT is not null && i < minT.Count ? minT[i]?.GetValue<double?>() ?? 0 : 0,
                            RainProbability = rain is not null && i < rain.Count ? rain[i]?.GetValue<double?>() ?? 0 : 0,
                        });
                    }
                }
            }

            lock (_cache)
            {
                _cache[key] = (new ProjectWeatherDto
                {
                    Temperature = current["temperature_2m"]?.GetValue<double?>() ?? 0,
                    FeelsLike = current["apparent_temperature"]?.GetValue<double?>() ?? 0,
                    Humidity = current["relative_humidity_2m"]?.GetValue<int?>() ?? 0,
                    WindSpeed = current["wind_speed_10m"]?.GetValue<double?>() ?? 0,
                    RainProbability = precipitationProbability,
                    Precipitation = current["precipitation"]?.GetValue<double?>() ?? 0,
                    WeatherCode = code,
                    IsDay = isDay,
                    Condition = MapCondition(code),
                    Forecast = forecast,
                    UpdatedAt = DateTime.Now,
                }, DateTime.UtcNow);
            }

            return _cache[key].Dto;
        }
        catch (Exception ex)
        {
            _log.LogWarning("Open-Meteo fetch failed: {Msg}", ex.Message);
            return null;
        }
    }

    private static string MapCondition(int code)
    {
        if (code >= 0 && code < Conditions.Length) return Conditions[code];
        return code >= 95 ? "Thunderstorm" : "Unknown";
    }
}