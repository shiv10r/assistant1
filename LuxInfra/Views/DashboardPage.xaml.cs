using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class DashboardPage : LuxContentPage<DashboardViewModel>
{
    public DashboardPage(DashboardViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Refresh();
}
