using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectDesignPage : LuxContentPage<ProjectDesignViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectDesignPage(ProjectDesignViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
