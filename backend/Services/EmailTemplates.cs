using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.Api.Services;

/// <summary>HTML email templates for transactional emails (reports, invoices, etc.).</summary>
public static class EmailTemplates
{
    public static string ReportEmail(ReportData data, string periodLabel, int pdfSizeBytes)
    {
        var rowCount = data.Rows.Count;
        var totalLabel = data.TotalLabel ?? ReportService.Money(data.Total);
        var generated = DateTime.Now.ToString("dd MMM, yyyy h:mm tt");

        return $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>LuxInfra Report</title></head>
        <body style="font-family: system-ui, sans-serif; background: #f5f6fa; margin: 0; padding: 24px;">
          <table style="max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,.06);">
            <tr><td style="background: #7C4DFF; padding: 24px; color: #fff;">
              <h1 style="margin: 0; font-size: 22px;">LuxInfra Report</h1>
              <p style="margin: 4px 0 0; opacity: .85; font-size: 14px;">Period: {System.Net.WebUtility.HtmlEncode(periodLabel)} · Generated: {generated}</p>
            </td></tr>
            <tr><td style="padding: 24px;">
              <p style="margin: 0 0 16px; font-size: 15px;">Hi there,</p>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
                Your scheduled expense report for <strong>{System.Net.WebUtility.HtmlEncode(periodLabel)}</strong> is ready.<br />
                Total: <strong style="color: #7C4DFF;">{totalLabel}</strong> · Entries: {rowCount} · PDF: {pdfSizeBytes:N0} bytes
              </p>
              <p style="margin: 0 0 16px; font-size: 14px;">The full report is attached as a PDF. You can also download it as Excel, CSV, or PNG from the Reports page.</p>
              <p style="margin: 0; font-size: 13px; color: #999;">— LuxInfra</p>
            </td></tr>
            <tr><td style="background: #f9f9f9; padding: 12px 24px; font-size: 11px; color: #aaa;">
              This email was sent automatically. Configure schedule in Settings → Scheduled Reports.
            </td></tr>
          </table>
        </body></html>
        """;
    }

    /// <summary>Branded invoice email with a payment button, PDF attached separately.</summary>
    public static string InvoiceEmail(BizTxn txn, Party? party, Dictionary<string, string> settings, string? paymentLink)
    {
        var firmName = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        var firmEmail = settings.GetValueOrDefault("general.firm_email", "");
        var totalLabel = txn.TotalLabel;
        var dateLabel = txn.Date.ToString("dd MMM, yyyy");
        var partyName = string.IsNullOrWhiteSpace(txn.PartyName) ? "Customer" : txn.PartyName;
        var payButton = string.IsNullOrWhiteSpace(paymentLink)
            ? ""
            : $"""<p style="margin: 24px 0 0; text-align: center;"><a href="{System.Net.WebUtility.HtmlEncode(paymentLink)}" style="background:#7C4DFF;color:#fff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:8px;display:inline-block;">Pay now</a></p>""";

        return $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>{System.Net.WebUtility.HtmlEncode(firmName)} · {txn.RefLabel}</title></head>
        <body style="font-family: system-ui, sans-serif; background: #f5f6fa; margin: 0; padding: 24px;">
          <table style="max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,.06);">
            <tr><td style="background: #7C4DFF; padding: 24px; color: #fff;">
              <h1 style="margin: 0; font-size: 20px;">{System.Net.WebUtility.HtmlEncode(firmName)}</h1>
              <p style="margin: 4px 0 0; opacity: .85; font-size: 13px;">Invoice {txn.RefLabel} · {dateLabel}</p>
            </td></tr>
            <tr><td style="padding: 24px;">
              <p style="margin: 0 0 16px; font-size: 15px;">Dear {System.Net.WebUtility.HtmlEncode(partyName)},</p>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
                Please find attached your <strong>{txn.TypeLabel} {txn.RefLabel}</strong>.
              </p>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 8px 0;">
                <tr>
                  <td style="padding: 10px 12px; background: #f9f9f9; border-radius: 8px 0 0 8px; color: #666;">Amount due</td>
                  <td style="padding: 10px 12px; background: #f9f9f9; border-radius: 0 8px 8px 0; text-align: right; font-weight: 700; color: #7C4DFF;">{totalLabel}</td>
                </tr>
              </table>
              {payButton}
              <p style="margin: 24px 0 0; font-size: 13px; color: #999;">— {System.Net.WebUtility.HtmlEncode(firmName)}{(string.IsNullOrWhiteSpace(firmEmail) ? "" : $" · {System.Net.WebUtility.HtmlEncode(firmEmail)}")}</p>
            </td></tr>
          </table>
        </body></html>
        """;
    }
}
