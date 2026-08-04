using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectsListViewModel : ObservableObject
{
    private readonly ProjectService _svc;

    public ObservableCollection<Project> Projects { get; } = new();
    public List<string> StatusOptions { get; } = ProjectStatuses.All.ToList();

    [ObservableProperty] private bool isAdding;
    [ObservableProperty] private string newName = "";
    [ObservableProperty] private string newAddress = "";
    [ObservableProperty] private string newValue = "";
    [ObservableProperty] private string newStatus = ProjectStatuses.Ongoing;
    [ObservableProperty] private string status = "";

    public string AddButtonLabel => IsAdding ? "✕ Cancel" : "＋ New Project";

    public ProjectsListViewModel(ProjectService svc) => _svc = svc;

    partial void OnIsAddingChanged(bool value) => OnPropertyChanged(nameof(AddButtonLabel));

    [RelayCommand]
    public async Task Refresh()
    {
        Projects.Clear();
        foreach (var p in await _svc.GetProjectsAsync()) Projects.Add(p);
    }

    [RelayCommand] private void ToggleAdd() => IsAdding = !IsAdding;

    [RelayCommand]
    private async Task SaveProject()
    {
        if (string.IsNullOrWhiteSpace(NewName)) { Status = "⚠️ Project name is required."; return; }

        await _svc.SaveProjectAsync(new Project
        {
            Name = NewName.Trim(),
            Address = NewAddress.Trim(),
            Value = double.TryParse(NewValue, out var v) ? v : 0,
            Status = NewStatus
        });

        NewName = "";
        NewAddress = "";
        NewValue = "";
        NewStatus = ProjectStatuses.Ongoing;
        IsAdding = false;
        Status = "✅ Project created.";
        await Refresh();
    }

    [RelayCommand]
    private async Task OpenProject(Project project)
    {
        try
        {
            await Shell.Current.GoToAsync($"ProjectWorkspace?id={project.Id}");
        }
        catch (Exception ex)
        {
            Status = $"⚠️ NAV ERROR: {ex.GetType().Name}: {ex.Message}";
        }
    }
}
