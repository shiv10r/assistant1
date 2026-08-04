using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class CatalogPage : LuxContentPage<CatalogViewModel>
{
    public CatalogPage(CatalogViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override Task OnLoadAsync() => Vm.Refresh();
}
