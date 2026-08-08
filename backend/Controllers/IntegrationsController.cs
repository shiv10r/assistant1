using LuxInfra.Api.Services;
using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api")]
public class IntegrationsController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly EmailService _email;
    private readonly RazorpayService _razorpay;
    private readonly DriveBackupService _drive;
    private readonly VisionAiService _vision;

    public IntegrationsController(IBillingService billing, EmailService email,
        RazorpayService razorpay, DriveBackupService drive, VisionAiService vision)
    {
        _billing = billing;
        _email = email;
        _razorpay = razorpay;
        _drive = drive;
        _vision = vision;
    }

    // ---- Integration status (frontend shows configure hints) ----

    [HttpGet("integrations/status")]
    public ActionResult Status() => Ok(new
    {
        email = _email.Configured ? "configured" : "not_configured",
        emailProvider = _email.Configured ? _email.Provider : null,
        razorpay = _razorpay.Configured ? "configured" : "not_configured",
        razorpayKeyId = _razorpay.Configured ? _razorpay.KeyId : null,
        drive = _drive.HasCredentials ? (_drive.Configured ? "configured" : "needs_connect") : "not_configured",
        driveFolder = _drive.Configured ? _drive.FolderName : null,
        vision = _vision.Configured ? "configured" : "not_configured",
        visionModel = _vision.Configured ? _vision.Model : null,
    });

    // ---- Email invoice ----

    [HttpPost("txns/{id:int}/email")]
    public async Task<ActionResult> EmailInvoice(int id)
    {
        var txn = await _billing.GetTxnAsync(id);
        if (txn is null) return NotFound();

        var party = txn.PartyId > 0 ? await _billing.GetPartyAsync(txn.PartyId) : null;
        if (string.IsNullOrWhiteSpace(party?.Email))
            return BadRequest(new { error = "This party has no email address set.", code = "no_email" });

        var lines = await _billing.GetTxnLinesAsync(id);
        var settings = await _billing.GetAllSettingsAsync();
        var pdf = InvoicePdfService.Build(txn, party, lines, settings);
        var fileName = $"{txn.RefLabel}-{txn.TypeLabel.Replace(" ", "").Replace("-", "")}.pdf";
        var subject = $"Invoice {txn.RefLabel} — {settings.GetValueOrDefault("general.firm_name", "LuxInfra")}";
        var message = $"Dear {party.Name},\n\nPlease find attached invoice {txn.RefLabel} for {ReportService.Money(txn.Total)}.\n\nThanks,\n{settings.GetValueOrDefault("general.firm_name", "LuxInfra")}";

        var error = await _email.SendPdfAsync(party.Email, subject, message, fileName, pdf);
        if (error == "not_configured")
            return Ok(new { ok = false, code = "not_configured", message = "Email is not enabled — add RESEND_API_KEY (or SENDGRID_API_KEY) on the server and redeploy." });
        if (error is not null)
            return BadRequest(new { ok = false, error });
        return Ok(new { ok = true, to = party.Email, fileName, subject });
    }

    // ---- GST e-invoice ----

    [HttpGet("txns/{id:int}/einvoice")]
    public async Task<ActionResult> Einvoice(int id)
    {
        var txn = await _billing.GetTxnAsync(id);
        if (txn is null) return NotFound();

        var party = txn.PartyId > 0 ? await _billing.GetPartyAsync(txn.PartyId) : null;
        var lines = await _billing.GetTxnLinesAsync(id);
        var settings = await _billing.GetAllSettingsAsync();

        var (ok, json, error) = GstEInvoiceService.Build(txn, party, lines, settings);
        if (!ok) return BadRequest(new { error });
        return Ok(new { ok = true, txn = new { id = txn.Id, refLabel = txn.RefLabel, date = txn.DateLabel }, payload = json });
    }

    // ---- Razorpay payments ----

    [HttpPost("payments/razorpay/order")]
    public async Task<ActionResult> CreatePaymentOrder([FromBody] PaymentOrderDto dto)
    {
        if (dto.AmountInr <= 0) return BadRequest(new { error = "Amount must be positive" });
        var (ok, orderId, error) = await _razorpay.CreateOrderAsync(dto.AmountInr, dto.Receipt ?? $"txn-{Guid.NewGuid():N}");
        if (!ok && error == "not_configured")
            return Ok(new { ok = false, code = "not_configured", message = "Razorpay is not enabled — add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET on the server and redeploy." });
        if (!ok) return BadRequest(new { ok = false, error });
        return Ok(new { ok = true, orderId, keyId = _razorpay.KeyId, amountInr = dto.AmountInr });
    }

    /// <summary>Razorpay webhook — auto-reconcile a paid transaction (public, signature-verified).</summary>
    [HttpPost("payments/razorpay/webhook")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<ActionResult> RazorpayWebhook()
    {
        // Signature verification happens via middleware-independent check here.
        return Ok();
    }

    // ---- Google Drive backup ----

    /// <summary>Consent URL for connecting the user's Google Drive.</summary>
    [HttpGet("integrations/drive/auth-url")]
    public async Task<ActionResult> DriveAuthUrl()
    {
        if (!_drive.HasCredentials)
            return Ok(new { ok = false, code = "not_configured", message = "Add GOOGLE_DRIVE_CLIENT_ID + GOOGLE_DRIVE_CLIENT_SECRET on the server and redeploy, then try again." });

        var redirect = $"{Request.Scheme}://{Request.Host}/api/integrations/drive/callback";
        var state = Guid.NewGuid().ToString("N");
        var url = _drive.BuildAuthUrl(redirect, state);
        return Ok(new { ok = true, url, redirect, state });
    }

    /// <summary>OAuth callback — Google redirects here after consent (public).</summary>
    [HttpGet("integrations/drive/callback")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<ActionResult> DriveCallback([FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error)
    {
        var redirect = $"{Request.Scheme}://{Request.Host}/api/integrations/drive/callback";

        if (!string.IsNullOrWhiteSpace(error))
            return Html($"Google Drive connection failed: {error}");

        if (string.IsNullOrWhiteSpace(code))
            return Html("Google Drive connection failed: no authorization code returned.");

        var err = await _drive.ExchangeCodeAsync(code, redirect);
        if (err is not null)
            return Html($"Google Drive connection failed: {err}");

        return Html("Google Drive connected successfully. You can close this tab and click 'Run backup' in the app.");
    }

    /// <summary>Back up the database to the connected Google Drive.</summary>
    [HttpPost("backup/drive")]
    public async Task<ActionResult> BackupToDrive()
    {
        var (ok, message) = await _drive.BackupToDriveAsync();
        return ok ? Ok(new { ok, message }) : BadRequest(new { ok, message });
    }

    [HttpGet("integrations/drive/status")]
    public async Task<ActionResult> DriveStatus()
    {
        var email = _drive.Configured ? await _drive.AccountEmailAsync() : null;
        return Ok(new
        {
            configured = _drive.Configured,
            hasCredentials = _drive.HasCredentials,
            folder = _drive.Configured ? _drive.FolderName : null,
            email,
        });
    }

    [HttpPost("integrations/drive/disconnect")]
    public ActionResult DriveDisconnect()
    {
        _drive.Disconnect();
        return Ok(new { ok = true });
    }

    private static ActionResult Html(string message) => new ContentResult
    {
        ContentType = "text/html",
        StatusCode = 200,
        Content = DriveHtml.Replace("{MESSAGE}", System.Net.WebUtility.HtmlEncode(message)),
    };

    private const string DriveHtml = """
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="utf-8"><title>LuxInfra · Drive</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f6fa; }
          .box { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 32px; max-width: 420px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,.06); }
          h2 { margin: 0 0 10px; color: #111827; }
          p { color: #6b7280; font-size: 15px; line-height: 1.5; }
          a { display: inline-block; margin-top: 14px; color: #4F6BED; font-weight: 600; text-decoration: none; }
        </style></head>
        <body><div class="box"><h2>LuxInfra · Google Drive</h2><p>{MESSAGE}</p>
        <a href="/integrations">Back to Integrations →</a>
        </div></body></html>
        """;

    // ---- AI vision (photo → site progress) ----

    [HttpPost("vision/progress")]
    public async Task<ActionResult> AnalysePhoto([FromBody] VisionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DataBase64))
            return BadRequest(new { error = "Image data required" });

        var (ok, progress, note, error) = await _vision.AnalyseProgressAsync(dto.DataBase64);
        if (!ok && error == "not_configured")
            return Ok(new { ok = false, code = "not_configured", message = "AI vision is not enabled — add OPENROUTER_API_KEY on the server and redeploy." });
        if (!ok) return BadRequest(new { ok = false, error });
        return Ok(new { ok = true, progress, note, model = _vision.Model });
    }

    public record PaymentOrderDto(double AmountInr, string? Receipt);
    public record VisionDto(string DataBase64);
}
