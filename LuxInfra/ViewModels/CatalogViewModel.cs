using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

public partial class CatalogViewModel : ObservableObject
{
    private readonly BillingService _billing;

    public ObservableCollection<CatalogItem> Items { get; } = new();

    public CatalogViewModel(BillingService billing) => _billing = billing;

    [RelayCommand]
    public async Task Refresh()
    {
        Items.Clear();
        foreach (var i in await _billing.GetItemsAsync()) Items.Add(i);
    }

    [RelayCommand]
    private async Task AddItem() => await Shell.Current.GoToAsync("ItemForm");
}

public partial class ItemFormViewModel : ObservableObject
{
    private readonly BillingService _billing;

    public List<string> TypeOptions { get; } = new() { "Product", "Service" };
    public List<string> UnitOptions { get; } = new() { "Pcs", "Kg", "Gm", "Ltr", "Mtr", "Sqft", "Box", "Bag", "Dozen", "Hour", "Day" };
    public List<string> TaxOptions { get; } = new() { "0", "0.25", "3", "5", "12", "18", "28" };

    [ObservableProperty] private string name = "";
    [ObservableProperty] private string type = "Product";
    [ObservableProperty] private string salePrice = "";
    [ObservableProperty] private string purchasePrice = "";
    [ObservableProperty] private string wholesalePrice = "";
    [ObservableProperty] private string unit = "Pcs";
    [ObservableProperty] private string category = "";
    [ObservableProperty] private string hsnSac = "";
    [ObservableProperty] private string taxRate = "18";
    [ObservableProperty] private string openingStock = "";
    [ObservableProperty] private string minStock = "";
    [ObservableProperty] private string status = "";

    public ItemFormViewModel(BillingService billing) => _billing = billing;

    [RelayCommand]
    private async Task Save() { if (await SaveInternal()) await Shell.Current.GoToAsync(".."); }

    [RelayCommand]
    private async Task SaveAndNew()
    {
        if (await SaveInternal())
        {
            Name = SalePrice = PurchasePrice = WholesalePrice = Category = HsnSac = OpeningStock = MinStock = "";
            Status = "✅ Saved! Add the next item.";
        }
    }

    private async Task<bool> SaveInternal()
    {
        if (string.IsNullOrWhiteSpace(Name)) { Status = "⚠️ Item name is required."; return false; }
        if (!string.IsNullOrWhiteSpace(WholesalePrice) && !ProfileService.Instance.IsGold)
        {
            Status = "👑 Wholesale price is a Gold feature — enable Gold in My Account.";
            return false;
        }

        await _billing.SaveItemAsync(new CatalogItem
        {
            Name = Name.Trim(),
            Type = Type,
            SalePrice = double.TryParse(SalePrice, out var sp) ? sp : 0,
            PurchasePrice = double.TryParse(PurchasePrice, out var pp) ? pp : 0,
            WholesalePrice = double.TryParse(WholesalePrice, out var wp) ? wp : 0,
            Unit = Unit,
            Category = Category.Trim(),
            HsnSac = HsnSac.Trim(),
            TaxRate = double.TryParse(TaxRate, out var tr) ? tr : 0,
            StockQty = double.TryParse(OpeningStock, out var st) ? st : 0,
            MinStock = double.TryParse(MinStock, out var ms) ? ms : 0
        });
        return true;
    }
}
