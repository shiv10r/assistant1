using LuxInfra.Services;

namespace LuxInfra;

public partial class App : Application
{
	public App()
	{
		InitializeComponent();
		ThemeService.Apply(ThemeService.Current);
	}

	protected override Window CreateWindow(IActivationState? activationState)
	{
		return new Window(new AppShell());
	}
}
