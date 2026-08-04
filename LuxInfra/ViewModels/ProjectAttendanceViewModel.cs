using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

/// <summary>One site party's attendance row for the selected day — carries its own status/hours commands.</summary>
public partial class AttendanceRow : ObservableObject
{
    private readonly ProjectService _svc;
    private readonly int _projectId;
    private readonly DateTime _date;
    private readonly Action _onChanged;

    public SiteParty Party { get; }

    [ObservableProperty] private string status;
    [ObservableProperty] private string hoursText;

    public AttendanceRow(ProjectService svc, int projectId, DateTime date, SiteParty party, string status, double hours, Action onChanged)
    {
        _svc = svc;
        _projectId = projectId;
        _date = date;
        Party = party;
        this.status = status;
        hoursText = hours > 0 ? hours.ToString("0.#") : "";
        _onChanged = onChanged;
    }

    [RelayCommand]
    private async Task SetStatus(string newStatus)
    {
        Status = newStatus;
        await _svc.SetAttendanceStatusAsync(_projectId, Party, _date, newStatus);
        _onChanged();
    }

    [RelayCommand]
    private async Task SaveHours()
    {
        var hrs = double.TryParse(HoursText, out var h) ? h : 0;
        await _svc.SetAttendanceHoursAsync(_projectId, Party, _date, hrs);
        if (Status != AttendanceStatuses.Present) await SetStatus(AttendanceStatuses.Present);
    }
}

public partial class ProjectAttendanceViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public ObservableCollection<AttendanceRow> Rows { get; } = new();

    [ObservableProperty] private DateTime selectedDate = DateTime.Today;
    [ObservableProperty] private string registeredCount = "0";
    [ObservableProperty] private string upcomingCount = "0";
    [ObservableProperty] private string presentCount = "0";
    [ObservableProperty] private string absentCount = "0";

    public string DateLabel => SelectedDate.ToString("dd MMM, yyyy");

    public ProjectAttendanceViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load()
    {
        var parties = await _svc.GetPartiesAsync(ProjectId);
        var records = await _svc.GetAttendanceForDateAsync(ProjectId, SelectedDate);

        Rows.Clear();
        foreach (var p in parties)
        {
            var rec = records.FirstOrDefault(r => r.PartyId == p.Id);
            Rows.Add(new AttendanceRow(_svc, ProjectId, SelectedDate, p,
                rec?.Status ?? AttendanceStatuses.Registered, rec?.HoursLogged ?? 0, RecomputeCounts));
        }
        RecomputeCounts();
    }

    private void RecomputeCounts()
    {
        RegisteredCount = Rows.Count(r => r.Status == AttendanceStatuses.Registered).ToString();
        UpcomingCount = Rows.Count(r => r.Status == AttendanceStatuses.Upcoming).ToString();
        PresentCount = Rows.Count(r => r.Status == AttendanceStatuses.Present).ToString();
        AbsentCount = Rows.Count(r => r.Status == AttendanceStatuses.Absent).ToString();
    }

    [RelayCommand]
    private async Task PrevDay()
    {
        SelectedDate = SelectedDate.AddDays(-1);
        OnPropertyChanged(nameof(DateLabel));
        await Load();
    }

    [RelayCommand]
    private async Task NextDay()
    {
        SelectedDate = SelectedDate.AddDays(1);
        OnPropertyChanged(nameof(DateLabel));
        await Load();
    }
}
