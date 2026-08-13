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
}
