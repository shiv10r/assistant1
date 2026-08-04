using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class BillingSettingsPage : LuxContentPage<BillingSettingsViewModel>
{
    private bool _loaded;

    public BillingSettingsPage(BillingSettingsViewModel vm) : base(vm)
    {
        InitializeComponent();
    }

    protected override async Task OnLoadAsync()
    {
        if (_loaded) return;
        _loaded = true;
        await Vm.LoadAsync();
    }
}
