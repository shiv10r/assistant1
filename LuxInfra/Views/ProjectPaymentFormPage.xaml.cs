using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
[QueryProperty(nameof(Type), "type")]
public partial class ProjectPaymentFormPage : ContentPage
{
    private readonly ProjectPaymentFormViewModel _vm;

    public int ProjectId { set => _vm.ProjectId = value; }
    public string Type { set => _vm.SetType(value); }

    public ProjectPaymentFormPage(ProjectPaymentFormViewModel vm)
    {
        InitializeComponent();
        BindingContext = _vm = vm;
    }
}
