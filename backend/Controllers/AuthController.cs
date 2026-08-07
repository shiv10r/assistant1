using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly Auth.AuthOptions _auth;

    public AuthController(Auth.AuthOptions auth) => _auth = auth;

    public record LoginRequest(string? Username, string? Password);
    public record LoginResult(string Token);

    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult Login([FromBody] LoginRequest req)
    {
        if (string.Equals(req.Username, _auth.Username, StringComparison.Ordinal) &&
            string.Equals(req.Password, _auth.Password, StringComparison.Ordinal))
        {
            return Ok(new LoginResult(_auth.Token));
        }

        return Unauthorized(new { error = "Invalid username or password" });
    }
}
