using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class ReportsPage : LuxContentPage<ReportsViewModel>
{
    public ReportsPage(ReportsViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Refresh();
}
