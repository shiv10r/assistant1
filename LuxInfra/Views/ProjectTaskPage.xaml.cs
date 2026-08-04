using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectTaskPage : LuxContentPage<ProjectTaskViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectTaskPage(ProjectTaskViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
