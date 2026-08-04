using LuxInfra.Services;

namespace LuxInfra;

public partial class AppShell : Shell
{
	private const int MaxStackDepth = 50;
	private readonly Stack<string> _backStack = new();
	private readonly Stack<string> _forwardStack = new();
	private string? _currentLocation;
	private bool _historyNavigation;

	public AppShell()
	{
		InitializeComponent();
		if (FlyoutHeader is BindableObject header)
			header.BindingContext = ProfileService.Instance;
		VersionLabel.Text = $"v{AppInfo.Current.VersionString} · data stays on your device 🔒";

		Routing.RegisterRoute("PartyForm", typeof(Views.PartyFormPage));
		Routing.RegisterRoute("ItemForm", typeof(Views.ItemFormPage));
		Routing.RegisterRoute("TxnForm", typeof(Views.TxnFormPage));
		Routing.RegisterRoute("ProjectWorkspace", typeof(Views.ProjectWorkspacePage));
		Routing.RegisterRoute("ProjectTaskForm", typeof(Views.ProjectTaskFormPage));
		Routing.RegisterRoute("ProjectPaymentForm", typeof(Views.ProjectPaymentFormPage));
		Routing.RegisterRoute("ProjectParty", typeof(Views.ProjectPartyPage));
		Routing.RegisterRoute("ProjectTransaction", typeof(Views.ProjectTransactionPage));
		Routing.RegisterRoute("ProjectSite", typeof(Views.ProjectSitePage));
		Routing.RegisterRoute("ProjectTasks", typeof(Views.ProjectTaskPage));
		Routing.RegisterRoute("ProjectAttendance", typeof(Views.ProjectAttendancePage));
		Routing.RegisterRoute("ProjectMaterial", typeof(Views.ProjectMaterialPage));
		Routing.RegisterRoute("MaterialForm", typeof(Views.MaterialFormPage));
		Routing.RegisterRoute("ProjectMom", typeof(Views.ProjectMomPage));
		Routing.RegisterRoute("ProjectDesign", typeof(Views.ProjectDesignPage));
		Routing.RegisterRoute("ProjectFiles", typeof(Views.ProjectFilesPage));
	}

	/// <summary>Normalises a Shell route to a durable key for stack comparisons.</summary>
	private static string NormaliseRoute(string? raw)
	{
		if (string.IsNullOrWhiteSpace(raw)) return "";
		// Strip query parameters and normalise leading slashes
		var idx = raw.IndexOf('?', StringComparison.Ordinal);
		var route = idx >= 0 ? raw[..idx] : raw;
		return route.TrimStart('/').TrimEnd('/').ToLowerInvariant();
	}

	protected override void OnNavigated(ShellNavigatedEventArgs args)
	{
		base.OnNavigated(args);
		var raw = args.Current?.Location?.ToString() ?? "";
		var location = NormaliseRoute(raw);

		if (_historyNavigation)
		{
			_historyNavigation = false;
		}
		else
		{
			var prev = NormaliseRoute(_currentLocation);
			if (!string.IsNullOrEmpty(prev) && prev != location)
			{
				_backStack.Push(_currentLocation!);
				// Cap the back stack to prevent unbounded memory
				if (_backStack.Count > MaxStackDepth)
				{
					var temp = new Stack<string>(_backStack.Take(MaxStackDepth).Reverse());
					_backStack.Clear();
					foreach (var item in temp) _backStack.Push(item);
				}
				_forwardStack.Clear();
			}
		}

		_currentLocation = raw;
		UpdateNavButtons();
	}

	private void UpdateNavButtons()
	{
		if (BackBtn is null) return;
		BackBtn.IsEnabled = _backStack.Count > 0;
		BackBtn.Opacity = _backStack.Count > 0 ? 1 : 0.35;
		ForwardBtn.IsEnabled = _forwardStack.Count > 0;
		ForwardBtn.Opacity = _forwardStack.Count > 0 ? 1 : 0.35;
		TitleLabel.Text = CurrentPage?.Title is { Length: > 0 } t ? t : "LuxInfra";
	}

	private void OnMenuClicked(object? sender, EventArgs e) => FlyoutIsPresented = !FlyoutIsPresented;

	private async void OnBackClicked(object? sender, EventArgs e)
	{
		if (_backStack.Count == 0) return;
		var target = _backStack.Pop();
		if (_currentLocation is not null) _forwardStack.Push(_currentLocation);
		_historyNavigation = true;
		try { await GoToAsync(target); }
		catch
		{
			_historyNavigation = false;
			// If navigation failed, restore the forward stack entry
			if (_currentLocation is not null && _forwardStack.TryPop(out _))
				_backStack.Push(target);
		}
	}

	private async void OnForwardClicked(object? sender, EventArgs e)
	{
		if (_forwardStack.Count == 0) return;
		var target = _forwardStack.Pop();
		if (_currentLocation is not null) _backStack.Push(_currentLocation);
		_historyNavigation = true;
		try { await GoToAsync(target); }
		catch
		{
			_historyNavigation = false;
			// If navigation failed, restore the back stack entry
			if (_currentLocation is not null && _backStack.TryPop(out _))
				_forwardStack.Push(target);
		}
	}

	private async void OnFeedbackClicked(object? sender, EventArgs e)
	{
		FlyoutIsPresented = false;
		try
		{
			await Launcher.Default.OpenAsync(
				$"mailto:{EmailService.DefaultRecipient}?subject={Uri.EscapeDataString("LuxInfra feedback")}");
		}
		catch { /* no mail app */ }
	}

	private async void OnEmergencyClicked(object? sender, EventArgs e)
	{
		FlyoutIsPresented = false;
		var call = await DisplayAlert("🚨 Safety emergency",
			"For an on-site emergency call 112 (national emergency number). Call now?", "📞 Call 112", "Cancel");
		if (call)
		{
			try { await Launcher.Default.OpenAsync("tel:112"); }
			catch { await DisplayAlert("No dialer", "Call 112 from your phone.", "OK"); }
		}
	}

	private async void OnLogoutClicked(object? sender, EventArgs e)
	{
		FlyoutIsPresented = false;
		var yes = await DisplayAlert("Logout", "Clear your profile info on this device? (Your expense data stays.)", "Logout", "Cancel");
		if (yes)
			ProfileService.Instance.Logout();
	}
}
