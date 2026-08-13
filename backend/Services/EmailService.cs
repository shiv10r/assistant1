using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace LuxInfra.Api.Services;

/// <summary>
/// Optional transactional email via Resend (or SendGrid fallback).
/// Enabled when RESEND_API_KEY (or SENDGRID_API_KEY) is set. No-ops otherwise.
/// </summary>
public sealed class EmailService
{
    private readonly HttpClient _http;
    private readonly string _resendKey;
    private readonly string _sendgridKey;
    private readonly string _from;
    private readonly bool _enabled;

    public EmailService(IConfiguration cfg)
    {
        _resendKey = cfg["RESEND_API_KEY"] ?? "";
        _sendgridKey = cfg["SENDGRID_API_KEY"] ?? "";
        _from = cfg["EMAIL_FROM"] ?? "LuxInfra <no-reply@luxinfra.app>";
        _enabled = !string.IsNullOrWhiteSpace(_resendKey) || !string.IsNullOrWhiteSpace(_sendgridKey);
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
    }

    public bool Configured => _enabled;
    public string Provider => !string.IsNullOrWhiteSpace(_resendKey) ? "Resend" : "SendGrid";

    /// <summary>Send a PDF (invoice) to one recipient. Returns null on success or an error string.</summary>
    public async Task<string?> SendPdfAsync(string to, string subject, string message, string fileName, byte[] pdfBytes)
    {
        if (!_enabled) return "not_configured";
        if (string.IsNullOrWhiteSpace(to)) return "Recipient email missing on the party.";

        try
        {
            if (!string.IsNullOrWhiteSpace(_resendKey))
                return await SendViaResendAsync(to, subject, message, fileName, pdfBytes);
            return await SendViaSendGridAsync(to, subject, message, fileName, pdfBytes);
        }
        catch (Exception ex)
        {
            return $"Email failed: {ex.Message}";
        }
    }

    /// <summary>Send an HTML email with a PDF attachment to one recipient. Returns null on success or an error string.</summary>
    public async Task<string?> SendHtmlAsync(string to, string subject, string htmlBody, string fileName, byte[] pdfBytes)
    {
        if (!_enabled) return "not_configured";
        if (string.IsNullOrWhiteSpace(to)) return "Recipient email missing.";

        try
        {
            if (!string.IsNullOrWhiteSpace(_resendKey))
                return await SendHtmlViaResendAsync(to, subject, htmlBody, fileName, pdfBytes);
            return await SendHtmlViaSendGridAsync(to, subject, htmlBody, fileName, pdfBytes);
        }
        catch (Exception ex)
        {
            return $"Email failed: {ex.Message}";
        }
    }

    private async Task<string?> SendViaResendAsync(string to, string subject, string message, string fileName, byte[] pdfBytes)
    {
        var base64 = Convert.ToBase64String(pdfBytes);
        var payload = new JsonObject
        {
            ["from"] = _from,
            ["to"] = new JsonArray { to },
            ["subject"] = subject,
            ["text"] = message,
            ["attachments"] = new JsonArray
            {
                new JsonObject
                {
                    ["filename"] = fileName,
                    ["content"] = base64,
                }
            }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _resendKey);
        req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();
        return resp.IsSuccessStatusCode ? null : $"Resend HTTP {resp.StatusCode}: {body[..Math.Min(200, body.Length)]}";
    }

    private async Task<string?> SendViaSendGridAsync(string to, string subject, string message, string fileName, byte[] pdfBytes)
    {
        var from = _from.Contains('<')
            ? new { email = _from.Split('<')[1].Trim('>'), name = _from.Split('<')[0].Trim() }
            : new { email = _from, name = "LuxInfra" };
        var payload = new JsonObject
        {
            ["from"] = JsonSerializer.SerializeToNode(from),
            ["personalizations"] = new JsonArray
            {
                new JsonObject
                {
                    ["to"] = new JsonArray { new JsonObject { ["email"] = to } },
                    ["subject"] = subject,
                }
            },
            ["content"] = new JsonArray { new JsonObject { ["type"] = "text/plain", ["value"] = message } },
            ["attachments"] = new JsonArray
            {
                new JsonObject
                {
                    ["content"] = Convert.ToBase64String(pdfBytes),
                    ["filename"] = fileName,
                    ["type"] = "application/pdf",
                }
            }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _sendgridKey);
        req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();
        return resp.IsSuccessStatusCode ? null : $"SendGrid HTTP {resp.StatusCode}: {body[..Math.Min(200, body.Length)]}";
    }

    private async Task<string?> SendHtmlViaResendAsync(string to, string subject, string htmlBody, string fileName, byte[] pdfBytes)
    {
        var base64 = Convert.ToBase64String(pdfBytes);
        var payload = new JsonObject
        {
            ["from"] = _from,
            ["to"] = new JsonArray { to },
            ["subject"] = subject,
            ["html"] = htmlBody,
            ["attachments"] = new JsonArray
            {
                new JsonObject
                {
                    ["filename"] = fileName,
                    ["content"] = base64,
                }
            }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _resendKey);
        req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();
        return resp.IsSuccessStatusCode ? null : $"Resend HTTP {resp.StatusCode}: {body[..Math.Min(200, body.Length)]}";
    }

    private async Task<string?> SendHtmlViaSendGridAsync(string to, string subject, string htmlBody, string fileName, byte[] pdfBytes)
    {
        var from = _from.Contains('<')
            ? new { email = _from.Split('<')[1].Trim('>'), name = _from.Split('<')[0].Trim() }
            : new { email = _from, name = "LuxInfra" };
        var payload = new JsonObject
        {
            ["from"] = JsonSerializer.SerializeToNode(from),
            ["personalizations"] = new JsonArray
            {
                new JsonObject
                {
                    ["to"] = new JsonArray { new JsonObject { ["email"] = to } },
                    ["subject"] = subject,
                }
            },
            ["content"] = new JsonArray { new JsonObject { ["type"] = "text/html", ["value"] = htmlBody } },
            ["attachments"] = new JsonArray
            {
                new JsonObject
                {
                    ["content"] = Convert.ToBase64String(pdfBytes),
                    ["filename"] = fileName,
                    ["type"] = "application/pdf",
                }
            }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _sendgridKey);
        req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();
        return resp.IsSuccessStatusCode ? null : $"SendGrid HTTP {resp.StatusCode}: {body[..Math.Min(200, body.Length)]}";
    }
}
