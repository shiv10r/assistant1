using LuxInfra.Models;
using LuxInfra.Repositories;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Text.Json;

namespace LuxInfra.Api.Controllers;

[ApiController]
[Route("api/modules")]
public class ModulesController : ControllerBase
{
    private readonly IModuleRepository _mods;
    private readonly IBillingService _billing;
    private readonly IProjectService _projects;
    private readonly IActivityService _activity;

    public ModulesController(IModuleRepository mods, IBillingService billing, IProjectService projects, IActivityService activity)
    {
        _mods = mods;
        _billing = billing;
        _projects = projects;
        _activity = activity;
    }

    // ---- Contracts (21) + escalation (38) ----

    [HttpGet("contracts")]
    public async Task<List<SiteContract>> Contracts() => await _mods.AllAsync<SiteContract>();

    [HttpPost("contracts")]
    public async Task<ActionResult> SaveContract([FromBody] SiteContract c)
    {
        await _mods.SaveAsync(c);
        await _activity.LogAsync("Contract saved", $"{c.Title} — {ReportService.Money(c.Amount)}");
        return Ok(c);
    }

    [HttpDelete("contracts/{id:int}")]
    public async Task<ActionResult> DeleteContract(int id)
    {
        await _mods.DeleteAsync<SiteContract>(id);
        return Ok();
    }

    [HttpGet("contracts/{id:int}/pdf")]
    public async Task<ActionResult> ContractPdf(int id)
    {
        var c = await _mods.GetAsync<SiteContract>(id);
        if (c is null) return NotFound();

        var project = c.ProjectId > 0 ? await _projects.GetProjectAsync(c.ProjectId) : null;
        var settings = await _billing.GetAllSettingsAsync();
        var pdf = ContractPdfService.Build(c, project, settings);
        return File(pdf, "application/pdf", $"Contract-{c.Id}-{Sanitize(c.Title)}.pdf");
    }

    // ---- Milestones (5) ----

    [HttpGet("milestones")]
    public async Task<List<ContractMilestone>> Milestones([FromQuery] int? projectId, [FromQuery] int? contractId)
    {
        var all = await _mods.AllAsync<ContractMilestone>();
        if (projectId is > 0) all = all.Where(m => m.ProjectId == projectId).ToList();
        if (contractId is > 0) all = all.Where(m => m.ContractId == contractId).ToList();
        return all.OrderBy(m => m.DueDate).ToList();
    }

    [HttpPost("milestones")]
    public async Task<ActionResult> SaveMilestone([FromBody] ContractMilestone m)
    {
        await _mods.SaveAsync(m);
        await _activity.LogAsync("Milestone saved", $"{m.Title} — {ReportService.Money(m.Amount)}");
        return Ok(m);
    }

    [HttpPost("milestones/{id:int}/paid")]
    public async Task<ActionResult> MarkMilestonePaid(int id)
    {
        var m = await _mods.GetAsync<ContractMilestone>(id);
        if (m is null) return NotFound();
        m.IsPaid = !m.IsPaid;
        m.Status = m.IsPaid ? "Paid" : "Billed";
        await _mods.SaveAsync(m);
        return Ok(m);
    }

    [HttpDelete("milestones/{id:int}")]
    public async Task<ActionResult> DeleteMilestone(int id)
    {
        await _mods.DeleteAsync<ContractMilestone>(id);
        return Ok();
    }

    // ---- Vendor price book (15) ----

    [HttpGet("vendorprices")]
    public async Task<List<VendorPrice>> VendorPrices() =>
        (await _mods.AllAsync<VendorPrice>()).OrderByDescending(v => v.Date).ToList();

    [HttpPost("vendorprices")]
    public async Task<ActionResult> SaveVendorPrice([FromBody] VendorPrice v)
    {
        await _mods.SaveAsync(v);
        await _activity.LogAsync("Vendor price saved", $"{v.Vendor} · {v.Item} — {ReportService.Money(v.Price)}");
        return Ok(v);
    }

    [HttpDelete("vendorprices/{id:int}")]
    public async Task<ActionResult> DeleteVendorPrice(int id)
    {
        await _mods.DeleteAsync<VendorPrice>(id);
        return Ok();
    }

    // ---- Equipment rental (17) ----

    [HttpGet("equipment")]
    public async Task<List<EquipmentLog>> Equipment([FromQuery] int? projectId)
    {
        var all = await _mods.AllAsync<EquipmentLog>();
        if (projectId is > 0) all = all.Where(e => e.ProjectId == projectId).ToList();
        return all.OrderByDescending(e => e.Date).ToList();
    }

    [HttpPost("equipment")]
    public async Task<ActionResult> SaveEquipment([FromBody] EquipmentLog e)
    {
        await _mods.SaveAsync(e);
        await _activity.LogAsync("Equipment logged", $"{e.Equipment} — {ReportService.Money(e.RentalCost + e.FuelCost)}");
        return Ok(e);
    }

    [HttpDelete("equipment/{id:int}")]
    public async Task<ActionResult> DeleteEquipment(int id)
    {
        await _mods.DeleteAsync<EquipmentLog>(id);
        return Ok();
    }

    // ---- Fuel log (24) ----

    [HttpGet("fuel")]
    public async Task<List<FuelLog>> Fuel() =>
        (await _mods.AllAsync<FuelLog>()).OrderByDescending(f => f.Date).ToList();

    [HttpPost("fuel")]
    public async Task<ActionResult> SaveFuel([FromBody] FuelLog f)
    {
        await _mods.SaveAsync(f);
        await _activity.LogAsync("Fuel logged", $"{f.Vehicle} — {f.Litres} L {ReportService.Money(f.Cost)}");
        return Ok(f);
    }

    [HttpDelete("fuel/{id:int}")]
    public async Task<ActionResult> DeleteFuel(int id)
    {
        await _mods.DeleteAsync<FuelLog>(id);
        return Ok();
    }

    // ---- Snags (18) ----

    [HttpGet("snags")]
    public async Task<List<Snag>> Snags([FromQuery] int? projectId)
    {
        var all = await _mods.AllAsync<Snag>();
        if (projectId is > 0) all = all.Where(s => s.ProjectId == projectId).ToList();
        return all.OrderByDescending(s => s.CreatedAt).ToList();
    }

    [HttpPost("snags")]
    public async Task<ActionResult> SaveSnag([FromBody] Snag s)
    {
        await _mods.SaveAsync(s);
        await _activity.LogAsync("Snag added", s.Title);
        return Ok(s);
    }

    [HttpPost("snags/{id:int}/status")]
    public async Task<ActionResult> SetSnagStatus(int id, [FromBody] JsonElement? status)
    {
        var s = await _mods.GetAsync<Snag>(id);
        if (s is null) return NotFound();
        if (status is not null && status.Value.ValueKind == JsonValueKind.String)
            s.Status = status.Value.GetString() ?? s.Status;
        else s.Status = s.Status == "Fixed" ? "Open" : s.Status == "Open" ? "In Progress" : "Fixed";
        await _mods.SaveAsync(s);
        return Ok(s);
    }

    [HttpDelete("snags/{id:int}")]
    public async Task<ActionResult> DeleteSnag(int id)
    {
        await _mods.DeleteAsync<Snag>(id);
        return Ok();
    }

    // ---- Contractor ratings (30) ----

    [HttpGet("ratings")]
    public async Task<List<ContractorRating>> Ratings() =>
        (await _mods.AllAsync<ContractorRating>()).OrderByDescending(r => r.Date).ToList();

    [HttpPost("ratings")]
    public async Task<ActionResult> SaveRating([FromBody] ContractorRating r)
    {
        await _mods.SaveAsync(r);
        await _activity.LogAsync("Contractor rated", $"{r.Name} — {r.Average}/10");
        return Ok(r);
    }

    [HttpDelete("ratings/{id:int}")]
    public async Task<ActionResult> DeleteRating(int id)
    {
        await _mods.DeleteAsync<ContractorRating>(id);
        return Ok();
    }

    // ---- Video call — Google Meet / Teams / Jitsi links (no WebRTC server needed) ----

    [HttpGet("video-session")]
    public async Task<ActionResult> VideoSession([FromQuery] int? projectId, [FromQuery] string? provider)
    {
        var stamp = DateTime.Now.ToString("yyyyMMdd");
        var suffix = Random.Shared.Next(1000, 9999).ToString();
        var room = projectId is > 0
            ? $"luxinfra-p{projectId}-{stamp}-{suffix}"
            : $"luxinfra-meet-{stamp}-{suffix}";

        var providerName = string.IsNullOrWhiteSpace(provider) ? "meet" : provider.ToLowerInvariant();
        var url = providerName switch
        {
            "teams" => $"https://teams.microsoft.com/l/meetup-join/19%3ameeting_{DateTime.Now:yyyyMMddHHmm}_{suffix}%40thread.v2/0?context=%7b%22Tid%22%3a%22%22%7d",
            "jitsi" => $"https://meet.jit.si/{Uri.EscapeDataString(room)}",
            _ => $"https://meet.google.com/new"
        };

        if (projectId is > 0)
            await _activity.LogAsync("Video call started", $"Project #{projectId} ({providerName})");
        return Ok(new { room, url, provider = providerName });
    }

    private static string Sanitize(string s)
    {
        foreach (var ch in Path.GetInvalidFileNameChars()) s = s.Replace(ch, '-');
        return string.IsNullOrWhiteSpace(s) ? "contract" : s;
    }
}

public static class ContractPdfService
{
    static ContractPdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public static byte[] Build(SiteContract c, Project? project, Dictionary<string, string> settings)
    {
        const string purple = "#7C4DFF";
        const string aqua = "#00A896";
        const string dim = "#666677";

        var firm = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        var firmAddress = settings.GetValueOrDefault("general.firm_address", "");

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(t => t.FontSize(10).FontColor("#222233"));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text(t =>
                        {
                            t.Span("Lux").FontSize(22).Bold();
                            t.Span("Infra").FontSize(22).Bold().FontColor(aqua);
                        });
                        row.ConstantItem(220).AlignRight().AlignMiddle().Text($"{firm}\n{firmAddress}").FontSize(9).FontColor(dim);
                    });
                    col.Item().PaddingTop(6).LineHorizontal(2).LineColor(purple);
                    col.Item().PaddingTop(14).AlignCenter().Text("AGREEMENT / CONTRACT").FontSize(16).Bold().FontColor(purple);
                    col.Item().PaddingTop(4).AlignCenter().Text(c.Title).FontSize(12).FontColor(dim);
                });

                page.Content().PaddingVertical(16).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cc => { cc.RelativeColumn(1); cc.RelativeColumn(2); });
                        void Row(string k, string v)
                        {
                            table.Cell().Padding(6).Background("#F4F2FB").Text(k).Bold();
                            table.Cell().Padding(6).Text(v);
                        }
                        Row("Contract No.", $"#C{c.Id:0000}");
                        Row("Client / Party", c.PartyName);
                        Row("Project", project?.Name ?? (c.ProjectId > 0 ? $"Project #{c.ProjectId}" : "—"));
                        Row("Contract Value", c.AmountLabel);
                        Row("Start Date", c.StartDate.ToString("dd MMM yyyy"));
                        Row("End Date", c.EndDate.ToString("dd MMM yyyy"));
                        Row("Status", c.Status);
                    });

                    if (!string.IsNullOrWhiteSpace(c.Terms))
                    {
                        col.Item().PaddingTop(16).Text("Terms & Conditions").FontSize(12).Bold().FontColor(purple);
                        col.Item().PaddingTop(6).Text(c.Terms);
                    }

                    if (!string.IsNullOrWhiteSpace(c.EscalationClause))
                    {
                        col.Item().PaddingTop(16).Text("Price Escalation Clause").FontSize(12).Bold().FontColor(purple);
                        col.Item().PaddingTop(6).Text(c.EscalationClause);
                    }

                    col.Item().PaddingTop(24).AlignCenter().Text("Signature: ________________________").FontSize(11).FontColor(dim);
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span($"{firm} · contract document · page ").FontColor(dim).FontSize(8);
                    t.CurrentPageNumber().FontColor(dim).FontSize(8);
                });
            });
        }).GeneratePdf();
    }
}
