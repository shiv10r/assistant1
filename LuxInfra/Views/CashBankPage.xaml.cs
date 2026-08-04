using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class CashBankPage : LuxContentPage<CashBankViewModel>
{
    public CashBankPage(CashBankViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Refresh();
}
