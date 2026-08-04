using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectFilesPage : LuxContentPage<ProjectFilesViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectFilesPage(ProjectFilesViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();

    private async void OnNewFolderClicked(object? sender, EventArgs e)
    {
        var name = await DisplayPromptAsync("New Folder", "Folder name", "Create", "Cancel");
        if (!string.IsNullOrWhiteSpace(name)) await Vm.AddFolder(name);
    }
}
