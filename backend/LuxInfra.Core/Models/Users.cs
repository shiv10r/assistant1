using SQLite;

namespace LuxInfra.Models;

public static class Roles
{
    public const string Admin = "admin";
    public const string Accountant = "accountant";
    public const string Supervisor = "supervisor";

    public static readonly string[] All = { Admin, Accountant, Supervisor };

    public static string Label(string role) => role switch
    {
        Admin => "Admin",
        Accountant => "Accountant",
        Supervisor => "Site Supervisor",
        _ => role
    };

    /// <summary>Write access to billing/finance operations.</summary>
    public static bool CanFinance(string role) => role is Admin or Accountant;

    /// <summary>Write access to project/site operations.</summary>
    public static bool CanProjects(string role) => role is Admin or Supervisor or Accountant;

    /// <summary>Full admin control (user management, backup, settings).</summary>
    public static bool IsAdmin(string role) => role == Admin;
}

/// <summary>Additional staff logins beyond the owner (AUTH_USER / AUTH_PASS) account.</summary>
[Table("app_users")]
public class AppUser
{
    [PrimaryKey, AutoIncrement] public int Id { get; set; }
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = Roles.Supervisor;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>Issued on login so each role carries its own bearer token (owner keeps the static API_TOKEN).</summary>
[Table("user_sessions")]
public class UserSession
{
    [PrimaryKey] public string Token { get; set; } = "";
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Role { get; set; } = Roles.Supervisor;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
}
