namespace LuxInfra.Api.Auth;

public sealed class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _token;

    public TokenAuthMiddleware(RequestDelegate next, AuthOptions auth)
    {
        _next = next;
        _token = auth.Token;
    }

    public async Task Invoke(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? "";
        var isLogin = path.StartsWith("/api/auth/login", StringComparison.OrdinalIgnoreCase);

        if (!isLogin)
        {
            var authHeader = ctx.Request.Headers.Authorization.ToString();
            var ok = authHeader.StartsWith("Bearer ", StringComparison.Ordinal) &&
                     authHeader["Bearer ".Length..].Trim() == _token;
            if (!ok)
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await ctx.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
                return;
            }
        }

        await _next(ctx);
    }
}
