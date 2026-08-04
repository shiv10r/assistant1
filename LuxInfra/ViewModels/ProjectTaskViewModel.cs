using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectTaskViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    private List<ProjectTask> _allTasks = new();
    public ObservableCollection<ProjectTask> FilteredTasks { get; } = new();
    public List<string> TaskStatusOptions { get; } = new List<string> { "All" }.Concat(TaskStatuses.All).ToList();

    [ObservableProperty] private string taskStatusFilter = "All";
    [ObservableProperty] private string memberFilter = "";
    [ObservableProperty] private string notStartedCount = "0";
    [ObservableProperty] private string ongoingCount = "0";
    [ObservableProperty] private string overallProgressLabel = "0%";

    public ProjectTaskViewModel(ProjectService svc) => _svc = svc;

    partial void OnTaskStatusFilterChanged(string value) => ApplyFilter();
    partial void OnMemberFilterChanged(string value) => ApplyFilter();

    [RelayCommand]
    public async Task Load()
    {
        _allTasks = await _svc.GetTasksAsync(ProjectId);
        ApplyFilter();

        NotStartedCount = _allTasks.Count(t => t.Status == TaskStatuses.NotStarted).ToString();
        OngoingCount = _allTasks.Count(t => t.Status == TaskStatuses.Ongoing).ToString();
        OverallProgressLabel = _allTasks.Count == 0 ? "0%" : $"{_allTasks.Average(t => t.ProgressPercent):0}%";
    }

    private void ApplyFilter()
    {
        FilteredTasks.Clear();
        var m = MemberFilter.Trim().ToLowerInvariant();
        foreach (var t in _allTasks.Where(t =>
                     (TaskStatusFilter == "All" || t.Status == TaskStatusFilter) &&
                     (m.Length == 0 || t.Members.ToLowerInvariant().Contains(m))))
            FilteredTasks.Add(t);
    }

    [RelayCommand] private async Task AddTask() => await Shell.Current.GoToAsync($"ProjectTaskForm?projectId={ProjectId}");
}
