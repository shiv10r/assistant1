using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectMomPage : LuxContentPage<ProjectMomViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectMomPage(ProjectMomViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
