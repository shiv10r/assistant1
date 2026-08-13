using FirebaseAdmin.Messaging;
using LuxInfra.Models;
using LuxInfra.Repositories;

namespace LuxInfra.Api.Services;

/// <summary>
/// Sends push notifications via Firebase Cloud Messaging (free Spark plan) to every registered
/// web device token. Token registration is persisted via IUserRepository.
/// </summary>
public sealed class PushService
{
    private readonly FirebasePlatformService _fb;
    private readonly IUserRepository _users;
    private readonly ILogger<PushService> _log;

    public PushService(FirebasePlatformService fb, IUserRepository users, ILogger<PushService> log)
    {
        _fb = fb;
        _users = users;
        _log = log;
    }

    public bool Enabled => _fb.Enabled;

    public async Task<(bool Ok, string Message)> RegisterAsync(string token, string platform, string username)
    {
        if (string.IsNullOrWhiteSpace(token)) return (false, "Token is required");
        await _users.AddDeviceTokenAsync(new DeviceToken
        {
            Token = token,
            Platform = string.IsNullOrWhiteSpace(platform) ? "web" : platform,
            Username = username
        });
        return (true, "Device registered for notifications.");
    }

    public async Task<List<DeviceToken>> DevicesAsync() => await _users.GetDeviceTokensAsync();

    public async Task RemoveAsync(string token) => await _users.RemoveDeviceTokenAsync(token);

    /// <summary>Sends a notification to all registered devices. Returns the number sent.</summary>
    public async Task<int> SendAsync(string title, string body, string? url = null)
    {
        if (!_fb.Enabled) return 0;
        var tokens = await _users.GetDeviceTokensAsync();
        if (tokens.Count == 0) return 0;

        var sent = 0;
        foreach (var device in tokens)
        {
            try
            {
                var message = new Message
                {
                    Token = device.Token,
                    Notification = new Notification { Title = title, Body = body },
                    Webpush = new WebpushConfig
                    {
                        Notification = new WebpushNotification { Title = title, Body = body },
                        FcmOptions = url is null ? null : new WebpushFcmOptions { Link = url }
                    }
                };
                await FirebaseMessaging.DefaultInstance.SendAsync(message);
                sent++;
            }
            catch (FirebaseMessagingException ex)
            {
                _log.LogWarning("FCM send failed ({Code}): {Msg}", ex.MessagingErrorCode, ex.Message);
                if (ex.MessagingErrorCode == MessagingErrorCode.InvalidArgument ||
                    ex.MessagingErrorCode == MessagingErrorCode.Unregistered ||
                    ex.MessagingErrorCode == MessagingErrorCode.SenderIdMismatch)
                {
                    await _users.RemoveDeviceTokenAsync(device.Token);
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning("FCM send error: {Msg}", ex.Message);
            }
        }
        return sent;
    }
}