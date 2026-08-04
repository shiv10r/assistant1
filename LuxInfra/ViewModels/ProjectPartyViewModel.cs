using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class ProjectPartyViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    private List<SiteParty> _allParties = new();
    public ObservableCollection<SiteParty> FilteredParties { get; } = new();
    public List<string> PartyRoleOptions { get; } = SitePartyRoles.All.ToList();

    [ObservableProperty] private string partySearch = "";
    [ObservableProperty] private bool partyShowActive = true;
    [ObservableProperty] private bool isAddingParty;
    [ObservableProperty] private string newPartyName = "";
    [ObservableProperty] private string newPartyPhone = "";
    [ObservableProperty] private string newPartyRole = SitePartyRoles.SiteStaff;
    [ObservableProperty] private string newPartyAmount = "";
    [ObservableProperty] private bool newPartyIsAdvance;
    [ObservableProperty] private string advancePaidLabel = "₹0";
    [ObservableProperty] private string pendingToPayLabel = "₹0";
    [ObservableProperty] private string partyStatus = "";

    public ProjectPartyViewModel(ProjectService svc) => _svc = svc;

    partial void OnPartySearchChanged(string value) => ApplyPartyFilter();
    partial void OnPartyShowActiveChanged(bool value) => ApplyPartyFilter();

    [RelayCommand]
    public async Task Load()
    {
        _allParties = await _svc.GetPartiesAsync(ProjectId);
        ApplyPartyFilter();

        var advance = _allParties.Where(p => p.CurrentBalance > 0).Sum(p => p.CurrentBalance);
        var pending = -_allParties.Where(p => p.CurrentBalance < 0).Sum(p => p.CurrentBalance);
        AdvancePaidLabel = ReportService.Money(Math.Abs(advance));
        PendingToPayLabel = ReportService.Money(Math.Abs(pending));
    }

    private void ApplyPartyFilter()
    {
        FilteredParties.Clear();
        var q = PartySearch.Trim().ToLowerInvariant();
        foreach (var p in _allParties.Where(p => p.IsActive == PartyShowActive &&
                                                  (q.Length == 0 || p.Name.ToLowerInvariant().Contains(q))))
            FilteredParties.Add(p);
    }

    [RelayCommand] private void ToggleAddParty() => IsAddingParty = !IsAddingParty;
    [RelayCommand] private void SetPartyActive() => PartyShowActive = true;
    [RelayCommand] private void SetPartyInactive() => PartyShowActive = false;

    [RelayCommand]
    private async Task SaveParty()
    {
        if (string.IsNullOrWhiteSpace(NewPartyName)) { PartyStatus = "⚠️ Name is required."; return; }

        await _svc.SavePartyAsync(new SiteParty
        {
            ProjectId = ProjectId,
            Name = NewPartyName.Trim(),
            Phone = NewPartyPhone.Trim(),
            Role = NewPartyRole,
            OpeningBalance = double.TryParse(NewPartyAmount, out var a) ? a : 0,
            BalanceType = NewPartyIsAdvance ? "advance" : "pending"
        });

        NewPartyName = "";
        NewPartyPhone = "";
        NewPartyAmount = "";
        NewPartyIsAdvance = false;
        IsAddingParty = false;
        PartyStatus = "✅ Party added.";
        await Load();
    }
}
