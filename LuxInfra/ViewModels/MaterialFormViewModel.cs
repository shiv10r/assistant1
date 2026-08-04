using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LuxInfra.Models;
using LuxInfra.Services;

namespace LuxInfra.ViewModels;

/// <summary>Shared form for Material Request / Received / Delivered — only the kind differs.</summary>
public partial class MaterialFormViewModel : ObservableObject
{
    private readonly ProjectService _svc;
    public int ProjectId { get; set; }
    private string _kind = MaterialTxnKinds.Request;

    public List<string> PaymentModes { get; } = new() { "Cash", "Bank Transfer", "Cheque" };

    [ObservableProperty] private string title = "Material Request";
    [ObservableProperty] private string materialName = "";
    [ObservableProperty] private string quantity = "";
    [ObservableProperty] private string unit = "Pcs";
    [ObservableProperty] private string vendorName = "";
    [ObservableProperty] private string vendorLocation = "";
    [ObservableProperty] private string paymentMode = "Cash";
    [ObservableProperty] private string amount = "";
    [ObservableProperty] private DateTime date = DateTime.Today;
    [ObservableProperty] private string status = "";

    public MaterialFormViewModel(ProjectService svc) => _svc = svc;

    public void SetKind(string kind)
    {
        _kind = kind;
        Title = $"Material {kind}";
    }

    [RelayCommand]
    private async Task Save()
    {
        if (string.IsNullOrWhiteSpace(MaterialName)) { Status = "⚠️ Material name is required."; return; }
        if (!double.TryParse(Quantity, out var qty) || qty <= 0) { Status = "⚠️ Enter a valid quantity."; return; }

        await _svc.SaveMaterialTxnAsync(new MaterialTxn
        {
            ProjectId = ProjectId,
            Kind = _kind,
            MaterialName = MaterialName.Trim(),
            Quantity = qty,
            Unit = Unit.Trim(),
            VendorName = VendorName.Trim(),
            VendorLocation = VendorLocation.Trim(),
            PaymentMode = PaymentMode,
            Amount = double.TryParse(Amount, out var a) ? a : 0,
            Date = Date
        });
        await Shell.Current.GoToAsync("..");
    }
}
