using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectSiteViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public ObservableCollection<ProjectTask> OngoingTasks { get; } = new();
    public ObservableCollection<SiteLog> Logs { get; } = new();

    [ObservableProperty] private string presentCount = "0";
    [ObservableProperty] private string materialReceivedLabel = "0";
    [ObservableProperty] private string materialUsedLabel = "0";
    [ObservableProperty] private string latestProgressLabel = "0%";

    [ObservableProperty] private bool isAddingDpr;
    [ObservableProperty] private string dprProgress = "";
    [ObservableProperty] private string dprNote = "";
    [ObservableProperty] private string dprStatus = "";

    public ProjectSiteViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load()
    {
        var today = await _svc.GetAttendanceForDateAsync(ProjectId, DateTime.Today);
        PresentCount = today.Count(a => a.Status == AttendanceStatuses.Present).ToString();

        var material = await _svc.GetMaterialTxnsAsync(ProjectId);
        MaterialReceivedLabel = material.Where(m => m.Kind == MaterialTxnKinds.Received).Sum(m => m.Quantity).ToString("0.##");
        MaterialUsedLabel = material.Where(m => m.Kind == MaterialTxnKinds.Delivered).Sum(m => m.Quantity).ToString("0.##");

        var tasks = await _svc.GetTasksAsync(ProjectId);
        OngoingTasks.Clear();
        foreach (var t in tasks.Where(t => t.Status == TaskStatuses.Ongoing)) OngoingTasks.Add(t);

        Logs.Clear();
        foreach (var l in await _svc.GetSiteLogsAsync(ProjectId)) Logs.Add(l);
        LatestProgressLabel = Logs.Count > 0 ? Logs[0].ProgressLabel : "0%";
    }

    [RelayCommand] private void ToggleAddDpr() => IsAddingDpr = !IsAddingDpr;

    [RelayCommand]
    private async Task SaveDpr()
    {
        await _svc.SaveSiteLogAsync(new SiteLog
        {
            ProjectId = ProjectId,
            ProgressPercent = double.TryParse(DprProgress, out var p) ? p : 0,
            Note = DprNote.Trim()
        });
        DprProgress = "";
        DprNote = "";
        IsAddingDpr = false;
        DprStatus = "✅ DPR logged.";
        await Load();
    }
}
