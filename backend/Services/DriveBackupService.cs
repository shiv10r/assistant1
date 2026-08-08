using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Nodes;
using LuxInfra.Services;
using Microsoft.Extensions.Logging;

namespace LuxInfra.Api.Services;

/// <summary>
/// Google Drive backup via OAuth2.
/// Flow: user creates an OAuth Client (Web app) in Google Cloud Console with the Drive API enabled,
/// sets GOOGLE_DRIVE_CLIENT_ID + GOOGLE_DRIVE_CLIENT_SECRET, then "connects" through the Integrations page.
/// The consent flow returns a refresh token which we persist to data/drive-oauth.json (and/or
/// GOOGLE_DRIVE_REFRESH_TOKEN env). Each backup mints a fresh access token, snapshots the local
/// SQLite database, and uploads it to a "LuxInfraBackups" folder on Drive. Fully optional — no-ops
/// when credentials are missing.
/// </summary>
public sealed class DriveBackupService
{
    private const string TokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string AuthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string FolderMime = "application/vnd.google-apps.folder";
    private const string Scope = "https://www.googleapis.com/auth/drive.file";

    private readonly HttpClient _http;
    private readonly ILogger<DriveBackupService> _log;
    private readonly DatabaseService _db;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _folderName;
    private readonly string _tokenFilePath;

    public DriveBackupService(IConfiguration cfg, DatabaseService db, ILogger<DriveBackupService> log)
    {
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(60) };
        _log = log;
        _db = db;
        _clientId = cfg["GOOGLE_DRIVE_CLIENT_ID"] ?? "";
        _clientSecret = cfg["GOOGLE_DRIVE_CLIENT_SECRET"] ?? "";
        _folderName = cfg["GOOGLE_DRIVE_FOLDER"] ?? "LuxInfraBackups";
        var dataDir = Path.GetDirectoryName(db.DbPath) ?? Path.Combine(Directory.GetCurrentDirectory(), "data");
        _tokenFilePath = Path.Combine(dataDir, "drive-oauth.json");
    }

    /// <summary>Client id + secret are configured (prerequisite for OAuth).</summary>
    public bool HasCredentials => !string.IsNullOrWhiteSpace(_clientId) && !string.IsNullOrWhiteSpace(_clientSecret);

    /// <summary>Credentials AND a refresh token are available → backups can run.</summary>
    public bool Configured => HasCredentials && !string.IsNullOrWhiteSpace(GetRefreshToken());

    public string FolderName => _folderName;
    public string ClientId => _clientId;

    /// <summary>Google OAuth consent URL. redirectUri must be registered in the OAuth client.</summary>
    public string BuildAuthUrl(string redirectUri, string state)
        => $"{AuthEndpoint}?client_id={Uri.EscapeDataString(_clientId)}" +
           $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
           $"&response_type=code&scope={Uri.EscapeDataString(Scope)}" +
           $"&access_type=offline&prompt=consent" +
           $"&state={Uri.EscapeDataString(state)}";

    /// <summary>Exchange the one-time code for tokens and persist the refresh token. Returns error string or null.</summary>
    public async Task<string?> ExchangeCodeAsync(string code, string redirectUri)
    {
        if (!HasCredentials) return "Google Drive client id/secret are not configured.";

        var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _clientId,
            ["client_secret"] = _clientSecret,
            ["redirect_uri"] = redirectUri,
            ["grant_type"] = "authorization_code",
        });

        var node = await PostTokenAsync(form);
        if (node is null) return "Google rejected the authorization code.";

        var refresh = node["refresh_token"]?.GetValue<string>() ?? "";
        var access = node["access_token"]?.GetValue<string>() ?? "";
        var expiresIn = node["expires_in"]?.GetValue<int>() ?? 3600;
        if (string.IsNullOrWhiteSpace(refresh))
            return "Google did not return a refresh token (ensure 'Offline' access + consent prompt).";

        await SaveTokensAsync(access, refresh, DateTimeOffset.UtcNow.ToUnixTimeSeconds() + expiresIn);
        return null;
    }

    /// <summary>Upload a snapshot of the local database to Drive. Returns (ok, message).</summary>
    public async Task<(bool Ok, string Message)> BackupToDriveAsync()
    {
        var access = await EnsureAccessTokenAsync();
        if (access is null)
            return (false, "Google Drive is not connected — click 'Connect Google Drive' first.");

        string? snapshotPath = null;
        try
        {
            snapshotPath = await CreateSnapshotAsync();
            if (snapshotPath is null)
                return (false, "Could not create a database snapshot.");

            var folderId = await EnsureFolderAsync(access);
            if (folderId is null)
                return (false, "Could not find or create the backup folder on Drive.");

            var fileName = $"luxinfra-{DateTime.Now:yyyy-MM-dd_HHmmss}.db3";
            await DeleteExistingAsync(access, fileName, folderId);

            var uploadOk = await UploadFileAsync(access, folderId, fileName, snapshotPath, "application/x-sqlite3");
            if (!uploadOk)
                return (false, "Upload to Drive failed.");

            _log.LogInformation("Uploaded Drive backup {File}", fileName);
            return (true, $"Uploaded {fileName} to '{_folderName}' on Drive.");
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Drive backup failed");
            return (false, $"Drive backup failed: {ex.Message}");
        }
        finally
        {
            if (snapshotPath is not null)
            {
                try { File.Delete(snapshotPath); } catch { /* ignore */ }
            }
        }
    }

    /// <summary>The Google account email currently authorized (for the status card).</summary>
    public async Task<string?> AccountEmailAsync()
    {
        var access = await EnsureAccessTokenAsync();
        if (access is null) return null;
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get,
                "https://www.googleapis.com/drive/v3/about?fields=user");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", access);
            using var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode) return null;
            var node = JsonNode.Parse(await resp.Content.ReadAsStringAsync());
            return node?["user"]?["emailAddress"]?.GetValue<string>();
        }
        catch { return null; }
    }

    /// <summary>Delete any stored Drive auth tokens (disconnect).</summary>
    public void Disconnect()
    {
        try
        {
            if (File.Exists(_tokenFilePath)) File.Delete(_tokenFilePath);
        }
        catch { /* ignore */ }
    }

    // ------------------------------------------------------------------ internals

    private string? GetRefreshToken()
    {
        var env = Environment.GetEnvironmentVariable("GOOGLE_DRIVE_REFRESH_TOKEN");
        if (!string.IsNullOrWhiteSpace(env)) return env.Trim();

        try
        {
            if (!File.Exists(_tokenFilePath)) return null;
            var node = JsonNode.Parse(File.ReadAllText(_tokenFilePath));
            return node?["refresh_token"]?.GetValue<string>() ?? "";
        }
        catch { return null; }
    }

    private async Task SaveTokensAsync(string accessToken, string refreshToken, long expiresAt)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_tokenFilePath)!);
        await File.WriteAllTextAsync(_tokenFilePath, new JsonObject
        {
            ["access_token"] = accessToken,
            ["refresh_token"] = refreshToken,
            ["expires_at"] = expiresAt,
        }.ToJsonString());
    }

    /// <summary>Return a valid access token, refreshing it if expired (or missing).</summary>
    private async Task<string?> EnsureAccessTokenAsync()
    {
        var refresh = GetRefreshToken();
        if (string.IsNullOrWhiteSpace(refresh)) return null;

        try
        {
            string? cached = null;
            long cachedExpiry = 0;
            if (File.Exists(_tokenFilePath))
            {
                var node = JsonNode.Parse(await File.ReadAllTextAsync(_tokenFilePath));
                cached = node?["access_token"]?.GetValue<string>();
                cachedExpiry = node?["expires_at"]?.GetValue<long>() ?? 0;
            }

            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (!string.IsNullOrWhiteSpace(cached) && cachedExpiry > now + 60)
                return cached;

            var form = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["refresh_token"] = refresh,
                ["client_id"] = _clientId,
                ["client_secret"] = _clientSecret,
                ["grant_type"] = "refresh_token",
            });

            var node2 = await PostTokenAsync(form);
            var access = node2?["access_token"]?.GetValue<string>() ?? "";
            if (string.IsNullOrWhiteSpace(access)) return null;
            var expiresIn = node2?["expires_in"]?.GetValue<int>() ?? 3600;
            await SaveTokensAsync(access, refresh, now + expiresIn);
            return access;
        }
        catch (Exception ex)
        {
            _log.LogWarning("Drive token refresh failed: {Msg}", ex.Message);
            return null;
        }
    }

    private async Task<JsonNode?> PostTokenAsync(FormUrlEncodedContent form)
    {
        using var resp = await _http.PostAsync(TokenEndpoint, form);
        var body = await resp.Content.ReadAsStringAsync();
        if (!resp.IsSuccessStatusCode)
        {
            _log.LogWarning("Google token endpoint {Status}: {Body}", resp.StatusCode, body[..Math.Min(200, body.Length)]);
            return null;
        }
        return JsonNode.Parse(body);
    }

    private async Task<string?> EnsureFolderAsync(string access)
    {
        var q = $"mimeType='{FolderMime}' and name='{_folderName}' and trashed=false";
        var search = await GetJsonAsync(access,
            $"/drive/v3/files?q={Uri.EscapeDataString(q)}&fields=files(id)");
        var files = search?["files"] as JsonArray;
        if (files is { Count: > 0 } && files[0]?["id"]?.GetValue<string>() is { } existing)
            return existing;

        var body = new JsonObject
        {
            ["name"] = _folderName,
            ["mimeType"] = FolderMime,
        };
        using var req = new HttpRequestMessage(HttpMethod.Post, "https://www.googleapis.com/drive/v3/files");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", access);
        req.Content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json");
        using var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return null;
        var node = JsonNode.Parse(await resp.Content.ReadAsStringAsync());
        return node?["id"]?.GetValue<string>();
    }

    private async Task DeleteExistingAsync(string access, string fileName, string folderId)
    {
        var q = $"name='{fileName.Replace("'", "\\'")}' and '{folderId}' in parents and trashed=false";
        var search = await GetJsonAsync(access, $"/drive/v3/files?q={Uri.EscapeDataString(q)}&fields=files(id)");
        var files = search?["files"] as JsonArray;
        if (files is { Count: > 0 } && files[0]?["id"]?.GetValue<string>() is { } oldId)
        {
            using var del = new HttpRequestMessage(HttpMethod.Delete,
                $"https://www.googleapis.com/drive/v3/files/{oldId}");
            del.Headers.Authorization = new AuthenticationHeaderValue("Bearer", access);
            await _http.SendAsync(del);
        }
    }

    private async Task<bool> UploadFileAsync(string access, string folderId, string fileName,
        string filePath, string mimeType)
    {
        var boundary = $"lux-{Guid.NewGuid():N}";
        var meta = new JsonObject { ["name"] = fileName, ["parents"] = new JsonArray(folderId), ["mimeType"] = mimeType };
        var bytes = await File.ReadAllBytesAsync(filePath);
        var metaBytes = Encoding.UTF8.GetBytes($"{{\"name\":\"{fileName}\",\"parents\":[\"{folderId}\"],\"mimeType\":\"{mimeType}\"}}");

        using var content = new MultipartFormDataContent(boundary);
        content.Add(new ByteArrayContent(metaBytes), "metadata");
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
        content.Add(fileContent, "file", fileName);

        using var req = new HttpRequestMessage(HttpMethod.Post,
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", access);
        req.Content = content;
        using var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync();
            _log.LogWarning("Drive upload {Status}: {Body}", resp.StatusCode, body[..Math.Min(200, body.Length)]);
            return false;
        }
        return true;
    }

    private async Task<JsonNode?> GetJsonAsync(string access, string path)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com" + path);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", access);
        using var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return null;
        return JsonNode.Parse(await resp.Content.ReadAsStringAsync());
    }

    /// <summary>Make a consistent copy of the live SQLite database via VACUUM INTO.</summary>
    private async Task<string?> CreateSnapshotAsync()
    {
        var db = await _db.GetConnectionAsync();
        var dir = Path.GetDirectoryName(_db.DbPath)!;
        var snapshot = Path.Combine(dir, $"snapshot-{Guid.NewGuid():N}.db3");
        try
        {
            await db.ExecuteAsync($"VACUUM INTO '{snapshot.Replace("'", "''")}'");
            return File.Exists(snapshot) ? snapshot : null;
        }
        catch (Exception ex)
        {
            _log.LogWarning("Snapshot failed: {Msg}", ex.Message);
            try { File.Delete(snapshot); } catch { /* ignore */ }
            return null;
        }
    }
}
