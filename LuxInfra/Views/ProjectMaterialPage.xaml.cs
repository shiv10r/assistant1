using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectMaterialPage : LuxContentPage<ProjectMaterialViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectMaterialPage(ProjectMaterialViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
