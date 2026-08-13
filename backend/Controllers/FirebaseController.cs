using LuxInfra.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/firebase")]
public class FirebaseController : ControllerBase
{
    private readonly FirebasePlatformService _firebase;

    public FirebaseController(FirebasePlatformService firebase) => _firebase = firebase;

    /// <summary>Public web SDK config so the SPA can initialise Firebase Auth + Messaging.</summary>
    [HttpGet("config")]
    [AllowAnonymous]
    public ActionResult Config() => Ok(_firebase.WebConfig());
}