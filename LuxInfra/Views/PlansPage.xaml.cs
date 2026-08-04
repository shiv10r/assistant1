using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class PlansPage : ContentPage
{
    public PlansPage(PlansViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
