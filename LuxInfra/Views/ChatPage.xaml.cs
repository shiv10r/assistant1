using LuxInfra.ViewModels;

namespace LuxInfra.Views;

public partial class ChatPage : ContentPage
{
    public ChatPage(ChatViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
        vm.StartAutoSendWatcher(Dispatcher);
    }
}
