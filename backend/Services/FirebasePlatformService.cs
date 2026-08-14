using System.Text;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

namespace LuxInfra.Api.Services;

/// <summary>
/// Shared Firebase platform wrapper (free Spark-plan features only):
///  - Firebase Auth: verify client ID tokens (email/password + Google sign-in).
///  - Firebase Cloud Messaging: push notifications to registered web devices.
/// Requires FIREBASE_PROJECT_ID + FIREBASE_SERVICE_ACCOUNT (+ FIREBASE_*_WEB_* for the browser SDK,
/// and FIREBASE_VAPID_KEY for web push). No-ops when not configured.
/// </summary>
public sealed class FirebasePlatformService
{
    private readonly FirebaseApp? _app;

    public bool Enabled { get; }
    public string ProjectId { get; }

    // Web SDK config (browser connects directly to Firebase Auth / FCM / Analytics / Performance).
    public string ApiKey { get; } = "";
    public string AuthDomain { get; } = "";
    public string StorageBucket { get; } = "";
    public string MessagingSenderId { get; } = "";
    public string AppId { get; } = "";
    public string VapidKey { get; } = "";
    public string MeasurementId { get; } = "";

    public FirebasePlatformService(IConfiguration cfg)
    {
        ProjectId = cfg["FIREBASE_PROJECT_ID"] ?? "";
        var rawCred = cfg["FIREBASE_SERVICE_ACCOUNT"] ?? "";
        ApiKey = cfg["FIREBASE_WEB_API_KEY"] ?? "";
        AuthDomain = cfg["FIREBASE_AUTH_DOMAIN"] ?? (ProjectId.Length > 0 ? $"{ProjectId}.firebaseapp.com" : "");
        StorageBucket = cfg["FIREBASE_STORAGE_BUCKET"] ?? (ProjectId.Length > 0 ? $"{ProjectId}.firebasestorage.app" : "");
        MessagingSenderId = cfg["FIREBASE_SENDER_ID"] ?? "";
        AppId = cfg["FIREBASE_APP_ID"] ?? "";
        VapidKey = cfg["FIREBASE_VAPID_KEY"] ?? "";
        MeasurementId = cfg["FIREBASE_MEASUREMENT_ID"] ?? "";

        if (string.IsNullOrWhiteSpace(ProjectId) || string.IsNullOrWhiteSpace(rawCred))
        {
            Enabled = false;
            return;
        }

        try
        {
            var cred = TryLoadCredential(rawCred);
            if (cred is null) { Enabled = false; return; }
            _app = FirebaseApp.Create(new AppOptions { Credential = cred, ProjectId = ProjectId });
            Enabled = true;
        }
        catch
        {
            Enabled = false;
        }
    }

    public object WebConfig() => new
    {
        apiKey = ApiKey,
        authDomain = AuthDomain,
        projectId = ProjectId,
        storageBucket = StorageBucket,
        messagingSenderId = MessagingSenderId,
        appId = AppId,
        vapidKey = VapidKey,
        measurementId = MeasurementId,
        enabled = Enabled,
    };

    private static GoogleCredential? TryLoadCredential(string raw)
    {
        var json = raw.Trim();
        if (!json.TrimStart().StartsWith('{'))
        {
            try { json = Encoding.UTF8.GetString(Convert.FromBase64String(json)); }
            catch { /* maybe a file path */ }
        }
        if (File.Exists(json)) return GoogleCredential.FromFile(json);
        return GoogleCredential.FromJson(json);
    }

    /// <summary>Verifies a Firebase client ID token and returns its trusted payload.</summary>
    public async Task<(bool Ok, string Error, string? Email, string? Uid)> VerifyIdTokenAsync(string idToken)
    {
        if (!Enabled || _app is null) return (false, "Firebase is not configured", null, null);
        try
        {
            var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            var email = decoded.Uid?.StartsWith("email:", StringComparison.OrdinalIgnoreCase) == true
                ? decoded.Uid["email:".Length..]
                : decoded.Claims.TryGetValue("email", out var e) && e is string es ? es : null;
            return (true, "", email, decoded.Uid);
        }
        catch (Exception ex)
        {
            return (false, ex.Message, null, null);
        }
    }
}