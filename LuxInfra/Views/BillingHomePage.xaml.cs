using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class BillingHomePage : LuxContentPage<BillingHomeViewModel>
{
    public BillingHomePage(BillingHomeViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Refresh();
}
