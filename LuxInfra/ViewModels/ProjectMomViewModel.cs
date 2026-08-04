using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectMomViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public ObservableCollection<MeetingMinute> Minutes { get; } = new();

    [ObservableProperty] private bool isAdding;
    [ObservableProperty] private string newTitle = "";
    [ObservableProperty] private DateTime newDate = DateTime.Today;
    [ObservableProperty] private string newAttendees = "";
    [ObservableProperty] private string newNotes = "";
    [ObservableProperty] private string status = "";

    public ProjectMomViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load()
    {
        Minutes.Clear();
        foreach (var m in await _svc.GetMeetingMinutesAsync(ProjectId)) Minutes.Add(m);
    }

    [RelayCommand] private void ToggleAdd() => IsAdding = !IsAdding;

    [RelayCommand]
    private async Task Save()
    {
        if (string.IsNullOrWhiteSpace(NewTitle)) { Status = "⚠️ Title is required."; return; }

        await _svc.SaveMeetingMinuteAsync(new MeetingMinute
        {
            ProjectId = ProjectId,
            Title = NewTitle.Trim(),
            Date = NewDate,
            Attendees = NewAttendees.Trim(),
            Notes = NewNotes.Trim()
        });

        NewTitle = "";
        NewAttendees = "";
        NewNotes = "";
        IsAdding = false;
        Status = "✅ MOM saved.";
        await Load();
    }
}
