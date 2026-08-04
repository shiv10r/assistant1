namespace LuxInfra.Views;

public abstract class LuxContentPage<TViewModel> : ContentPage where TViewModel : class
{
    protected readonly TViewModel Vm;

    protected LuxContentPage(TViewModel vm) => BindingContext = Vm = vm;

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await OnLoadAsync();
    }

    protected virtual Task OnLoadAsync() => Task.CompletedTask;

    /// <summary>
    /// Shared handler for in-page "◀" back buttons, added because Shell's own
    /// flyout/back chrome can become unreachable after drilling into nested
    /// routed pages (project workspace and its sub-pages).
    /// </summary>
    protected async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("..");

    /// <summary>Shared handler for in-page "☰" buttons, same rationale as <see cref="OnBackClicked"/>.</summary>
    protected void OnFlyoutMenuClicked(object? sender, EventArgs e) => Shell.Current.FlyoutIsPresented = !Shell.Current.FlyoutIsPresented;
}
