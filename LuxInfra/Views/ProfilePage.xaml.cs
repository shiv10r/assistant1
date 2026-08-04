using System.Globalization;
using LuxInfra.Services;
using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public class InvertBoolConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture) =>
        value is bool b && !b;

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) =>
        value is bool b && !b;
}

public partial class ProfilePage : ContentPage
{
    public ProfilePage(ProfileViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }

    private void OnVegClicked(object? sender, EventArgs e) =>
        ProfileService.Instance.FoodPref = "🥗 Veg";

    private void OnNonVegClicked(object? sender, EventArgs e) =>
        ProfileService.Instance.FoodPref = "🍗 Non-veg";
}
