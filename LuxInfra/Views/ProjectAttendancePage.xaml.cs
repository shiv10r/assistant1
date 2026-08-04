using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectAttendancePage : LuxContentPage<ProjectAttendanceViewModel>
{
    public int ProjectId { set => Vm.ProjectId = value; }

    public ProjectAttendancePage(ProjectAttendanceViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Load();
}
