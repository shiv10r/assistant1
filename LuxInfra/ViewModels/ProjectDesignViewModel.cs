using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectDesignViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    private List<DesignFile> _all = new();
    public ObservableCollection<DesignFile> Filtered { get; } = new();
    public List<string> Categories { get; } = DesignCategories.All.ToList();

    [ObservableProperty] private string selectedCategory = DesignCategories.Layout2D;
    [ObservableProperty] private bool isAdding;
    [ObservableProperty] private string newName = "";
    [ObservableProperty] private string newCategory = DesignCategories.Layout2D;
    [ObservableProperty] private string newImagePath = "";
    [ObservableProperty] private string newNote = "";
    [ObservableProperty] private string status = "";

    public bool HasImage => !string.IsNullOrWhiteSpace(NewImagePath);
    public string ImageFileName => HasImage ? Path.GetFileName(NewImagePath) : "";

    partial void OnNewImagePathChanged(string value)
    {
        OnPropertyChanged(nameof(HasImage));
        OnPropertyChanged(nameof(ImageFileName));
    }

    partial void OnSelectedCategoryChanged(string value) => ApplyFilter();

    public ProjectDesignViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load()
    {
        _all = await _svc.GetDesignFilesAsync(ProjectId);
        ApplyFilter();
    }

    private void ApplyFilter()
    {
        Filtered.Clear();
        foreach (var d in _all.Where(d => d.Category == SelectedCategory)) Filtered.Add(d);
    }

    [RelayCommand] private void SelectCategory(string category) => SelectedCategory = category;
    [RelayCommand] private void ToggleAdd() => IsAdding = !IsAdding;

    [RelayCommand]
    private async Task PickImage()
    {
        try
        {
            var result = await MediaPicker.Default.PickPhotoAsync();
            if (result is not null) NewImagePath = result.FullPath;
        }
        catch (Exception ex) { Status = $"⚠️ Couldn't pick an image: {ex.Message}"; }
    }

    [RelayCommand] private void RemoveImage() => NewImagePath = "";

    [RelayCommand]
    private async Task Save()
    {
        if (string.IsNullOrWhiteSpace(NewName)) { Status = "⚠️ Name is required."; return; }

        await _svc.SaveDesignFileAsync(new DesignFile
        {
            ProjectId = ProjectId,
            Category = NewCategory,
            Name = NewName.Trim(),
            ImagePath = NewImagePath,
            Note = NewNote.Trim()
        });

        NewName = "";
        NewImagePath = "";
        NewNote = "";
        IsAdding = false;
        Status = "✅ Added.";
        await Load();
    }
}
