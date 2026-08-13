using System.Text;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Google.Cloud.Storage.V1;
using LuxInfra.Services;

namespace LuxInfra.Api.Services;

/// <summary>
/// Mirrors the local SQLite database file to Firebase Storage and records a data
/// version in Firestore so the frontend can auto-refresh when data changes.
/// The app keeps working on the local SQLite file (zero changes to the data layer);
/// this service backs it up so data survives Render free-tier redeploys.
/// Enabled only when FIREBASE_PROJECT_ID + FIREBASE_SERVICE_ACCOUNT are set.
/// </summary>
public sealed class FirebaseSyncService : BackgroundService
{
    private readonly DatabaseService _db;
    private readonly ILogger<FirebaseSyncService> _log;

    private readonly bool _enabled;
    private readonly string _projectId;
    private readonly string _bucket;
    private readonly string _objectName = "luxinfra.db3";
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(30);
    private DateTime _lastFileUtc = DateTime.MinValue;
    private long _lastVersion;

    private StorageClient? _storage;
    private FirestoreDb? _firestore;

    public FirebaseSyncService(IConfiguration cfg, DatabaseService db, ILogger<FirebaseSyncService> log)
    {
        _db = db;
        _log = log;

        _projectId = cfg["FIREBASE_PROJECT_ID"] ?? "";
        var rawCred = cfg["FIREBASE_SERVICE_ACCOUNT"] ?? "";
        _bucket = cfg["FIREBASE_BUCKET"] ?? $"{_projectId}.appspot.com";

        if (string.IsNullOrWhiteSpace(_projectId) || string.IsNullOrWhiteSpace(rawCred))
        {
            _enabled = false;
            return;
        }

        try
        {
            var cred = TryLoadCredential(rawCred);
            if (cred is null)
            {
                _enabled = false;
                return;
            }
            _storage = StorageClient.Create(cred);
            _firestore = new FirestoreDbBuilder { ProjectId = _projectId, Credential = cred }.Build();
            _enabled = true;
        }
        catch (Exception ex)
        {
            _enabled = false;
            _log.LogWarning("Firebase init failed (sync disabled): {Msg}", ex.Message);
        }
    }

    public bool Enabled => _enabled;

    private static GoogleCredential? TryLoadCredential(string raw)
    {
        // Accept either the raw JSON, a base64-encoded JSON, or a file path.
        var json = raw.Trim();
        if (!json.TrimStart().StartsWith('{'))
        {
            try { json = Encoding.UTF8.GetString(Convert.FromBase64String(json)); }
            catch { /* not base64 — maybe a file path */ }
        }
        if (File.Exists(json)) return GoogleCredential.FromFile(json);
        return GoogleCredential.FromJson(json);
    }

    /// <summary>Manual push used by the Backup endpoint ("upload to Firebase").</summary>
    public async Task<(bool Ok, string Message)> PushNowAsync(CancellationToken ct = default)
    {
        if (!_enabled) return (false, "Firebase sync is not configured (set FIREBASE_PROJECT_ID + FIREBASE_SERVICE_ACCOUNT).");
        try
        {
            var version = await UploadAsync(ct);
            return version > 0
                ? (true, $"Uploaded current DB to Firebase Storage (version {version}).")
                : (false, "Nothing to upload — DB file missing or unchanged.");
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    /// <summary>Manual pull used by the Backup endpoint ("restore from Firebase").</summary>
    public async Task<(bool Ok, string Message)> PullNowAsync(CancellationToken ct = default)
    {
        if (!_enabled) return (false, "Firebase sync is not configured (set FIREBASE_PROJECT_ID + FIREBASE_SERVICE_ACCOUNT).");
        try
        {
            var ok = await DownloadAsync(ct);
            return ok
                ? (true, "Restored the database from Firebase Storage.")
                : (false, "Restore failed — no backup found in Firebase.");
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<object> StatusAsync()
    {
        var version = await ReadVersionAsync();
        return new
        {
            enabled = _enabled,
            project = _enabled ? _projectId : null,
            bucket = _enabled ? _bucket : null,
            version,
            localRows = LocalRowCount()
        };
    }

    // ---- background loop ----

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        if (!_enabled)
        {
            _log.LogInformation("Firebase sync disabled (set FIREBASE_PROJECT_ID + FIREBASE_SERVICE_ACCOUNT).");
            return;
        }

        _log.LogInformation("Firebase sync enabled → {Project}/{Bucket}", _projectId, _bucket);
        try
        {
            await ReconcileAsync(ct);
        }
        catch (Exception ex)
        {
            _log.LogWarning("Firebase initial sync failed: {Msg}", ex.Message);
        }

        using var timer = new PeriodicTimer(_interval);
        while (await timer.WaitForNextTickAsync(ct))
        {
            try
            {
                var mtime = File.Exists(_db.DbPath) ? File.GetLastWriteTimeUtc(_db.DbPath) : DateTime.MinValue;
                if (mtime != _lastFileUtc)
                {
                    var version = await UploadAsync(ct);
                    if (version > 0)
                        _lastFileUtc = File.Exists(_db.DbPath) ? File.GetLastWriteTimeUtc(_db.DbPath) : mtime;
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning("Firebase push failed: {Msg}", ex.Message);
            }
        }
    }

    // ---- reconcile ----

    private async Task ReconcileAsync(CancellationToken ct)
    {
        var empty = LocalRowCount() == 0;
        if (!empty)
        {
            var v = await UploadAsync(ct);
            if (v > 0) _log.LogInformation("Uploaded local DB to Firebase (version {V}).", v);
            return;
        }

        var exists = await RemoteExistsAsync(ct);
        if (exists)
        {
            if (await DownloadAsync(ct))
                _log.LogInformation("Restored the database from Firebase.");
        }
        else
        {
            var v = await UploadAsync(ct);
            if (v > 0) _log.LogInformation("Firebase empty — uploaded fresh local state (version {V}).", v);
        }
    }

    private int LocalRowCount()
    {
        try
        {
            using var conn = OpenConn();
            long total = 0;
            foreach (var t in GetTables(conn))
                total += conn.ExecuteScalar<long>($"SELECT COUNT(*) FROM \"{t}\"");
            return (int)Math.Min(total, int.MaxValue);
        }
        catch { return 0; }
    }

    // ---- push: local -> Firebase ----

    private async Task<long> UploadAsync(CancellationToken ct)
    {
        if (!File.Exists(_db.DbPath)) return 0;
        await using var stream = File.OpenRead(_db.DbPath);

        var obj = await _storage!.UploadObjectAsync(
            _bucket, _objectName, "application/x-sqlite3", stream,
            options: new UploadObjectOptions { IfGenerationMatch = null }, cancellationToken: ct);

        var version = DateTime.UtcNow.Ticks;
        await SetVersionAsync(version, ct);
        _lastVersion = version;
        _log.LogInformation("Uploaded {Size} bytes → gs://{B}/{O} (version {V}).",
            obj.Size ?? 0, _bucket, _objectName, version);
        return version;
    }

    // ---- pull: Firebase -> local ----

    private async Task<bool> DownloadAsync(CancellationToken ct)
    {
        await using var stream = new MemoryStream();
        try
        {
            await _storage!.DownloadObjectAsync(_bucket, _objectName, stream, cancellationToken: ct);
        }
        catch (Google.GoogleApiException ex) when (ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
        if (stream.Length == 0) return false;

        // Replace the local file safely: close the shared connection first.
        await _db.CloseAndResetAsync();
        var tmp = _db.DbPath + ".tmp";
        await File.WriteAllBytesAsync(tmp, stream.ToArray(), ct);
        File.Move(tmp, _db.DbPath, overwrite: true);

        var version = await ReadVersionAsync();
        _lastVersion = version;
        _lastFileUtc = File.Exists(_db.DbPath) ? File.GetLastWriteTimeUtc(_db.DbPath) : DateTime.MinValue;
        _log.LogInformation("Restored {Size} bytes from gs://{B}/{O} (version {V}).",
            stream.Length, _bucket, _objectName, version);
        return true;
    }

    private async Task<bool> RemoteExistsAsync(CancellationToken ct)
    {
        try
        {
            var obj = await _storage!.GetObjectAsync(_bucket, _objectName, cancellationToken: ct);
            return obj is not null;
        }
        catch (Google.GoogleApiException ex) when (ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    // ---- version meta doc (Firestore) ----

    private const string MetaCollection = "meta";
    private const string MetaDoc = "data";

    private async Task SetVersionAsync(long version, CancellationToken ct)
    {
        if (_firestore is null) return;
        var doc = _firestore.Collection(MetaCollection).Document(MetaDoc);
        await doc.SetAsync(new { dataVersion = version, updatedAt = DateTime.UtcNow }, SetOptions.MergeAll, ct);
    }

    private async Task<long> ReadVersionAsync()
    {
        if (_firestore is null) return 0;
        try
        {
            var snap = await _firestore.Collection(MetaCollection).Document(MetaDoc).GetSnapshotAsync();
            return snap.Exists && snap.TryGetValue<long>("dataVersion", out var v) ? v : 0;
        }
        catch { return 0; }
    }

    // ---- sqlite helpers ----

    private static List<string> GetTables(SQLite.SQLiteConnection conn) =>
        conn.QueryScalars<string>(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

    private SQLite.SQLiteConnection OpenConn() =>
        new(_db.DbPath, SQLite.SQLiteOpenFlags.ReadWrite | SQLite.SQLiteOpenFlags.Create);
}
