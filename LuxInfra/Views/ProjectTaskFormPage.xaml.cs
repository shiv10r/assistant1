using LuxInfra.ViewModels;

namespace LuxInfra.Views;

[QueryProperty(nameof(ProjectId), "projectId")]
public partial class ProjectTaskFormPage : ContentPage
{
    private readonly ProjectTaskFormViewModel _vm;

    public int ProjectId { set => _vm.ProjectId = value; }

    public ProjectTaskFormPage(ProjectTaskFormViewModel vm)
    {
        InitializeComponent();
        BindingContext = _vm = vm;
    }
}
