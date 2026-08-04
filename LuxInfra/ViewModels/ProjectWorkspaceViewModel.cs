using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

/// <summary>
/// Drives the project dashboard: header + project overview + a quick "Add DPR" action,
/// plus the 9 cards (Party, Transaction, Site, Task, Attendance, Material, MOM, Design,
/// Files) that each open their own dedicated page.
/// </summary>
public partial class ProjectWorkspaceViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    [ObservableProperty] private Project? project;
    [ObservableProperty] private bool isAddingDpr;
    [ObservableProperty] private string dprProgress = "";
    [ObservableProperty] private string dprNote = "";
    [ObservableProperty] private string dprStatus = "";

    public ProjectWorkspaceViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load() => Project = await _svc.GetProjectAsync(ProjectId);

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
    }

    [RelayCommand] private async Task OpenParty() => await Shell.Current.GoToAsync($"ProjectParty?projectId={ProjectId}");
    [RelayCommand] private async Task OpenTransaction() => await Shell.Current.GoToAsync($"ProjectTransaction?projectId={ProjectId}");
    [RelayCommand] private async Task OpenSite() => await Shell.Current.GoToAsync($"ProjectSite?projectId={ProjectId}");
    [RelayCommand] private async Task OpenTasks() => await Shell.Current.GoToAsync($"ProjectTasks?projectId={ProjectId}");
    [RelayCommand] private async Task OpenAttendance() => await Shell.Current.GoToAsync($"ProjectAttendance?projectId={ProjectId}");
    [RelayCommand] private async Task OpenMaterial() => await Shell.Current.GoToAsync($"ProjectMaterial?projectId={ProjectId}");
    [RelayCommand] private async Task OpenMom() => await Shell.Current.GoToAsync($"ProjectMom?projectId={ProjectId}");
    [RelayCommand] private async Task OpenDesign() => await Shell.Current.GoToAsync($"ProjectDesign?projectId={ProjectId}");
    [RelayCommand] private async Task OpenFiles() => await Shell.Current.GoToAsync($"ProjectFiles?projectId={ProjectId}");
}
