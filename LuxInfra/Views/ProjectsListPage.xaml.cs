using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class ProjectsListPage : LuxContentPage<ProjectsListViewModel>
{
    public ProjectsListPage(ProjectsListViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Refresh();
}
