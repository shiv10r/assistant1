using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectFilesViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public ObservableCollection<ProjectFolder> Folders { get; } = new();
    public ObservableCollection<ProjectFile> Files { get; } = new();

    [ObservableProperty] private ProjectFolder? selectedFolder;
    [ObservableProperty] private string status = "";

    public bool HasSelectedFolder => SelectedFolder is not null;
    partial void OnSelectedFolderChanged(ProjectFolder? value) => OnPropertyChanged(nameof(HasSelectedFolder));

    public ProjectFilesViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand]
    public async Task Load()
    {
        Folders.Clear();
        foreach (var f in await _svc.GetFoldersAsync(ProjectId)) Folders.Add(f);
        await LoadFiles();
    }

    [RelayCommand]
    private async Task SelectFolder(ProjectFolder folder)
    {
        SelectedFolder = folder;
        await LoadFiles();
    }

    private async Task LoadFiles()
    {
        Files.Clear();
        if (SelectedFolder is null) return;
        foreach (var f in await _svc.GetFilesAsync(SelectedFolder.Id)) Files.Add(f);
    }

    public async Task AddFolder(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return;
        var folder = await _svc.AddFolderAsync(ProjectId, name.Trim());
        Folders.Add(folder);
        SelectedFolder = folder;
        await LoadFiles();
    }

    [RelayCommand]
    private async Task UploadFile()
    {
        if (SelectedFolder is null) { Status = "⚠️ Select or create a folder first."; return; }
        try
        {
            var result = await FilePicker.Default.PickAsync();
            if (result is null) return;
            await _svc.AddFileAsync(ProjectId, SelectedFolder.Id, result.FileName, result.FullPath);
            Status = $"✅ {result.FileName} uploaded.";
            await LoadFiles();
        }
        catch (Exception ex) { Status = $"⚠️ Couldn't upload: {ex.Message}"; }
    }
}
