using LuxInfra.Models;
using LuxInfra.Repositories;
using LuxInfra.Api.Services;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LuxInfra.Api.Controllers;

/// <summary>
/// Interior-design modules: worker time tracking, rooms, mood-board,
/// vendor catalogue, 3D scenes, design revisions/comments, safety & quality
/// checklists (templates, inspections, NCRs), subcontractor work orders,
/// QR inventory, AI cost prediction, AI daily summary, lighting layout,
/// finish library, quotations, designer payouts, client portal, room-wise BOQ,
/// installation Gantt, room procurement, project timeline and AR measurements.
/// All persistence is generic via IModuleRepository.</summary>
[ApiController]
[Route("api/interior")]
public class InteriorDesignController : ControllerBase
{
    private readonly IModuleRepository _mods;
    private readonly IBillingService _billing;
    private readonly IProjectService _projects;
    private readonly IActivityService _activity;
    private readonly ChatAiService _ai;

    public InteriorDesignController(IModuleRepository mods, IBillingService billing, IProjectService projects,
        IActivityService activity, ChatAiService ai)
    {
        _mods = mods; _billing = billing; _projects = projects; _activity = activity; _ai = ai;
    }

    // ---- Worker time tracking ----

    [HttpGet("time-entries")]
    public async Task<ActionResult<List<TimeEntry>>> TimeEntries([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<TimeEntry>(projectId);

    [HttpPost("time-entries")]
    public async Task<ActionResult<TimeEntry>> SaveTimeEntry([FromBody] TimeEntry e)
    {
        await _mods.SaveAsync(e);
        await _activity.LogAsync("Time entry saved", $"{e.WorkerName} · {e.Hours} hrs");
        return Ok(e);
    }

    [HttpDelete("time-entries/{id:int}")]
    public async Task<ActionResult> DeleteTimeEntry(int id) { await _mods.DeleteAsync<TimeEntry>(id); return Ok(); }

    [HttpGet("time-entries/summary")]
    public async Task<ActionResult> TimeSummary([FromQuery] int? projectId, [FromQuery] int days = 30)
    {
        var entries = await _mods.AllFilteredAsync<TimeEntry>(projectId);
        var from = DateTime.Today.AddDays(-(days - 1));
        var recent = entries.Where(e => e.Date >= from).ToList();

        double totalWages = 0;
        foreach (var e in recent)
        {
            var party = await _projects.GetPartiesAsync(e.ProjectId).ContinueWith(t => t.Result.FirstOrDefault(p => p.Id == e.PartyId));
            totalWages += e.Hours * (party?.DailyRate ?? 0) / 8.0;
        }

        return Ok(new
        {
            days,
            totalManHours = recent.Sum(e => e.Hours),
            totalManHoursLabel = $"{recent.Sum(e => e.Hours):0.##} hrs",
            totalWagesLabel = ReportService.Money(totalWages),
            rows = recent.OrderByDescending(e => e.Date).Select(e => new
            {
                e.Date, dateLabel = e.Date.ToString("dd MMM"), e.WorkerName,
                hours = e.Hours, hoursLabel = $"{e.Hours:0.##} hrs"
            })
        });
    }

    // ---- Rooms ----

    [HttpGet("rooms")]
    public async Task<ActionResult<List<Room>>> Rooms([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<Room>(projectId);

    [HttpPost("rooms")]
    public async Task<ActionResult<Room>> SaveRoom([FromBody] Room r)
    {
        await _mods.SaveAsync(r);
        await _activity.LogAsync("Room added", r.Name);
        return Ok(r);
    }

    [HttpDelete("rooms/{id:int}")]
    public async Task<ActionResult> DeleteRoom(int id) { await _mods.DeleteAsync<Room>(id); return Ok(); }

    // ---- Mood-board ----

    [HttpGet("moodboard")]
    public async Task<ActionResult<List<MoodBoardItem>>> MoodBoard([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<MoodBoardItem>(projectId);

    [HttpPost("moodboard")]
    public async Task<ActionResult<MoodBoardItem>> SaveMoodItem([FromBody] MoodBoardItem i)
    {
        await _mods.SaveAsync(i);
        await _activity.LogAsync("Mood-board item added", i.Title);
        return Ok(i);
    }

    [HttpDelete("moodboard/{id:int}")]
    public async Task<ActionResult> DeleteMoodItem(int id) { await _mods.DeleteAsync<MoodBoardItem>(id); return Ok(); }

    // ---- Vendor catalogue ----

    [HttpGet("catalogue")]
    public async Task<ActionResult<List<VendorCatalogueItem>>> Catalogue() =>
        (await _mods.AllAsync<VendorCatalogueItem>()).Where(i => i.IsActive).OrderBy(c => c.Category).ThenBy(n => n.Name).ToList();

    [HttpPost("catalogue")]
    public async Task<ActionResult<VendorCatalogueItem>> SaveCatalogueItem([FromBody] VendorCatalogueItem i)
    {
        await _mods.SaveAsync(i);
        await _activity.LogAsync("Catalogue item saved", $"{i.Name} · {ReportService.Money(i.Price)}");
        return Ok(i);
    }

    [HttpDelete("catalogue/{id:int}")]
    public async Task<ActionResult> DeleteCatalogueItem(int id) { await _mods.DeleteAsync<VendorCatalogueItem>(id); return Ok(); }

    // ---- 3D room scenes ----

    [HttpGet("scenes")]
    public async Task<ActionResult<List<RoomScene>>> Scenes([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<RoomScene>(projectId);

    [HttpPost("scenes")]
    public async Task<ActionResult<RoomScene>> SaveScene([FromBody] RoomScene s)
    {
        if (s.Id == 0)
        {
            var latest = (await _mods.AllFilteredAsync<RoomScene>(s.ProjectId))
                .Where(x => x.RoomRef == s.RoomRef).OrderByDescending(x => x.Version).FirstOrDefault();
            s.Version = latest?.Version + 1 ?? 1;
        }
        s.UpdatedAt = DateTime.UtcNow;
        await _mods.SaveAsync(s);
        await _activity.LogAsync("3D scene saved", s.Name);
        return Ok(s);
    }

    [HttpDelete("scenes/{id:int}")]
    public async Task<ActionResult> DeleteScene(int id) { await _mods.DeleteAsync<RoomScene>(id); return Ok(); }

    // ---- Design revisions + comments ----

    [HttpGet("revisions")]
    public async Task<ActionResult<List<DesignRevision>>> Revisions([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<DesignRevision>(projectId);

    [HttpPost("revisions")]
    public async Task<ActionResult<DesignRevision>> SaveRevision([FromBody] DesignRevision r)
    {
        if (r.Id == 0)
        {
            var latest = (await _mods.AllFilteredAsync<DesignRevision>(r.ProjectId))
                .Where(x => x.Title == r.Title).OrderByDescending(x => x.Version).FirstOrDefault();
            r.Version = latest?.Version + 1 ?? 1;
        }
        await _mods.SaveAsync(r);
        await _activity.LogAsync("Design revision saved", $"{r.Title} v{r.Version}");
        return Ok(r);
    }

    [HttpDelete("revisions/{id:int}")]
    public async Task<ActionResult> DeleteRevision(int id) { await _mods.DeleteAsync<DesignRevision>(id); return Ok(); }

    [HttpGet("revisions/{id:int}/comments")]
    public async Task<ActionResult<List<DesignComment>>> Comments(int id) =>
        (await _mods.AllAsync<DesignComment>()).Where(c => c.RevisionId == id).OrderBy(c => c.CreatedAt).ToList();

    [HttpPost("revisions/{id:int}/comments")]
    public async Task<ActionResult<DesignComment>> AddComment(int id, [FromBody] DesignComment c)
    {
        c.RevisionId = id;
        await _mods.SaveAsync(c);
        await _activity.LogAsync("Comment added", c.Text);
        return Ok(c);
    }

    // ---- Safety / quality checklists ----

    [HttpGet("checklists/templates")]
    public async Task<ActionResult<List<ChecklistTemplate>>> Templates() =>
        (await _mods.AllAsync<ChecklistTemplate>()).OrderBy(t => t.Name).ToList();

    [HttpPost("checklists/templates")]
    public async Task<ActionResult<ChecklistTemplate>> SaveTemplate([FromBody] ChecklistTemplate t)
    {
        await _mods.SaveAsync(t);
        await _activity.LogAsync("Checklist template saved", t.Name);
        return Ok(t);
    }

    [HttpGet("checklists/inspections")]
    public async Task<ActionResult<List<InspectionRecord>>> Inspections([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<InspectionRecord>(projectId);

    [HttpPost("checklists/inspections")]
    public async Task<ActionResult<InspectionRecord>> SaveInspection([FromBody] InspectionRecord i)
    {
        await _mods.SaveAsync(i);
        await _activity.LogAsync("Inspection recorded", $"{i.TemplateName} — {(i.IsPassed ? "PASS" : "FAIL")}");
        return Ok(i);
    }

    [HttpGet("checklists/ncrs")]
    public async Task<ActionResult<List<NcrRecord>>> Ncrs([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<NcrRecord>(projectId);

    [HttpPost("checklists/ncrs")]
    public async Task<ActionResult<NcrRecord>> SaveNcr([FromBody] NcrRecord n)
    {
        await _mods.SaveAsync(n);
        await _activity.LogAsync("NCR raised", n.Title);
        return Ok(n);
    }

    // ---- Subcontractor work orders ----

    [HttpGet("subcontractors/orders")]
    public async Task<ActionResult<List<SubcontractorWorkOrder>>> WorkOrders([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<SubcontractorWorkOrder>(projectId);

    [HttpPost("subcontractors/orders")]
    public async Task<ActionResult<SubcontractorWorkOrder>> SaveWorkOrder([FromBody] SubcontractorWorkOrder w)
    {
        await _mods.SaveAsync(w);
        await _activity.LogAsync("Work order saved", $"{w.ContractorName} · {w.Title}");
        return Ok(w);
    }

    [HttpDelete("subcontractors/orders/{id:int}")]
    public async Task<ActionResult> DeleteWorkOrder(int id) { await _mods.DeleteAsync<SubcontractorWorkOrder>(id); return Ok(); }

    // ---- QR inventory ----

    [HttpGet("inventory/items")]
    public async Task<ActionResult<List<QrInventoryItem>>> QrItems([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<QrInventoryItem>(projectId);

    [HttpPost("inventory/items")]
    public async Task<ActionResult<QrInventoryItem>> SaveQrItem([FromBody] QrInventoryItem i)
    {
        await _mods.SaveAsync(i);
        await _activity.LogAsync("QR inventory item saved", i.Name);
        return Ok(i);
    }

    [HttpDelete("inventory/items/{id:int}")]
    public async Task<ActionResult> DeleteQrItem(int id) { await _mods.DeleteAsync<QrInventoryItem>(id); return Ok(); }

    [HttpGet("inventory/items/{id:int}/scans")]
    public async Task<ActionResult<List<QrInventoryScan>>> QrScans(int id) =>
        (await _mods.AllAsync<QrInventoryScan>()).Where(s => s.ItemId == id).OrderByDescending(s => s.ScannedAt).ToList();

    [HttpPost("inventory/items/{id:int}/scans")]
    public async Task<ActionResult<QrInventoryScan>> AddQrScan(int id, [FromBody] QrInventoryScan s)
    {
        s.ItemId = id;
        await _mods.SaveAsync(s);
        await _activity.LogAsync("QR scanned", $"{s.Action} {s.Quantity} {s.ItemName}");
        return Ok(s);
    }

    // ---- AI cost prediction ----

    [HttpGet("ai/cost-prediction")]
    public async Task<ActionResult<List<AiCostPrediction>>> CostPredictions([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<AiCostPrediction>(projectId);

    [HttpPost("ai/cost-prediction")]
    public async Task<ActionResult<AiCostPrediction>> SaveCostPrediction([FromBody] AiCostPrediction p)
    {
        if (p.Id == 0 && p.ProjectId > 0)
        {
            var ai = await _ai.AskAsync(
                $"Predict the total finishing cost for this interior design project. " +
                $"Include materials, labour and contractor margins. Return a single number in rupees.",
                new List<ChatTurn>());
            if (ai.Ok && double.TryParse(ai.Text, out var parsed)) p.PredictedCost = Math.Round(parsed, -3);
        }
        await _mods.SaveAsync(p);
        return Ok(p);
    }

    // ---- AI daily summary ----

    [HttpGet("ai/daily-summary")]
    public async Task<ActionResult> DailySummary([FromQuery] int projectId, [FromQuery] string? forDate)
    {
        var date = DateTime.TryParse(forDate, out var d) ? d.Date : DateTime.Today;
        var existing = (await _mods.AllAsync<AiDailySummary>()
            .ContinueWith(t => t.Result.FirstOrDefault(x => x.ProjectId == projectId && x.ForDate.Date == date.Date)));
        if (existing is not null && (DateTime.UtcNow - existing.GeneratedAt).TotalMinutes < 15)
            return Ok(existing);

        var project = await _projects.GetProjectAsync(projectId);
        var rooms = await _mods.AllFilteredAsync<Room>(projectId);
        var tasks = await _projects.GetTasksAsync(projectId);
        var txns = await _projects.GetTxnsAsync(projectId);
        var logs = await _projects.GetAttendanceInRangeAsync(projectId, date.AddDays(-6), date);
        var spent = txns.Where(t => t.Type == ProjectTxnTypes.PaymentOut).Sum(t => t.Amount);
        var received = txns.Where(t => t.Type == ProjectTxnTypes.PaymentIn).Sum(t => t.Amount);
        var done = tasks.Any() ? (int)Math.Round((double)tasks.Count(t => t.Status == TaskStatuses.Completed) / tasks.Count * 100) : 0;

        var prompt = $"Interior design project '{project?.Name ?? $"#{projectId}"}'. " +
                     $"Progress today: {done}% tasks complete. Spent: {ReportService.Money(spent)} this period, received: {ReportService.Money(received)}. " +
                     $"Rooms: {rooms.Count}, today's attendance entries: {logs.Count}. " +
                     $"Please write a 3-sentence end-of-day summary, then 3 key highlights (bullet points), " +
                     $"then 2 top risks and a mitigation each, then 3 suggested next-day actions. Be concise.";

        var ai = await _ai.AskAsync(prompt, new List<ChatTurn>());
        var summary = new AiDailySummary
        {
            ProjectId = projectId, ForDate = date,
            IsConfigured = ai.Ok, Summary = ai.Ok ? ai.Text : "[AI not configured — rule-based placeholder]",
        };
        if (!ai.Ok)
        {
            summary.Summary = $"Progress: {done}% tasks complete. Spent {ReportService.Money(spent)}, received {ReportService.Money(received)}." +
                              $" Rooms tracked: {rooms.Count}. Attendance entries: {logs.Count}. " +
                              $"AI summariser is not configured — add OPENROUTER_API_KEY to enable.";
        }
        await _mods.SaveAsync(summary);
        await _activity.LogAsync("AI daily summary", ai.Ok ? "generated" : "rule-based");
        return Ok(summary);
    }

    // ---- Lighting layout ----

    [HttpGet("lighting")]
    public async Task<ActionResult<List<LightingLayout>>> Lighting([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<LightingLayout>(projectId);

    [HttpPost("lighting")]
    public async Task<ActionResult<LightingLayout>> SaveLighting([FromBody] LightingLayout l)
    {
        await _mods.SaveAsync(l);
        await _activity.LogAsync("Lighting fixture added", l.Name);
        return Ok(l);
    }

    // ---- Finish library ----

    [HttpGet("finishes")]
    public async Task<ActionResult<List<FinishSwatch>>> Finishes() =>
        (await _mods.AllAsync<FinishSwatch>()).OrderBy(c => c.Category).ThenBy(n => n.Name).ToList();

    [HttpPost("finishes")]
    public async Task<ActionResult<FinishSwatch>> SaveFinish([FromBody] FinishSwatch f)
    {
        await _mods.SaveAsync(f);
        await _activity.LogAsync("Finish saved", f.Name);
        return Ok(f);
    }

    [HttpDelete("finishes/{id:int}")]
    public async Task<ActionResult> DeleteFinish(int id) { await _mods.DeleteAsync<FinishSwatch>(id); return Ok(); }

    // ---- Quotations ----

    [HttpGet("quotations")]
    public async Task<ActionResult<List<QuotationRoom>>> Quotations([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<QuotationRoom>(projectId);

    [HttpPost("quotations")]
    public async Task<ActionResult<QuotationRoom>> SaveQuotationRoom([FromBody] QuotationRoom q)
    {
        if (q.SortOrder == 0) q.SortOrder = (await _mods.AllFilteredAsync<QuotationRoom>(q.ProjectId)).Count + 1;
        await _mods.SaveAsync(q);
        return Ok(q);
    }

    [HttpGet("quotations/{projectId:int}/pdf")]
    public async Task<ActionResult> QuotationPdf(int projectId)
    {
        var rooms = await _mods.AllFilteredAsync<QuotationRoom>(projectId);
        var project = await _projects.GetProjectAsync(projectId);
        var settings = await GetBillingSettingsAsync();
        var firm = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        var total = rooms.Where(r => r.Amount.HasValue).Sum(r => r.Amount) ?? 0;

        var pdf = QuotationPdfService.Build(project, rooms, firm, total);
        return File(pdf, "application/pdf", $"Quotation-{project?.Name ?? $"#{projectId}"}-{DateTime.Today:yyyyMMdd}.pdf");
    }

    // ---- Designer payouts ----

    [HttpGet("payouts")]
    public async Task<ActionResult<List<DesignerPayout>>> Payouts([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<DesignerPayout>(projectId);

    [HttpPost("payouts")]
    public async Task<ActionResult<DesignerPayout>> SavePayout([FromBody] DesignerPayout p)
    {
        p.NetAmount = p.GrossAmount - (p.RetentionAmount ?? 0);
        await _mods.SaveAsync(p);
        await _activity.LogAsync("Payout saved", $"{p.DesignerName} · {ReportService.Money(p.NetAmount ?? p.GrossAmount)}");
        return Ok(p);
    }

    // ---- Client portal ----

    [HttpGet("client-projects")]
    public async Task<ActionResult<List<ClientProject>>> ClientProjects() =>
        await _mods.AllAsync<ClientProject>();

    [HttpPost("client-projects")]
    public async Task<ActionResult<ClientProject>> SaveClientProject([FromBody] ClientProject c)
    {
        if (string.IsNullOrWhiteSpace(c.AccessToken))
            c.AccessToken = Guid.NewGuid().ToString("N")[..12];
        await _mods.SaveAsync(c);
        await _activity.LogAsync("Client portal", c.ClientName);
        return Ok(c);
    }

    [HttpGet("client-selections")]
    public async Task<ActionResult<List<ClientSelection>>> ClientSelections([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<ClientSelection>(projectId);

    [HttpPost("client-selections")]
    public async Task<ActionResult<ClientSelection>> SaveClientSelection([FromBody] ClientSelection s)
    {
        await _mods.SaveAsync(s);
        return Ok(s);
    }

    // ---- Room-wise BOQ ----

    [HttpGet("boq")]
    public async Task<ActionResult<List<RoomBoqItem>>> Boq([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<RoomBoqItem>(projectId);

    [HttpPost("boq")]
    public async Task<ActionResult<RoomBoqItem>> SaveBoqItem([FromBody] RoomBoqItem b)
    {
        b.ActualCost = b.ActualCost ?? (b.Quantity * b.Rate);
        await _mods.SaveAsync(b);
        await _activity.LogAsync("BOQ item added", $"{b.RoomName} · {b.ItemName}");
        return Ok(b);
    }

    [HttpGet("boq/{projectId:int}/pdf")]
    public async Task<ActionResult> BoqPdf(int projectId)
    {
        var items = await _mods.AllFilteredAsync<RoomBoqItem>(projectId);
        var project = await _projects.GetProjectAsync(projectId);
        var settings = await GetBillingSettingsAsync();
        var firm = settings.GetValueOrDefault("general.firm_name", "LuxInfra");
        var total = items.Sum(b => b.Quantity * b.Rate);
        var pdf = BoqPdfService.Build(project, items, firm, total);
        return File(pdf, "application/pdf", $"BOQ-{project?.Name ?? $"#{projectId}"}-{DateTime.Today:yyyyMMdd}.pdf");
    }

    // ---- Installation tasks (Gantt) ----

    [HttpGet("install-tasks")]
    public async Task<ActionResult<List<InstallationTask>>> InstallTasks([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<InstallationTask>(projectId);

    [HttpPost("install-tasks")]
    public async Task<ActionResult<InstallationTask>> SaveInstallTask([FromBody] InstallationTask t)
    {
        await _mods.SaveAsync(t);
        await _activity.LogAsync("Install task saved", $"{t.Trade} · {t.Title} ({t.Status})");
        return Ok(t);
    }

    // ---- Room procurement ----

    [HttpGet("procurement")]
    public async Task<ActionResult<List<RoomProcurementOrder>>> Procurement([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<RoomProcurementOrder>(projectId);

    [HttpPost("procurement")]
    public async Task<ActionResult<RoomProcurementOrder>> SaveProcurementOrder([FromBody] RoomProcurementOrder o)
    {
        await _mods.SaveAsync(o);
        await _activity.LogAsync("Procurement order saved", o.VendorName);
        return Ok(o);
    }

    // ---- Project timeline ----

    [HttpGet("timeline")]
    public async Task<ActionResult<List<ProjectTimelineStage>>> Timeline([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<ProjectTimelineStage>(projectId);

    [HttpPost("timeline")]
    public async Task<ActionResult<ProjectTimelineStage>> SaveTimelineStage([FromBody] ProjectTimelineStage s)
    {
        await _mods.SaveAsync(s);
        return Ok(s);
    }

    // ---- Gantt chart data (timeline stages + installation tasks) ----

    [HttpGet("gantt")]
    public async Task<ActionResult<object>> Gantt([FromQuery] int projectId)
    {
        var stages = await _mods.AllFilteredAsync<ProjectTimelineStage>(projectId);
        var tasks = await _mods.AllFilteredAsync<InstallationTask>(projectId);
        return Ok(new { stages, tasks });
    }

    // ---- Resource allocation (workers + materials with capacity planning) ----

    [HttpGet("resources")]
    public async Task<ActionResult<List<ResourceAllocation>>> Resources([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<ResourceAllocation>(projectId);

    [HttpPost("resources")]
    public async Task<ActionResult<ResourceAllocation>> SaveResource([FromBody] ResourceAllocation r)
    {
        await _mods.SaveAsync(r);
        await _activity.LogAsync("Resource allocated", $"{r.Name} ({r.Type})");
        return Ok(r);
    }

    [HttpPost("resources/{id:int}/allocate")]
    public async Task<ActionResult> AllocateResource(int id, [FromBody] double hours)
    {
        var r = await _mods.GetAsync<ResourceAllocation>(id);
        if (r is null) return NotFound();
        r.Allocated += hours;
        await _mods.SaveAsync(r);
        return Ok(r);
    }

    [HttpDelete("resources/{id:int}")]
    public async Task<ActionResult> DeleteResource(int id) { await _mods.DeleteAsync<ResourceAllocation>(id); return Ok(); }

    // ---- Change order workflow ----

    [HttpGet("change-orders")]
    public async Task<ActionResult<List<ChangeOrder>>> ChangeOrders([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<ChangeOrder>(projectId);

    [HttpPost("change-orders")]
    public async Task<ActionResult<ChangeOrder>> SaveChangeOrder([FromBody] ChangeOrder c)
    {
        c.UpdatedAt = DateTime.UtcNow;
        await _mods.SaveAsync(c);
        await _activity.LogAsync("Change order updated", $"{c.Title} → {c.Status}");
        return Ok(c);
    }

    [HttpPost("change-orders/{id:int}/{status}")]
    public async Task<ActionResult<ChangeOrder>> ChangeOrderStatus(int id, string status)
    {
        var c = await _mods.GetAsync<ChangeOrder>(id);
        if (c is null) return NotFound();
        c.Status = status;
        c.UpdatedAt = DateTime.UtcNow;
        if (status == "Submitted" && c.SubmittedAt is null) c.SubmittedAt = DateTime.UtcNow;
        if (status == "Approved") { c.ApprovedAt = DateTime.UtcNow; }
        await _mods.SaveAsync(c);
        return Ok(c);
    }

    [HttpDelete("change-orders/{id:int}")]
    public async Task<ActionResult> DeleteChangeOrder(int id) { await _mods.DeleteAsync<ChangeOrder>(id); return Ok(); }

    // ---- Equipment maintenance ----

    [HttpGet("equipment-maintenance")]
    public async Task<ActionResult<List<EquipmentMaintenance>>> EquipmentMaintenance([FromQuery] int? projectId = null, [FromQuery] string? status = null)
    {
        var items = await _mods.AllAsync<EquipmentMaintenance>();
        if (status is not null) items = items.Where(m => m.Status == status).ToList();
        return Ok(items);
    }

    [HttpPost("equipment-maintenance")]
    public async Task<ActionResult<EquipmentMaintenance>> SaveEquipmentMaintenance([FromBody] EquipmentMaintenance m)
    {
        await _mods.SaveAsync(m);
        await _activity.LogAsync("Maintenance scheduled", m.EquipmentName);
        return Ok(m);
    }

    [HttpPost("equipment-maintenance/{id:int}/complete")]
    public async Task<ActionResult> CompleteMaintenance(int id)
    {
        var m = await _mods.GetAsync<EquipmentMaintenance>(id);
        if (m is null) return NotFound();
        m.Status = MaintStatuses.Completed;
        m.CompletedDate = DateTime.UtcNow;
        await _mods.SaveAsync(m);
        return Ok();
    }

    [HttpDelete("equipment-maintenance/{id:int}")]
    public async Task<ActionResult> DeleteMaintenance(int id) { await _mods.DeleteAsync<EquipmentMaintenance>(id); return Ok(); }

    // ---- AR measurements ----

    [HttpGet("ar-measurements")]
    public async Task<ActionResult<List<ArMeasurement>>> ArMeasurements([FromQuery] int? projectId) =>
        await _mods.AllFilteredAsync<ArMeasurement>(projectId);

    [HttpPost("ar-measurements")]
    public async Task<ActionResult<ArMeasurement>> SaveArMeasurement([FromBody] ArMeasurement m)
    {
        await _mods.SaveAsync(m);
        await _activity.LogAsync("AR measurement saved", m.AreaLabel);
        return Ok(m);
    }

    // ---- helpers ----

    private async Task<Dictionary<string, string>> GetBillingSettingsAsync() =>
        await _billing.GetAllSettingsAsync();
}

/// <summary>PDF generation for branded interior-design quotations.</summary>
public static class QuotationPdfService
{
    static QuotationPdfService() => QuestPDF.Settings.License = LicenseType.Community;

    public static byte[] Build(Project? project, List<QuotationRoom> rooms, string firm, double total)
    {
        var now = DateTime.Today.ToString("dd MMM, yyyy");
        var doc = Document.Create(doc => doc.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(40);
            page.DefaultTextStyle(t => t.FontSize(10).FontColor("#222233"));
            page.Header().Text($"{firm}").FontSize(14).SemiBold();
            page.Header().LineHorizontal(1).LineColor("#CCCCCC");

            page.Content().Column(col =>
            {
                col.Item().Text($"Quotation — {project?.Name ?? "Project"}").FontSize(16).Bold().FontColor("#7C4DFF");
                col.Item().Text($"Prepared on {now}").FontSize(9).FontColor("#666677");
                col.Item().PaddingTop(10).LineHorizontal(1).LineColor("#EEEEEE");

                if (rooms.Any())
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(3); c.RelativeColumn(1); });
                        void H(string k) => table.Cell().Padding(6).Background("#F4F2FB").Text(k).Bold();
                        void Cell(string v) => table.Cell().Padding(6).Text(v);
                        H("Room"); H("Amount");
                        foreach (var r in rooms.OrderBy(x => x.SortOrder))
                        {
                            Cell(r.RoomName); Cell(r.AmountLabel);
                        }
                        H("TOTAL"); H(total.ToString("₹#,##0"));
                    });
                }
                else col.Item().Text("No rooms yet.");

                col.Item().PaddingTop(20).Text("Terms: 50% advance to start, 50% on completion. Valid 30 days.").FontSize(9).FontColor("#666677");
            });

            page.Footer().AlignCenter().Text(t =>
            {
                t.Span($"© {firm} · quotation document · page ").FontColor("#999").FontSize(8);
                t.CurrentPageNumber().FontColor("#999").FontSize(8);
            });
        }));
        return doc.GeneratePdf();
    }
}

/// <summary>PDF generation for branded interior-design BOQ documents.</summary>
public static class BoqPdfService
{
    static BoqPdfService() => QuestPDF.Settings.License = LicenseType.Community;

    public static byte[] Build(Project? project, List<RoomBoqItem> items, string firm, double total)
    {
        var now = DateTime.Today.ToString("dd MMM, yyyy");
        var doc = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(t => t.FontSize(10).FontColor("#222233"));
                page.Header().Text(firm).FontSize(14).SemiBold();
                page.Header().LineHorizontal(1).LineColor("#CCCCCC");

                page.Content().Column(col =>
                {
                    col.Item().Text($"Bill of Quantities — {project?.Name ?? "Project"}").FontSize(16).Bold().FontColor("#7C4DFF");
                    col.Item().Text($"Prepared on {now}").FontSize(9).FontColor("#666677");
                    col.Item().PaddingTop(10).LineHorizontal(1).LineColor("#EEEEEE");

                    if (items.Any())
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c => { c.RelativeColumn(3); c.RelativeColumn(1); c.RelativeColumn(2); c.RelativeColumn(2); });
                            void H(string k) => table.Cell().Padding(6).Background("#F4F2FB").Text(k).Bold();
                            void Cell(string v) => table.Cell().Padding(6).Text(v);
                            H("Room"); H("Item"); H("Qty"); H("Total");
                            foreach (var it in items)
                            {
                                Cell(it.RoomName); Cell(it.ItemName); Cell($"{it.Quantity:0.##} {it.Unit}"); Cell(ReportService.Money(it.Quantity * it.Rate));
                            }
                            H("GRAND TOTAL"); H(""); H(""); H(ReportService.Money(total));
                        });
                    }
                    else col.Item().Text("No BOQ items yet.");
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span($"© {firm} · BOQ document · page ").FontColor("#999").FontSize(8);
                    t.CurrentPageNumber().FontColor("#999").FontSize(8);
                });
            });
        });
        return doc.GeneratePdf();
    }
}
