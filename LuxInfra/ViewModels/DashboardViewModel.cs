using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public class SiteGroup : List<ExpenseEntry>
{
    public string Site { get; }
    public string TotalLabel { get; }

    public SiteGroup(string site, double total, IEnumerable<ExpenseEntry> entries) : base(entries)
    {
        Site = site;
        TotalLabel = ReportService.Money(total);
    }
}

public partial class DashboardViewModel : ObservableObject
{
    private readonly DatabaseService _db;

    public ObservableCollection<SiteGroup> Groups { get; } = new();

    [ObservableProperty] private string todayTotal = "₹0";
    [ObservableProperty] private string monthTotal = "₹0";
    [ObservableProperty] private string grandTotal = "₹0";
    [ObservableProperty] private string siteCount = "0";
    [ObservableProperty] private bool isEmpty = true;

    public DashboardViewModel(DatabaseService db) => _db = db;

    [RelayCommand]
    public async Task Refresh()
    {
        var all = await _db.GetAllAsync();

        TodayTotal = ReportService.Money(all.Where(e => e.Date.Date == DateTime.Today).Sum(e => e.Amount));
        MonthTotal = ReportService.Money(all.Where(e => e.Date.Year == DateTime.Today.Year && e.Date.Month == DateTime.Today.Month).Sum(e => e.Amount));
        GrandTotal = ReportService.Money(all.Sum(e => e.Amount));
        SiteCount = all.Select(e => e.Site).Distinct(StringComparer.OrdinalIgnoreCase).Count().ToString();
        IsEmpty = all.Count == 0;

        Groups.Clear();
        foreach (var g in all.GroupBy(e => e.Site).OrderByDescending(g => g.Sum(e => e.Amount)))
            Groups.Add(new SiteGroup(g.Key, g.Sum(e => e.Amount), g.OrderByDescending(e => e.Date)));
    }
}
