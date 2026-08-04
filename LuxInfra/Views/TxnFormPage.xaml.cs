using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class TxnFormPage : LuxContentPage<TxnFormViewModel>
{
    public TxnFormPage(TxnFormViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.LoadAsync();
}
