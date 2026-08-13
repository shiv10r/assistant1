using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using LuxInfra.Services;
using SQLite;

namespace LuxInfra.Api.Services;

/// <summary>
/// Mirrors the local SQLite database to a Turso (libSQL) cloud database.
/// The app keeps working on the local SQLite file (zero changes to the data layer);
/// this service snapshots it to Turso so data survives Render free-tier redeploys
/// (whose disk is wiped). Enabled only when TURSO_URL + TURSO_TOKEN are set.
/// </summary>
public sealed class TursoSyncService : BackgroundService
{
    private readonly DatabaseService _db;
    private readonly ILogger<TursoSyncService> _log;
    private readonly HttpClient _http;
    private readonly string _baseUrl;
    private readonly bool _enabled;
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(30);
    private DateTime _lastFileUtc = DateTime.MinValue;

    public TursoSyncService(IConfiguration cfg, DatabaseService db, ILogger<TursoSyncService> log)
    {
        _db = db;
        _log = log;
        _http = new HttpClient();

        var url = cfg["TURSO_URL"] ?? "";
        var token = cfg["TURSO_TOKEN"] ?? "";
        _enabled = !string.IsNullOrWhiteSpace(url) && !string.IsNullOrWhiteSpace(token);
        if (_enabled)
        {
            _baseUrl = url.Trim().Replace("libsql://", "https://").TrimEnd('/');
            _http.DefaultRequestHeaders.Authorization = new("Bearer", token.Trim());
        }
        else
        {
            _baseUrl = "";
        }
    }

    public bool Enabled => _enabled;
    public string BaseUrl => _baseUrl;

    /// <summary>Manual push used by the Backup endpoint ("sync now to cloud").</summary>
    public async Task<(bool Ok, string Message)> PushNowAsync(CancellationToken ct = default)
    {
        if (!_enabled) return (false, "Cloud sync is not configured (set TURSO_URL / TURSO_TOKEN).");
        try
        {
            var ok = await PushSnapshotAsync(ct);
            return ok
                ? (true, "Pushed local data to the cloud.")
                : (false, "Push failed — see server logs.");
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    /// <summary>Manual pull used by the Backup endpoint ("restore from cloud").</summary>
    public async Task<(bool Ok, string Message)> PullNowAsync(CancellationToken ct = default)
    {
        if (!_enabled) return (false, "Cloud sync is not configured (set TURSO_URL / TURSO_TOKEN).");
        try
        {
            await PullSnapshotAsync(ct);
            return (true, "Restored data from the cloud.");
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<object> StatusAsync()
    {
        var localRows = 0;
        using (var conn = OpenConn())
        {
            foreach (var t in GetTables(conn))
                localRows += (int)conn.ExecuteScalar<long>($"SELECT COUNT(*) FROM \"{t}\"");
        }
        return new
        {
            enabled = _enabled,
            url = _enabled ? _baseUrl : null,
            localRows
        };
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        if (!_enabled)
        {
            _log.LogInformation("Turso sync disabled (set TURSO_URL / TURSO_TOKEN).");
            return;
        }

        _log.LogInformation("Turso sync enabled → {Url}", _baseUrl);
        try
        {
            await _db.GetConnectionAsync();
            await ReconcileAsync(ct);
        }
        catch (Exception ex)
        {
            _log.LogWarning("Turso initial sync failed: {Msg}", ex.Message);
        }

        using var timer = new PeriodicTimer(_interval);
        while (await timer.WaitForNextTickAsync(ct))
        {
            try
            {
                var mtime = File.Exists(_db.DbPath) ? File.GetLastWriteTimeUtc(_db.DbPath) : DateTime.MinValue;
                if (mtime != _lastFileUtc)
                {
                    await PushSnapshotAsync(ct);
                    _lastFileUtc = File.Exists(_db.DbPath) ? File.GetLastWriteTimeUtc(_db.DbPath) : mtime;
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning("Turso push failed: {Msg}", ex.Message);
            }
        }
    }

    // ---------- reconciliation ----------

    private async Task ReconcileAsync(CancellationToken ct)
    {
        var fresh = IsLocalEmpty();
        if (!fresh)
        {
            if (await PushSnapshotAsync(ct))
                _log.LogInformation("Pushed local data to Turso.");
            return;
        }

        var remoteCount = await RemoteRowCountAsync(ct);
        if (remoteCount > 0)
        {
            await PullSnapshotAsync(ct);
            _log.LogInformation("Restored {N} rows from Turso.", remoteCount);
        }
        else
        {
            if (await PushSnapshotAsync(ct))
                _log.LogInformation("Turso empty — pushed fresh local state.");
        }
    }

    private bool IsLocalEmpty()
    {
        using var conn = OpenConn();
        long total = 0;
        foreach (var t in GetTables(conn))
            total += conn.ExecuteScalar<long>($"SELECT COUNT(*) FROM \"{t}\"");
        return total == 0;
    }

    // ---------- push: local SQLite -> Turso ----------

    private async Task<bool> PushSnapshotAsync(CancellationToken ct)
    {
        using var conn = OpenConn();
        var tables = GetTables(conn);
        if (tables.Count == 0) return false;

        var requests = new List<JsonNode> { Stmt("BEGIN") };
        var emitted = false;

        foreach (var t in tables)
        {
            var createSql = conn.ExecuteScalar<string?>(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name = ?", t);
            if (!string.IsNullOrWhiteSpace(createSql))
            {
                requests.Add(Stmt(WithIfNotExists(createSql)));
                emitted = true;
            }

            var cols = GetColumns(conn, t);
            if (cols.Count == 0) continue;

            var count = conn.ExecuteScalar<long>($"SELECT COUNT(*) FROM \"{t}\"");
            if (count == 0) continue;

            var rows = ReadRows(conn, t, cols, (int)count);
            requests.Add(Stmt($"DELETE FROM \"{t}\""));
            foreach (var row in rows)
            {
                var sql = $"INSERT INTO \"{t}\" ({string.Join(",", cols.Select(c => $"\"{c.Name}\""))}) " +
                          $"VALUES ({string.Join(",", cols.Select(_ => "?"))})";
                requests.Add(Stmt(sql, row.Select(ToArg)));
            }
            emitted = true;
        }

        if (!emitted) return false;
        requests.Add(Stmt("COMMIT"));

        var pushOk = await SendAsync(requests, ct);
        if (pushOk is null)
        {
            _log.LogWarning("Turso push failed (pipeline error).");
            return false;
        }

        _log.LogInformation("Pushed {N} tables to Turso.", tables.Count);
        return true;
    }

    private static List<List<object?>> ReadRows(SQLiteConnection conn, string table,
        List<(string Name, string Type)> cols, int count)
    {
        var rows = new List<List<object?>>();
        for (var i = 0; i < count; i++) rows.Add(new List<object?>());

        foreach (var (name, type) in cols)
        {
            var values = conn.QueryScalars<string>($"SELECT \"{name}\" FROM \"{table}\" ORDER BY rowid");
            for (var i = 0; i < values.Count && i < rows.Count; i++)
                rows[i].Add(ParseLocalValue(values[i], type));
        }
        return rows;
    }

    /// <summary>sqlite-net-pcl can't read raw columns as System.Object, so read as string and convert by declared type.</summary>
    private static object? ParseLocalValue(string? raw, string declType)
    {
        if (raw is null) return null;
        var t = declType.ToUpperInvariant();
        if (t.Contains("INT")) return long.Parse(raw, NumberStyles.Any, CultureInfo.InvariantCulture);
        if (t.Contains("REAL") || t.Contains("FLOA") || t.Contains("DOUB"))
            return double.Parse(raw, NumberStyles.Any, CultureInfo.InvariantCulture);
        return raw;
    }

    // ---------- pull: Turso -> local SQLite ----------

    private async Task PullSnapshotAsync(CancellationToken ct)
    {
        // 1) fetch remote schema (table names + CREATE SQL)
        var schemaReq = new[] { Stmt("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") };
        var schemaRes = await SendAsync(schemaReq, ct);
        if (schemaRes is null) return;

        var remote = new List<(string Name, string Sql)>();
        foreach (var r in schemaRes)
        {
            var rows = r?["response"]?["result"]?["rows"]?.AsArray();
            if (rows is null) continue;
            foreach (var row in rows)
            {
                var arr = row!.AsArray();
                var name = arr[0]?["value"]?.GetValue<string>() ?? "";
                var sql = arr.Count > 1 ? arr[1]?["value"]?.GetValue<string>() ?? "" : "";
                if (!string.IsNullOrWhiteSpace(name)) remote.Add((name, sql));
            }
        }

        if (remote.Count == 0)
        {
            _log.LogInformation("Turso has no tables to pull.");
            return;
        }

        using var conn = OpenConn();

        // 2) create missing local tables from remote schema
        foreach (var (name, sql) in remote)
        {
            var existing = conn.ExecuteScalar<int>(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name = ?", name);
            if (existing == 0 && !string.IsNullOrWhiteSpace(sql))
                conn.Execute(sql);
        }

        // 3) fetch + insert all rows
        var dataReqs = new List<JsonNode>();
        foreach (var (name, _) in remote)
            dataReqs.Add(Stmt($"SELECT * FROM \"{name}\""));
        if (dataReqs.Count == 0) return;

        var dataRes = await SendAsync(dataReqs, ct);
        if (dataRes is null) return;

        for (var i = 0; i < remote.Count; i++)
        {
            var (name, _) = remote[i];
            var res = dataRes[i];
            var colsNode = res?["response"]?["result"]?["cols"]?.AsArray();
            var rowsNode = res?["response"]?["result"]?["rows"]?.AsArray();
            if (colsNode is null || rowsNode is null) continue;

            var cols = colsNode.Select(c => c?["name"]?.GetValue<string>() ?? "").Where(c => c != "").ToList();
            if (cols.Count == 0) continue;

            conn.Execute($"DELETE FROM \"{name}\"");
            foreach (var row in rowsNode)
            {
                var arr = row!.AsArray();
                if (arr.Count < cols.Count) continue;
                var values = new object?[cols.Count];
                for (var c = 0; c < cols.Count; c++)
                    values[c] = ParseVal(arr[c]);
                var sql = $"INSERT INTO \"{name}\" ({string.Join(",", cols.Select(c => $"\"{c}\""))}) " +
                          $"VALUES ({string.Join(",", cols.Select(_ => "?"))})";
                conn.Execute(sql, values);
            }

            FixAutoIncrement(conn, name);
        }

        _log.LogInformation("Restored {T} tables from Turso.", remote.Count);
    }

    /// <summary>After inserting rows with explicit Ids, advance sqlite_sequence so new inserts don't collide.</summary>
    private static void FixAutoIncrement(SQLiteConnection conn, string table)
    {
        try
        {
            var pk = conn.QueryScalars<string>(
                $"SELECT name FROM pragma_table_info('{table}') WHERE pk = 1 AND type = 'INTEGER'");
            var pkCol = pk.FirstOrDefault();
            if (pkCol is null) return;
            conn.Execute(
                $"UPDATE sqlite_sequence SET seq = COALESCE((SELECT MAX(\"{pkCol}\") FROM \"{table}\"), 0) WHERE name = '{table}'");
        }
        catch
        {
            // table without autoincrement sequence — safe to ignore
        }
    }

    private static object? ParseVal(JsonNode? v)
    {
        var type = v?["type"]?.GetValue<string>() ?? "null";
        var val = v?["value"];
        if (val is null) return null;
        return type switch
        {
            "integer" or "int" => val.GetValueKind() == JsonValueKind.String
                ? long.Parse(val.GetValue<string>(), NumberStyles.Any, CultureInfo.InvariantCulture)
                : val.GetValue<long>(),
            "real" or "float" or "double" => val.GetValue<double>(),
            "text" => val.GetValue<string>(),
            "blob" => val.GetValue<string>() is { } b ? Convert.FromBase64String(b) : null,
            _ => null,
        };
    }

    // ---------- Turso HTTP ----------

    private async Task<long> RemoteRowCountAsync(CancellationToken ct)
    {
        var req = new[] { Stmt("SELECT COUNT(*) AS n FROM (SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%')") };
        var res = await SendAsync(req, ct);
        if (res is null) return 0;
        var first = res[0]?["response"]?["result"]?["rows"]?[0]?[0]?["value"]?.GetValue<string>();
        return long.TryParse(first, out var n) ? n : 0;
    }

    private async Task<List<JsonNode>?> SendAsync(IReadOnlyList<JsonNode> requests, CancellationToken ct)
    {
        var body = new JsonObject { ["requests"] = new JsonArray(requests.Select(r => r.DeepClone()).ToArray()) };
        using var content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json");
        using var resp = await _http.PostAsync($"{_baseUrl}/v2/pipeline", content, ct);
        if (!resp.IsSuccessStatusCode)
        {
            _log.LogWarning("Turso HTTP {(int)Code}: {Body}", (int)resp.StatusCode, await resp.Content.ReadAsStringAsync(ct));
            return null;
        }

        var root = JsonNode.Parse(await resp.Content.ReadAsStringAsync(ct));
        var results = root?["results"]?.AsArray();
        if (results is null) return null;

        foreach (var r in results)
        {
            if (r?["type"]?.GetValue<string>() != "ok")
            {
                _log.LogWarning("Turso pipeline error: {Json}", r?.ToJsonString());
                return null;
            }
        }
        return results.Select(r => r!).ToList();
    }

    // ---------- helpers ----------

    private static string WithIfNotExists(string sql)
    {
        var s = sql.TrimStart();
        return s.StartsWith("CREATE TABLE", StringComparison.OrdinalIgnoreCase)
            ? s.Insert("CREATE TABLE".Length, " IF NOT EXISTS")
            : s;
    }

    private static JsonObject Stmt(string sql, IEnumerable<JsonNode?>? args = null)
    {
        var stmt = new JsonObject { ["sql"] = sql };
        if (args is not null)
        {
            var arr = new JsonArray();
            foreach (var a in args) arr.Add(a);
            stmt["args"] = arr;
        }
        return new JsonObject { ["type"] = "execute", ["stmt"] = stmt };
    }

    private static JsonNode? ToArg(object? v)
    {
        var o = new JsonObject();
        switch (v)
        {
            case null:
                o["type"] = "null"; o["value"] = null; break;
            case bool b:
                o["type"] = "integer"; o["value"] = (b ? 1 : 0).ToString(CultureInfo.InvariantCulture); break;
            case int i:
                o["type"] = "integer"; o["value"] = i.ToString(CultureInfo.InvariantCulture); break;
            case long l:
                o["type"] = "integer"; o["value"] = l.ToString(CultureInfo.InvariantCulture); break;
            case double d:
                o["type"] = "float"; o["value"] = d; break;
            case string s:
                o["type"] = "text"; o["value"] = s; break;
            case byte[] b:
                o["type"] = "blob"; o["value"] = Convert.ToBase64String(b); break;
            case DateTime dt:
                o["type"] = "integer"; o["value"] = dt.Ticks.ToString(CultureInfo.InvariantCulture); break;
            default:
                o["type"] = "text"; o["value"] = v.ToString() ?? ""; break;
        }
        return o;
    }

    private static List<string> GetTables(SQLiteConnection conn) =>
        conn.QueryScalars<string>(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

    private static List<(string Name, string Type)> GetColumns(SQLiteConnection conn, string table)
    {
        var names = conn.QueryScalars<string>($"SELECT name FROM pragma_table_info('{table.Replace("'", "''")}')");
        var types = conn.QueryScalars<string>($"SELECT type FROM pragma_table_info('{table.Replace("'", "''")}')");
        var result = new List<(string, string)>();
        for (var i = 0; i < names.Count; i++)
            result.Add((names[i], i < types.Count ? types[i] ?? "" : ""));
        return result;
    }

    private SQLiteConnection OpenConn() =>
        new(_db.DbPath, SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create);
}
