using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Nodes;
namespace LuxInfra.Api.Services;

/// <summary>
/// Optional off-site backup to Google Drive.
/// Enabled when GOOGLE_DRIVE_ACCESS_TOKEN is set (an OAuth token for your Drive account).
/// Uploads the exported JSON snapshot as a dated file. No-ops when unconfigured.
/// </summary>
public sealed class DriveBackupService
{
    private readonly HttpClient _http;
    private readonly string _accessToken;
    private readonly string _folderName;
    private readonly bool _enabled;

    public DriveBackupService(IConfiguration cfg)
    {
        _accessToken = cfg["GOOGLE_DRIVE_ACCESS_TOKEN"] ?? "";
        _folderName = cfg["GOOGLE_DRIVE_FOLDER"] ?? "LuxInfraBackups";
        _enabled = !string.IsNullOrWhiteSpace(_accessToken);
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(60) };
    }

    public bool Configured => _enabled;
    public string FolderName => _folderName;

    /// <summary>Upload a JSON snapshot to Drive. Returns null on success or an error string.</summary>
    public async Task<string?> UploadSnapshotAsync(string json, string fileName)
    {
        if (!_enabled) return "not_configured";

        try
        {
            // 1. Find (or create) the backup folder.
            var folderId = await EnsureFolderAsync();
            if (folderId is null) return "Could not resolve backup folder on Drive.";

            // 2. Find any existing file with the same name and delete it (keep latest only).
            var q = $"name='{fileName.Replace("'", "\\'")}' and '{folderId}' in parents and trashed=false";
            var search = await GetAsync($"/drive/v3/files?q={Uri.EscapeDataString(q)}&fields=files(id)");
            var existing = search?["files"] as JsonArray;
            if (existing is { Count: > 0 } && existing[0]?["id"]?.GetValue<string>() is { } oldId)
                await _http.DeleteAsync($"https://www.googleapis.com/drive/v3/files/{oldId}");

            // 3. Upload the file (multipart media).
            var boundary = $"lux-{Guid.NewGuid():N}";
            var meta = $@"{{""name"":""{fileName}"",""parents"":[""{folderId}""],""mimeType"":""application/json""}}";
            var body = $"""
                --{boundary}
                Content-Type: application/json; charset=UTF-8

                {meta}
                --{boundary}
                Content-Type: application/json

                {json}
                --{boundary}--
                """;

            using var req = new HttpRequestMessage(HttpMethod.Post,
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
            req.Content = new StringContent(body, Encoding.UTF8);
            var contentType = new MediaTypeHeaderValue("multipart/related");
            contentType.Parameters.Add(new NameValueHeaderValue("boundary", boundary));
            req.Content.Headers.ContentType = contentType;

            using var resp = await _http.SendAsync(req);
            return resp.IsSuccessStatusCode ? null : $"Drive HTTP {resp.StatusCode}";
        }
        catch (Exception ex)
        {
            return $"Drive backup failed: {ex.Message}";
        }
    }

    private async Task<string?> EnsureFolderAsync()
    {
        var q = $"mimeType='application/vnd.google-apps.folder' and name='{_folderName}' and trashed=false";
        var search = await GetAsync($"/drive/v3/files?q={Uri.EscapeDataString(q)}&fields=files(id)");
        var files = search?["files"] as JsonArray;
        if (files is { Count: > 0 } && files[0]?["id"]?.GetValue<string>() is { } existing)
            return existing;

        var body = new StringContent(
            $@"{{""name"":""{_folderName}"",""mimeType"":""application/vnd.google-apps.folder""}}",
            Encoding.UTF8, "application/json");
        using var req = new HttpRequestMessage(HttpMethod.Post, "https://www.googleapis.com/drive/v3/files");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        req.Content = body;
        using var resp = await _http.SendAsync(req);
        var node = JsonNode.Parse(await resp.Content.ReadAsStringAsync());
        return resp.IsSuccessStatusCode ? node?["id"]?.GetValue<string>() : null;
    }

    private async Task<JsonNode?> GetAsync(string path)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com" + path);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        using var resp = await _http.SendAsync(req);
        var body = await resp.Content.ReadAsStringAsync();
        return resp.IsSuccessStatusCode ? JsonNode.Parse(body) : null;
    }
}
