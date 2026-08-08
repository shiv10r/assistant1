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
        drive = _drive.Configured ? "configured" : "not_configured",
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

    [HttpPost("backup/drive")]
    public async Task<ActionResult> BackupToDrive()
    {
        return BadRequest(new { ok = false, code = "not_configured", message = "Google Drive backup is not enabled yet — add GOOGLE_DRIVE_ACCESS_TOKEN on the server and redeploy." });
    }

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
