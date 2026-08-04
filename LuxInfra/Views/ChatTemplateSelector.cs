using LuxInfra.Models;

namespace LuxInfra.Views;

public class ChatTemplateSelector : DataTemplateSelector
{
    public DataTemplate? UserTemplate { get; set; }
    public DataTemplate? BotTemplate { get; set; }
    public DataTemplate? ReportTemplate { get; set; }

    protected override DataTemplate OnSelectTemplate(object item, BindableObject container)
    {
        var m = item as ChatMessage;
        if (m?.IsReport == true) return ReportTemplate!;
        return (m?.IsUser == true ? UserTemplate : BotTemplate)!;
    }
}
