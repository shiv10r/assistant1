using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

namespace LuxInfra.Api.Services;

/// <summary>
/// Optional Razorpay payment gateway. Enabled when RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are set.
/// Creates payment orders and verifies webhook signatures for auto-reconciliation.
/// </summary>
public sealed class RazorpayService
{
    private readonly HttpClient _http;
    private readonly string _keyId;
    private readonly string _keySecret;
    private readonly string _webhookSecret;
    private readonly bool _enabled;

    public RazorpayService(IConfiguration cfg)
    {
        _keyId = cfg["RAZORPAY_KEY_ID"] ?? "";
        _keySecret = cfg["RAZORPAY_KEY_SECRET"] ?? "";
        _webhookSecret = cfg["RAZORPAY_WEBHOOK_SECRET"] ?? "";
        _enabled = !string.IsNullOrWhiteSpace(_keyId) && !string.IsNullOrWhiteSpace(_keySecret);
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_keyId}:{_keySecret}"));
        _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", auth);
    }

    public bool Configured => _enabled;
    public string KeyId => _keyId;

    /// <summary>Create a payment order for the given amount (in ₹, minimum 1).</summary>
    public async Task<(bool Ok, string? OrderId, string? Error)> CreateOrderAsync(double amountInr, string receipt)
    {
        if (!_enabled) return (false, null, "not_configured");

        var payload = new JsonObject
        {
            ["amount"] = (long)Math.Round(amountInr * 100),
            ["currency"] = "INR",
            ["receipt"] = receipt,
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders");
        req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");
        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            return (false, null, $"Razorpay HTTP {resp.StatusCode}: {body[..Math.Min(200, body.Length)]}");

        var node = JsonNode.Parse(body);
        var orderId = node?["id"]?.GetValue<string>();
        return string.IsNullOrEmpty(orderId) ? (false, null, "No order id returned") : (true, orderId, null);
    }

    /// <summary>Create a shareable payment link for the given amount (₹). Returns short URL for WhatsApp/email.</summary>
    public async Task<(bool Ok, string? Id, string? ShortUrl, string? Error)> CreatePaymentLinkAsync(double amountInr, string receipt)
    {
        if (!_enabled) return (false, null, null, "not_configured");

        var payload = new JsonObject
        {
            ["amount"] = (long)Math.Round(amountInr * 100),
            ["currency"] = "INR",
            ["accept_partial"] = false,
            ["description"] = $"Payment for {receipt}",
            ["notes"] = new JsonObject { ["receipt"] = receipt },
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/payment_links");
        req.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");
        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            return (false, null, null, $"Razorpay HTTP {resp.StatusCode}: {body[..Math.Min(200, body.Length)]}");

        var node = JsonNode.Parse(body);
        var id = node?["id"]?.GetValue<string>();
        var shortUrl = node?["short_url"]?.GetValue<string>();
        return string.IsNullOrEmpty(id) || string.IsNullOrEmpty(shortUrl)
            ? (false, null, null, "No payment link id returned")
            : (true, id, shortUrl, null);
    }

    /// <summary>Fetch an order's receipt (used to map a webhook order id back to the txn).</summary>
    public async Task<string?> GetOrderReceiptAsync(string orderId)
    {
        if (!_enabled) return null;
        using var req = new HttpRequestMessage(HttpMethod.Get, $"https://api.razorpay.com/v1/orders/{orderId}");
        using var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return null;
        var node = JsonNode.Parse(await resp.Content.ReadAsStringAsync());
        return node?["receipt"]?.GetValue<string>();
    }

    /// <summary>Verify a webhook payload signature using the webhook secret.</summary>
    public bool VerifyWebhook(string signatureHeader, string payloadBody)
    {
        if (string.IsNullOrEmpty(_webhookSecret)) return false;
        var expected = "sha256=" + Convert.ToHexString(
            HMACSHA256.HashData(Encoding.UTF8.GetBytes(payloadBody), Encoding.UTF8.GetBytes(_webhookSecret))).ToLowerInvariant();
        return FixedTimeEquals(expected, signatureHeader ?? "");
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        if (a.Length != b.Length) return false;
        var diff = 0;
        for (var i = 0; i < a.Length; i++) diff |= a[i] ^ b[i];
        return diff == 0;
    }
}
