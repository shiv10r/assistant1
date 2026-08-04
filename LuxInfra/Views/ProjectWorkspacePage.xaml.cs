using LuxInfra.Services;
using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "id")]
public partial class ProjectWorkspacePage : LuxContentPage<ProjectWorkspaceViewModel>
{
    private readonly ProjectService _projects;

    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectWorkspacePage(ProjectWorkspaceViewModel vm, ProjectService projects) : base(vm)
    {
        InitializeComponent();
        _projects = projects;
    }

    protected override Task OnLoadAsync() => Vm.Load();

    private async void OnInfoClicked(object? sender, EventArgs e)
    {
        var p = Vm.Project;
        if (p is null) return;
        var address = string.IsNullOrWhiteSpace(p.Address) ? "No address set" : p.Address;
        await DisplayAlert(p.Name,
            $"📍 {address}\n💰 Project Value: {p.ValueLabel}\n📌 Status: {p.Status}", "OK");
    }

    private async void OnMenuClicked(object? sender, EventArgs e)
    {
        var p = Vm.Project;
        if (p is null) return;

        var choice = await DisplayActionSheet(p.Name, "Cancel", "🗑️ Delete Project");
        if (choice != "🗑️ Delete Project") return;

        var confirm = await DisplayAlert("Delete Project",
            $"Delete \"{p.Name}\" and all its parties, tasks and transactions? This can't be undone.", "Delete", "Cancel");
        if (!confirm) return;

        await _projects.DeleteProjectAsync(p.Id);
        await Shell.Current.GoToAsync("..");
    }
}
