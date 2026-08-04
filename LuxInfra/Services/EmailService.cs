using System.Net;
using System.Net.Mail;

namespace LuxInfra.Services;

public class EmailService
{
    public const string DefaultRecipient = "shivanshu.rai@fiftyfivetech.io";

    public static string Recipient
    {
        get => Preferences.Get("report_email", DefaultRecipient);
        set => Preferences.Set("report_email", value);
    }

    public static string SmtpHost
    {
        get => Preferences.Get("smtp_host", "");
        set => Preferences.Set("smtp_host", value);
    }

    public static int SmtpPort
    {
        get => Preferences.Get("smtp_port", 587);
        set => Preferences.Set("smtp_port", value);
    }

    public static string SmtpUser
    {
        get => Preferences.Get("smtp_user", "");
        set => Preferences.Set("smtp_user", value);
    }

    public static string SmtpPass
    {
        get => Preferences.Get("smtp_pass", "");
        set => Preferences.Set("smtp_pass", value);
    }

    public static bool AutoSendEnabled
    {
        get => Preferences.Get("auto_send", true);
        set => Preferences.Set("auto_send", value);
    }

    public static TimeSpan AutoSendTime
    {
        get => TimeSpan.TryParse(Preferences.Get("auto_send_time", "20:00"), out var t) ? t : new TimeSpan(20, 0, 0);
        set => Preferences.Set("auto_send_time", value.ToString(@"hh\:mm"));
    }

    public static bool SmtpConfigured =>
        !string.IsNullOrWhiteSpace(SmtpHost) && !string.IsNullOrWhiteSpace(SmtpUser);

    /// <summary>
    /// Sends the report. Uses SMTP when configured; otherwise opens the
    /// default mail app with the report pre-filled. Returns a status message.
    /// </summary>
    public async Task<string> SendReportAsync(string subject, string plainBody, string htmlBody, string? attachmentPath = null)
    {
        if (SmtpConfigured)
        {
            try
            {
                using var client = new SmtpClient(SmtpHost, SmtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(SmtpUser, SmtpPass)
                };
                using var msg = new MailMessage(SmtpUser, Recipient, subject, htmlBody) { IsBodyHtml = true };
                if (attachmentPath is not null && File.Exists(attachmentPath))
                    msg.Attachments.Add(new Attachment(attachmentPath));
                await client.SendMailAsync(msg);
                return $"📧 Report emailed to {Recipient} ✅";
            }
            catch (Exception ex)
            {
                return $"⚠️ SMTP send failed ({ex.Message}). Check SMTP settings in ⚙️ Settings.";
            }
        }

        // Fallback — open the default mail app with the report pre-filled.
        try
        {
            var message = new EmailMessage
            {
                Subject = subject,
                Body = plainBody,
                To = { Recipient }
            };
            if (attachmentPath is not null && File.Exists(attachmentPath))
                message.Attachments = new List<EmailAttachment> { new(attachmentPath) };
            await Email.Default.ComposeAsync(message);
            return "📧 Opened your mail app with the report — just hit send!";
        }
        catch
        {
            try
            {
                var uri = $"mailto:{Recipient}?subject={Uri.EscapeDataString(subject)}&body={Uri.EscapeDataString(plainBody)}";
                await Launcher.Default.OpenAsync(uri);
                return "📧 Opened your mail app with the report — just hit send!";
            }
            catch
            {
                return "⚠️ Couldn't open a mail app. Configure SMTP in ⚙️ Settings for automatic emails.";
            }
        }
    }
}
