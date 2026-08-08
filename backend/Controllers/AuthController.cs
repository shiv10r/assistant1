using System.Security.Cryptography;
using System.Text;
using LuxInfra.Api.Auth;
using LuxInfra.Models;
using LuxInfra.Repositories;
using LuxInfra.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthOptions _auth;
    private readonly IUserRepository _users;
    private readonly IActivityService _activity;

    public AuthController(AuthOptions auth, IUserRepository users, IActivityService activity)
    {
        _auth = auth;
        _users = users;
        _activity = activity;
    }

    public record LoginRequest(string? Username, string? Password);
    public record LoginResult(string Token, string Username, string Role);
    public record RegisterRequest(string? Username, string? Password, string? Name);

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult> Login([FromBody] LoginRequest req)
    {
        // Owner / admin login via env-configured credentials → static API_TOKEN.
        if (string.Equals(req.Username, _auth.Username, StringComparison.Ordinal) &&
            string.Equals(req.Password, _auth.Password, StringComparison.Ordinal))
        {
            return Ok(new LoginResult(_auth.Token, _auth.Username, Roles.Admin));
        }

        // Staff login from the users table → issue a scoped session token.
        var user = await _users.GetUserByUsernameAsync(req.Username ?? "");
        if (user is not null && user.IsActive && VerifyPassword(req.Password ?? "", user.PasswordHash))
        {
            var token = GenerateToken();
            await _users.CreateSessionAsync(new UserSession
            {
                Token = token,
                UserId = user.Id,
                Username = user.Username,
                Role = user.Role,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
            });
            return Ok(new LoginResult(token, user.Username, user.Role));
        }

        return Unauthorized(new { error = "Invalid username or password" });
    }

    // ---- Self-registration (creates a supervisor account, auto-login) ----

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult> Register([FromBody] RegisterRequest req)
    {
        var username = req.Username?.Trim() ?? "";
        var password = req.Password ?? "";

        if (username.Length < 3)
            return BadRequest(new { error = "Username must be at least 3 characters" });
        if (password.Length < 6)
            return BadRequest(new { error = "Password must be at least 6 characters" });

        var existing = await _users.GetUserByUsernameAsync(username);
        if (existing is not null)
            return BadRequest(new { error = "Username already exists" });

        var user = new AppUser
        {
            Username = username,
            Role = Roles.Supervisor,
            IsActive = true,
            PasswordHash = HashPassword(password),
        };
        await _users.InsertUserAsync(user);
        await _activity.LogAsync("Account registered", $"{username} (supervisor)");

        var token = GenerateToken();
        await _users.CreateSessionAsync(new UserSession
        {
            Token = token,
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
        });
        return Ok(new LoginResult(token, user.Username, user.Role));
    }

    // ---- Staff user management (admin only) ----

    [HttpGet("users")]
    public async Task<ActionResult> Users()
    {
        if (!RequireAdmin()) return ForbidResult();
        return Ok(await _users.GetUsersAsync());
    }

    [HttpPost("users")]
    public async Task<ActionResult> SaveUser([FromBody] AppUserDto dto)
    {
        if (!RequireAdmin()) return ForbidResult();

        var existing = dto.Id == 0 ? await _users.GetUserByUsernameAsync(dto.Username) : null;
        if (existing is not null)
            return BadRequest("Username already exists");

        var user = new AppUser
        {
            Id = dto.Id,
            Username = dto.Username.Trim(),
            Role = dto.Role is Roles.Admin or Roles.Accountant or Roles.Supervisor ? dto.Role : Roles.Supervisor,
            IsActive = dto.IsActive,
            PasswordHash = dto.Password is { Length: > 0 } ? HashPassword(dto.Password) : ""
        };

        if (user.Id == 0)
        {
            await _users.InsertUserAsync(user);
            await _activity.LogAsync("Staff user added", user.Username);
        }
        else
        {
            var existingUser = await _users.GetUserAsync(user.Id);
            if (existingUser is null) return NotFound();
            if (string.IsNullOrEmpty(user.PasswordHash)) user.PasswordHash = existingUser.PasswordHash;
            await _users.UpdateUserAsync(user);
            await _activity.LogAsync("Staff user updated", user.Username);
        }

        return Ok(user);
    }

    [HttpPost("users/{id:int}/toggle")]
    public async Task<ActionResult> ToggleUser(int id)
    {
        if (!RequireAdmin()) return ForbidResult();
        var user = await _users.GetUserAsync(id);
        if (user is null) return NotFound();
        user.IsActive = !user.IsActive;
        await _users.UpdateUserAsync(user);
        return Ok(user);
    }

    [HttpDelete("users/{id:int}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        if (!RequireAdmin()) return ForbidResult();
        await _users.DeleteUserAsync(id);
        return Ok();
    }

    [HttpGet("sessions")]
    public async Task<ActionResult> Sessions()
    {
        if (!RequireAdmin()) return ForbidResult();
        return Ok(await _users.GetSessionsAsync());
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        // Client removes its token locally; sessions expire in 30 days regardless.
        return Ok();
    }

    // ---- helpers ----

    private bool RequireAdmin() => Request.HttpContext.Items["Role"] as string == Roles.Admin;
    private ActionResult ForbidResult() => StatusCode(StatusCodes.Status403Forbidden, new { error = "Admin access required" });

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes("lux:" + password));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes("lux:" + password));
            return Convert.ToBase64String(bytes) == storedHash;
        }
        catch { return false; }
    }

    private static string GenerateToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();

    public record AppUserDto(int Id, string Username, string? Password, string Role, bool IsActive);
}
