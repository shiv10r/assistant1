using System.Text;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.Api.Services;

public interface IWhatsAppService
{
    /// <summary>Build a shareable WhatsApp message + wa.me deep link for an invoice. Returns (ok, url, message, error).</summary>
    Task<(bool Ok, string Url, string Message, string? Error)> ShareInvoiceAsync(
        BizTxn txn, Party? party, Dictionary<string, string> settings, string? paymentLink);
}

/// <summary>
/// Tier-1 WhatsApp delivery: wa.me deep links — opens WhatsApp with a prefilled invoice message.
/// No account/API key required. A Meta Cloud API sender can replace this behind IWhatsAppService later.
/// </summary>
public sealed class WhatsAppWaMeService : IWhatsAppService
{
    public Task<(bool Ok, string Url, string Message, string? Error)> ShareInvoiceAsync(
        BizTxn txn, Party? party, Dictionary<string, string> settings, string? paymentLink)
    {
        var phone = NormalizePhone(party?.Phone ?? "");
        if (string.IsNullOrWhiteSpace(phone))
            return Task.FromResult((false, "", "", (string?)"No phone number set for this party."));

        var firmName = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        var lines = new List<string>
        {
            $"Dear {(string.IsNullOrWhiteSpace(txn.PartyName) ? "Customer" : txn.PartyName)},",
            $"Your {txn.TypeLabel} {txn.RefLabel} for {ReportService.Money(txn.Total)} from {firmName} is ready."
        };
        if (!string.IsNullOrWhiteSpace(paymentLink))
            lines.Add($"Pay securely here: {paymentLink}");
        else if (txn.Balance > 0)
            lines.Add($"Outstanding balance: {ReportService.Money(txn.Balance)}.");
        else
            lines.Add("Payment received. Thank you!");

        var message = string.Join("\n", lines);
        var url = $"https://wa.me/{phone}?text={Uri.EscapeDataString(message)}";
        return Task.FromResult((true, url, message, (string?)null));
    }

    private static string NormalizePhone(string phone)
    {
        var digits = new string(phone.Where(char.IsAsciiDigit).ToArray());
        if (digits.Length == 0) return "";
        if (digits.StartsWith("0")) digits = "91" + digits[1..];
        return digits;
    }
}