using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class PartyFormPage : ContentPage
{
    public PartyFormPage(PartyFormViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
