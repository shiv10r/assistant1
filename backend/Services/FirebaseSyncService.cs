using System.IO.Compression;
using System.Text;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using LuxInfra.Services;

namespace LuxInfra.Api.Services;

/// <summary>
/// Mirrors the local SQLite database file to Firestore (chunked gzip + base64) and records a
/// data version doc so the frontend auto-refreshes when data changes. The app keeps working on
/// the local SQLite file; this service backs it up so data survives Render free-tier redeploys.
///
/// Firestore is used (not Cloud Storage) because Storage buckets require the paid Blaze plan.
/// Enabled only when FIREBASE_PROJECT_ID + FIREBASE_SERVICE_ACCOUNT are set.
/// </summary>
public sealed class FirebaseSyncService : BackgroundService
{
    private readonly DatabaseService _db;
    private readonly ILogger<FirebaseSyncService> _log;

    private readonly bool _enabled;
    private readonly string _projectId;
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(30);
    private DateTime _lastFileUtc = DateTime.MinValue;
    private long _lastVersion;

    private FirestoreDb? _firestore;

    public FirebaseSyncService(IConfiguration cfg, DatabaseService db, ILogger<FirebaseSyncService> log)
    {
        _db = db;
        _log = log;

        _projectId = cfg["FIREBASE_PROJECT_ID"] ?? "";
        var rawCred = cfg["FIREBASE_SERVICE_ACCOUNT"] ?? "";

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
                ? (true, $"Stored current DB in Firestore (version {version}).")
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
                ? (true, "Restored the database from Firestore.")
                : (false, "Restore failed — no backup found in Firestore.");
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
            bucket = _enabled ? $"{_projectId} (Firestore)" : null,
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

        _log.LogInformation("Firebase sync enabled → Firestore project {Project}", _projectId);
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
            if (v > 0) _log.LogInformation("Stored local DB in Firestore (version {V}).", v);
            return;
        }

        var exists = await RemoteExistsAsync(ct);
        if (exists)
        {
            if (await DownloadAsync(ct))
                _log.LogInformation("Restored the database from Firestore.");
        }
        else
        {
            var v = await UploadAsync(ct);
            if (v > 0) _log.LogInformation("Firestore empty — stored fresh local state (version {V}).", v);
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

    // ---- Firestore snapshot doc layout ----
    // backup/luxinfra  →  { version: long, chunkCount: int, size: int, updatedAt: Timestamp }
    // backup/chunks/{i} →  { index: int, data: base64(gzip(dbfile)) }

    private const string SnapshotDoc = "backup/luxinfra";
    private const string ChunksPath = "backup/chunks";
    private readonly int _chunkLimit = 110_000; // ~82KB binary per chunk → safe under doc limits

    // ---- push: local -> Firestore ----

    private async Task<long> UploadAsync(CancellationToken ct)
    {
        if (!File.Exists(_db.DbPath)) return 0;

        var bytes = File.ReadAllBytes(_db.DbPath);
        var packed = Pack(bytes);

        // Delete old chunks first so a restore never mixes generations.
        await ClearChunksAsync(ct);

        var count = (int)Math.Ceiling((double)packed.Length / _chunkLimit);
        var coll = _firestore!.Collection(ChunksPath);
        for (var i = 0; i < count; i++)
        {
            var part = packed.Substring(i * _chunkLimit, Math.Min(_chunkLimit, packed.Length - i * _chunkLimit));
            await coll.Document(i.ToString()).SetAsync(new { index = i, data = part }, cancellationToken: ct);
        }

        var version = DateTime.UtcNow.Ticks;
        _firestore.Document(SnapshotDoc).SetAsync(new
        {
            version,
            chunkCount = count,
            size = bytes.Length,
            updatedAt = DateTime.UtcNow
        }, SetOptions.MergeAll, ct).GetAwaiter().GetResult();
        await SetVersionAsync(version, ct);
        _lastVersion = version;
        _log.LogInformation("Stored {Size} bytes → Firestore {Project} (version {V}, {N} chunks).",
            bytes.Length, _projectId, version, count);
        return version;
    }

    private async Task ClearChunksAsync(CancellationToken ct)
    {
        var coll = _firestore!.Collection(ChunksPath);
        var snaps = await coll.GetSnapshotAsync(ct);
        foreach (var snap in snaps.Documents)
            await snap.Reference.DeleteAsync(cancellationToken: ct);
    }

    // ---- pull: Firestore -> local ----

    private async Task<bool> DownloadAsync(CancellationToken ct)
    {
        var snap = await _firestore!.Document(SnapshotDoc).GetSnapshotAsync(ct);
        if (!snap.Exists || !snap.TryGetValue<int>("chunkCount", out var count) || count <= 0)
            return false;

        var sb = new StringBuilder();
        var coll = _firestore.Collection(ChunksPath);
        for (var i = 0; i < count; i++)
        {
            var chunk = await coll.Document(i.ToString()).GetSnapshotAsync(ct);
            if (!chunk.Exists || !chunk.TryGetValue<string>("data", out var data)) return false;
            sb.Append(data);
        }

        var bytes = Unpack(sb.ToString());
        if (bytes.Length == 0) return false;

        // Replace the local file safely: close the shared connection first.
        await _db.CloseAndResetAsync();
        var tmp = _db.DbPath + ".tmp";
        await File.WriteAllBytesAsync(tmp, bytes, ct);
        File.Move(tmp, _db.DbPath, overwrite: true);

        _lastVersion = snap.TryGetValue<long>("version", out var v) ? v : 0;
        _lastFileUtc = File.Exists(_db.DbPath) ? File.GetLastWriteTimeUtc(_db.DbPath) : DateTime.MinValue;
        _log.LogInformation("Restored {Size} bytes from Firestore (version {V}).", bytes.Length, _lastVersion);
        return true;
    }

    private async Task<bool> RemoteExistsAsync(CancellationToken ct)
    {
        var snap = await _firestore!.Document(SnapshotDoc).GetSnapshotAsync(ct);
        return snap.Exists;
    }

    // ---- pack / unpack ----

    private static string Pack(byte[] bytes)
    {
        using var ms = new MemoryStream();
        using (var gz = new GZipStream(ms, CompressionLevel.Optimal, leaveOpen: true))
            gz.Write(bytes, 0, bytes.Length);
        return Convert.ToBase64String(ms.ToArray());
    }

    private static byte[] Unpack(string packed)
    {
        var raw = Convert.FromBase64String(packed);
        using var input = new MemoryStream(raw);
        using var gz = new GZipStream(input, CompressionMode.Decompress);
        using var output = new MemoryStream();
        gz.CopyTo(output);
        return output.ToArray();
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