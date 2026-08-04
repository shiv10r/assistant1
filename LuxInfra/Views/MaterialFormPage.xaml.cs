using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
[QueryProperty(nameof(Kind), "kind")]
public partial class MaterialFormPage : ContentPage
{
    private readonly MaterialFormViewModel _vm;

    public int ProjectId { set => _vm.ProjectId = value; }
    public string Kind { set => _vm.SetKind(value); }

    public MaterialFormPage(MaterialFormViewModel vm)
    {
        InitializeComponent();
        BindingContext = _vm = vm;
    }
}
