using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectTaskFormViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public List<string> TaskStatusOptions { get; } = TaskStatuses.All.ToList();

    [ObservableProperty] private string name = "";
    [ObservableProperty] private string taskStatus = TaskStatuses.NotStarted;
    [ObservableProperty] private string members = "";
    [ObservableProperty] private string location = "";
    [ObservableProperty] private string durationDays = "";
    [ObservableProperty] private DateTime startDate = DateTime.Today;
    [ObservableProperty] private DateTime endDate = DateTime.Today;
    [ObservableProperty] private string estQuantity = "";
    [ObservableProperty] private string progressPercent = "";
    [ObservableProperty] private string imagePath = "";
    [ObservableProperty] private string link = "";
    [ObservableProperty] private string formStatus = "";

    public bool HasImage => !string.IsNullOrWhiteSpace(ImagePath);
    public string ImageFileName => HasImage ? Path.GetFileName(ImagePath) : "";

    partial void OnImagePathChanged(string value)
    {
        OnPropertyChanged(nameof(HasImage));
        OnPropertyChanged(nameof(ImageFileName));
    }

    public ProjectTaskFormViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    private async Task PickImage()
    {
        try
        {
            var result = await MediaPicker.Default.PickPhotoAsync();
            if (result is not null) ImagePath = result.FullPath;
        }
        catch (Exception ex) { FormStatus = $"⚠️ Couldn't pick an image: {ex.Message}"; }
    }

    [RelayCommand] private void RemoveImage() => ImagePath = "";

    [RelayCommand]
    private async Task Save()
    {
        if (await SaveInternal()) await Shell.Current.GoToAsync("..");
    }

    [RelayCommand]
    private async Task SaveAndNew()
    {
        if (!await SaveInternal()) return;
        Name = "";
        DurationDays = "";
        EstQuantity = "";
        ProgressPercent = "";
        Members = "";
        Location = "";
        ImagePath = "";
        Link = "";
        TaskStatus = TaskStatuses.NotStarted;
        FormStatus = "✅ Saved! Add the next task.";
    }

    private async Task<bool> SaveInternal()
    {
        if (string.IsNullOrWhiteSpace(Name)) { FormStatus = "⚠️ Task name is required."; return false; }
        if (!int.TryParse(DurationDays, out var duration) || duration <= 0) { FormStatus = "⚠️ Enter a valid duration (days)."; return false; }

        await _svc.SaveTaskAsync(new ProjectTask
        {
            ProjectId = ProjectId,
            Name = Name.Trim(),
            Status = TaskStatus,
            Members = Members.Trim(),
            Location = Location.Trim(),
            DurationDays = duration,
            StartDate = StartDate,
            EndDate = EndDate,
            EstQuantity = double.TryParse(EstQuantity, out var q) ? q : 0,
            ProgressPercent = double.TryParse(ProgressPercent, out var p) ? p : 0,
            ImagePath = ImagePath,
            Link = Link.Trim()
        });
        return true;
    }
}
