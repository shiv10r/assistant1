using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class ItemFormPage : ContentPage
{
    public ItemFormPage(ItemFormViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
