using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectPartyPage : LuxContentPage<ProjectPartyViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectPartyPage(ProjectPartyViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
