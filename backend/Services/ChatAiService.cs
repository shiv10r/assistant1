using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace LuxInfra.Api.Services;

/// <summary>
/// Open-source AI chat backend (OpenRouter, defaults to DeepSeek's free model).
/// Enabled only when OPENROUTER_API_KEY is set. Non-streaming chat completions
/// with a system prompt grounded in the LuxInfra app domain.
/// </summary>
public sealed class ChatAiService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly bool _enabled;

    public ChatAiService(IConfiguration cfg)
    {
        _apiKey = cfg["OPENROUTER_API_KEY"] ?? "";
        _model = cfg["AI_MODEL"] ?? "deepseek/deepseek-chat-v3-1:free";
        _enabled = !string.IsNullOrWhiteSpace(_apiKey);
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
    }

    public bool Configured => _enabled;
    public string Model => _model;

    /// <summary>Ask the open-source model a general / business question.</summary>
    public async Task<AiReply> AskAsync(string userText, List<ChatTurn> history)
    {
        if (!_enabled)
            return AiReply.NotConfigured(_model);

        try
        {
            var messages = new JsonArray
            {
                NewMsg("system", SystemPrompt),
            };
            foreach (var turn in history.TakeLast(8))
                messages.Add(NewMsg(turn.Role, turn.Content));
            messages.Add(NewMsg("user", userText));

            var payload = new JsonObject
            {
                ["model"] = _model,
                ["messages"] = messages,
                ["temperature"] = 0.7,
                ["max_tokens"] = 700,
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            req.Headers.TryAddWithoutValidation("HTTP-Referer", "https://luxinfra.app");
            req.Headers.TryAddWithoutValidation("X-Title", "LuxInfra Assistant");
            req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

            using var resp = await _http.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                var detail = TryReadError(body);
                return AiReply.Failed(_model, detail);
            }

            var node = JsonNode.Parse(body);
            var content = node?["choices"]?[0]?["message"]?["content"]?.GetValue<string>();
            var usage = node?["usage"]?["total_tokens"]?.GetValue<int?>() ?? 0;
            if (string.IsNullOrWhiteSpace(content))
                return AiReply.Failed(_model, "Empty response from the model.");

            return AiReply.Success(_model, content.Trim(), usage);
        }
        catch (Exception ex)
        {
            return AiReply.Failed(_model, ex.Message);
        }
    }

    private static JsonObject NewMsg(string role, string content) => new() { ["role"] = role, ["content"] = content };

    private static string TryReadError(string body)
    {
        try
        {
            var node = JsonNode.Parse(body);
            var msg = node?["error"]?["message"];
            if (msg is not null) return msg.GetValue<string>();
            return $"HTTP {body[..Math.Min(120, body.Length)]}";
        }
        catch { return $"HTTP {body[..Math.Min(120, body.Length)]}"; }
    }

    private const string SystemPrompt = """
        You are the LuxInfra AI assistant — a smart construction & business manager for a
        civil-infrastructure company in India. You help the owner with daily tasks: tracking
        expenses, site work, labour, materials, billing, parties, projects, and money owed.
        Answer in the same language the user writes (Hindi/English/Hinglish welcome), keep
        answers short, practical and action-oriented. Use ₹ / lakhs / crores naturally.
        If asked something unrelated to business, answer briefly anyway.
        """;
}

public sealed record ChatTurn(string Role, string Content);

public sealed record AiReply(bool Ok, bool Configured, string Model, string Text, int Tokens, string? Error)
{
    public static AiReply Success(string model, string text, int tokens) => new(true, true, model, text, tokens, null);
    public static AiReply NotConfigured(string model) => new(false, false, model,
        "⚠️ AI chat is not enabled yet. Set the OPENROUTER_API_KEY env var on the server to switch on the open-source DeepSeek model.", 0, "not_configured");
    public static AiReply Failed(string model, string error) => new(false, true, model,
        $"⚠️ The AI service hit an error: {error}", 0, error);
}
