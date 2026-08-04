using LuxInfra.Services;
using LuxInfra.ViewModels;
using LuxInfra.Views;
using Microsoft.Extensions.Logging;

namespace LuxInfra;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp<App>()
			.ConfigureFonts(fonts =>
			{
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
			});

		builder.Services.AddSingleton(new DatabaseService(Path.Combine(FileSystem.AppDataDirectory, "luxinfra.db3")));
		builder.Services.AddSingleton<ReportService>();
		builder.Services.AddSingleton<EmailService>();
		builder.Services.AddSingleton<BillingService>();
		builder.Services.AddSingleton<ProjectService>();

		builder.Services.AddSingleton<ChatViewModel>();
		builder.Services.AddSingleton<DashboardViewModel>();
		builder.Services.AddSingleton<ReportsViewModel>();
		builder.Services.AddSingleton<SettingsViewModel>();
		builder.Services.AddSingleton<ProfileViewModel>();

		builder.Services.AddSingleton<ChatPage>();
		builder.Services.AddSingleton<DashboardPage>();
		builder.Services.AddSingleton<ReportsPage>();
		builder.Services.AddSingleton<SettingsPage>();
		builder.Services.AddSingleton<ProfilePage>();

		builder.Services.AddSingleton<BillingHomeViewModel>();
		builder.Services.AddSingleton<CatalogViewModel>();
		builder.Services.AddSingleton<BillingSettingsViewModel>();
		builder.Services.AddSingleton<CashBankViewModel>();
		builder.Services.AddSingleton<PlansViewModel>();
		builder.Services.AddTransient<PartyFormViewModel>();
		builder.Services.AddTransient<ItemFormViewModel>();
		builder.Services.AddTransient<TxnFormViewModel>();

		builder.Services.AddSingleton<ProjectsListViewModel>();
		builder.Services.AddTransient<ProjectWorkspaceViewModel>();
		builder.Services.AddTransient<ProjectTaskFormViewModel>();
		builder.Services.AddTransient<ProjectPaymentFormViewModel>();
		builder.Services.AddTransient<ProjectPartyViewModel>();
		builder.Services.AddTransient<ProjectTransactionViewModel>();
		builder.Services.AddTransient<ProjectSiteViewModel>();
		builder.Services.AddTransient<ProjectTaskViewModel>();
		builder.Services.AddTransient<ProjectAttendanceViewModel>();
		builder.Services.AddTransient<ProjectMaterialViewModel>();
		builder.Services.AddTransient<MaterialFormViewModel>();
		builder.Services.AddTransient<ProjectMomViewModel>();
		builder.Services.AddTransient<ProjectDesignViewModel>();
		builder.Services.AddTransient<ProjectFilesViewModel>();

		builder.Services.AddSingleton<BillingHomePage>();
		builder.Services.AddSingleton<CatalogPage>();
		builder.Services.AddSingleton<BillingSettingsPage>();
		builder.Services.AddSingleton<CashBankPage>();
		builder.Services.AddSingleton<PlansPage>();
		builder.Services.AddTransient<PartyFormPage>();
		builder.Services.AddTransient<ItemFormPage>();
		builder.Services.AddTransient<TxnFormPage>();

		builder.Services.AddSingleton<ProjectsListPage>();
		builder.Services.AddTransient<ProjectWorkspacePage>();
		builder.Services.AddTransient<ProjectTaskFormPage>();
		builder.Services.AddTransient<ProjectPaymentFormPage>();
		builder.Services.AddTransient<ProjectPartyPage>();
		builder.Services.AddTransient<ProjectTransactionPage>();
		builder.Services.AddTransient<ProjectSitePage>();
		builder.Services.AddTransient<ProjectTaskPage>();
		builder.Services.AddTransient<ProjectAttendancePage>();
		builder.Services.AddTransient<ProjectMaterialPage>();
		builder.Services.AddTransient<MaterialFormPage>();
		builder.Services.AddTransient<ProjectMomPage>();
		builder.Services.AddTransient<ProjectDesignPage>();
		builder.Services.AddTransient<ProjectFilesPage>();

#if DEBUG
		builder.Logging.AddDebug();
#endif

		return builder.Build();
	}
}
