using LuxInfra.Models;
using LuxInfra.Repositories;

namespace LuxInfra.Api.Auth;

public sealed class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _adminToken;
    private readonly IUserRepository _users;

    public TokenAuthMiddleware(RequestDelegate next, AuthOptions auth, IUserRepository users)
    {
        _next = next;
        _adminToken = auth.Token;
        _users = users;
    }

    public async Task Invoke(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? "";
        var isPublic = path.StartsWith("/api/auth/login", StringComparison.OrdinalIgnoreCase) ||
                       path.StartsWith("/api/payments/razorpay/webhook", StringComparison.OrdinalIgnoreCase) ||
                       path.StartsWith("/api/integrations/drive/callback", StringComparison.OrdinalIgnoreCase);

        if (!isPublic)
        {
            var authHeader = ctx.Request.Headers.Authorization.ToString();
            var token = authHeader.StartsWith("Bearer ", StringComparison.Ordinal)
                ? authHeader["Bearer ".Length..].Trim()
                : "";

            var role = await ResolveRoleAsync(token);

            if (role is null)
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await ctx.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
                return;
            }

            ctx.Items["Role"] = role;
            ctx.Items["Username"] = token == _adminToken ? "admin" : "";
        }

        await _next(ctx);
    }

    private async Task<string?> ResolveRoleAsync(string token)
    {
        if (string.IsNullOrEmpty(token)) return null;

        // Owner / admin uses the static API_TOKEN.
        if (token == _adminToken) return Roles.Admin;

        // Staff users get a per-user session token.
        var session = await _users.GetSessionAsync(token);
        if (session is null || session.ExpiresAt < DateTime.UtcNow) return null;

        var user = await _users.GetUserAsync(session.UserId);
        if (user is null || !user.IsActive) return null;

        return session.Role;
    }
}
