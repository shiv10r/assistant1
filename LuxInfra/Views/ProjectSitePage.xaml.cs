using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectSitePage : LuxContentPage<ProjectSiteViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectSitePage(ProjectSiteViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
