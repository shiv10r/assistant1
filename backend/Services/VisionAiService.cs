using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Nodes;

namespace LuxInfra.Api.Services;

/// <summary>
/// Optional AI vision — estimates construction site progress % from a photo via OpenRouter.
/// Enabled when OPENROUTER_API_KEY is set. Uses a vision-capable model (AI_VISION_MODEL).
/// </summary>
public sealed class VisionAiService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly bool _enabled;

    public VisionAiService(IConfiguration cfg)
    {
        _apiKey = cfg["OPENROUTER_API_KEY"] ?? "";
        _model = cfg["AI_VISION_MODEL"] ?? "openrouter/free";
        _enabled = !string.IsNullOrWhiteSpace(_apiKey);
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
    }

    public bool Configured => _enabled;
    public string Model => _model;

    /// <summary>Analyse a photo (base64, no data URI prefix) and return an estimated progress % and note.</summary>
    public async Task<(bool Ok, int Progress, string Note, string? Error)> AnalyseProgressAsync(string base64Image)
    {
        if (!_enabled) return (false, 0, "", "not_configured");

        try
        {
            var dataUrl = base64Image.StartsWith("data:") ? base64Image : $"data:image/jpeg;base64,{base64Image}";
            var messages = new JsonArray
            {
                new JsonObject
                {
                    ["role"] = "user",
                    ["content"] = new JsonArray
                    {
                        new JsonObject { ["type"] = "text", ["text"] = VisionPrompt },
                        new JsonObject { ["type"] = "image_url", ["image_url"] = new JsonObject { ["url"] = dataUrl } },
                    }
                }
            };

            var payload = new JsonObject
            {
                ["model"] = _model,
                ["messages"] = messages,
                ["temperature"] = 0.2,
                ["max_tokens"] = 200,
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            req.Headers.TryAddWithoutValidation("HTTP-Referer", "https://luxinfra.app");
            req.Headers.TryAddWithoutValidation("X-Title", "LuxInfra Vision");
            req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

            using var resp = await _http.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
                return (false, 0, "", $"Vision HTTP {resp.StatusCode}: {body[..Math.Min(160, body.Length)]}");

            var node = JsonNode.Parse(body);
            var content = node?["choices"]?[0]?["message"]?["content"]?.GetValue<string>();
            if (string.IsNullOrWhiteSpace(content))
                return (false, 0, "", "Empty response from vision model.");

            // Expect "60%" (or 60) then optional note.
            var pct = 0;
            var m = System.Text.RegularExpressions.Regex.Match(content, @"(\d{1,3})\s*%");
            if (m.Success) pct = Math.Clamp(int.Parse(m.Groups[1].Value), 0, 100);
            return (true, pct, content.Trim(), null);
        }
        catch (Exception ex)
        {
            return (false, 0, "", ex.Message);
        }
    }

    private const string VisionPrompt = """
        You are an experienced construction site supervisor. Look at this site photo and estimate
        the overall construction progress as a percentage (0-100). Reply with the number and a
        one-line note on what is done and what is pending. Format: "65% - Structure up to first floor done, plastering pending."
        """;
}
