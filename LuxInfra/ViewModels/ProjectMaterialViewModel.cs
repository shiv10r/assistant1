using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public record InventoryRow(string Material, double Qty, string Unit)
{
    public string QtyLabel => $"{Qty:0.##} {Unit}";
}

public partial class ProjectMaterialViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }

    public ObservableCollection<InventoryRow> Inventory { get; } = new();
    public ObservableCollection<MaterialTxn> Requests { get; } = new();
    public ObservableCollection<MaterialTxn> Received { get; } = new();
    public ObservableCollection<MaterialTxn> Delivered { get; } = new();

    [ObservableProperty] private string selectedTab = "Inventory";

    public bool IsInventoryTab => SelectedTab == "Inventory";
    public bool IsRequestTab => SelectedTab == "Request";
    public bool IsReceivedTab => SelectedTab == "Received";
    public bool IsDeliveredTab => SelectedTab == "Delivered";

    partial void OnSelectedTabChanged(string value)
    {
        OnPropertyChanged(nameof(IsInventoryTab));
        OnPropertyChanged(nameof(IsRequestTab));
        OnPropertyChanged(nameof(IsReceivedTab));
        OnPropertyChanged(nameof(IsDeliveredTab));
    }

    public ProjectMaterialViewModel(ProjectService svc) => _svc = svc;

    [RelayCommand] private void SelectTab(string tab) => SelectedTab = tab;

    [RelayCommand]
    public async Task Load()
    {
        var all = await _svc.GetMaterialTxnsAsync(ProjectId);
        Requests.Clear();
        foreach (var m in all.Where(m => m.Kind == MaterialTxnKinds.Request)) Requests.Add(m);
        Received.Clear();
        foreach (var m in all.Where(m => m.Kind == MaterialTxnKinds.Received)) Received.Add(m);
        Delivered.Clear();
        foreach (var m in all.Where(m => m.Kind == MaterialTxnKinds.Delivered)) Delivered.Add(m);

        Inventory.Clear();
        foreach (var row in await _svc.GetInventoryAsync(ProjectId))
            Inventory.Add(new InventoryRow(row.Material, row.Qty, row.Unit));
    }

    [RelayCommand] private async Task RequestMaterial() => await Shell.Current.GoToAsync($"MaterialForm?projectId={ProjectId}&kind=Request");
    [RelayCommand] private async Task ReceiveMaterial() => await Shell.Current.GoToAsync($"MaterialForm?projectId={ProjectId}&kind=Received");
    [RelayCommand] private async Task DeliverMaterial() => await Shell.Current.GoToAsync($"MaterialForm?projectId={ProjectId}&kind=Delivered");
}
