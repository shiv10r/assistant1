using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectTransactionPage : LuxContentPage<ProjectTransactionViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectTransactionPage(ProjectTransactionViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
