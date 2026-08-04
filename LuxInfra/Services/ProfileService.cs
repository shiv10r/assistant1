using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;

namespace LuxInfra.Services;

/// <summary>
/// Local user profile — everything lives in Preferences on the device.
/// Singleton so the flyout header, chat header and profile page stay in sync.
/// </summary>
public partial class ProfileService : ObservableObject
{
    public static ProfileService Instance { get; } = new();

    private ProfileService()
    {
        name = Preferences.Get("profile_name", "Shivanshu Rai");
        email = Preferences.Get("profile_email", EmailService.DefaultRecipient);
        phone = Preferences.Get("profile_phone", "");
        address = Preferences.Get("profile_address", "");
        foodPref = Preferences.Get("profile_food", "🥗 Veg");
        isGold = Preferences.Get("profile_gold", false);
        donationTotal = Preferences.Get("profile_donation", 0.0);

        var saved = Preferences.Get("profile_payments", "");
        foreach (var m in saved.Split('|', StringSplitOptions.RemoveEmptyEntries))
            PaymentMethods.Add(m);
    }

    [ObservableProperty] private string name;
    [ObservableProperty] private string email;
    [ObservableProperty] private string phone;
    [ObservableProperty] private string address;
    [ObservableProperty] private string foodPref;
    [ObservableProperty] private bool isGold;
    [ObservableProperty] private double donationTotal;

    public ObservableCollection<string> PaymentMethods { get; } = new();

    public string Initials
    {
        get
        {
            var parts = (Name ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length switch
            {
                0 => "🙂",
                1 => parts[0][..1].ToUpper(),
                _ => $"{parts[0][0]}{parts[^1][0]}".ToUpper()
            };
        }
    }

    public string MemberSince => Preferences.Get("profile_gold_since", "");
    public string DonationLabel => ReportService.Money(DonationTotal);

    /// <summary>Free | Silver | Gold — Gold drives IsGold (crown + premium features).</summary>
    public string Plan
    {
        get => Preferences.Get("profile_plan", IsGold ? "Gold" : "Free");
        set
        {
            Preferences.Set("profile_plan", value);
            IsGold = value == "Gold";
            OnPropertyChanged(nameof(Plan));
        }
    }

    partial void OnNameChanged(string value)
    {
        Preferences.Set("profile_name", value);
        OnPropertyChanged(nameof(Initials));
    }

    partial void OnEmailChanged(string value)
    {
        Preferences.Set("profile_email", value);
        EmailService.Recipient = value;
    }

    partial void OnPhoneChanged(string value) => Preferences.Set("profile_phone", value);
    partial void OnAddressChanged(string value) => Preferences.Set("profile_address", value);
    partial void OnFoodPrefChanged(string value) => Preferences.Set("profile_food", value);

    partial void OnIsGoldChanged(bool value)
    {
        Preferences.Set("profile_gold", value);
        if (value && string.IsNullOrEmpty(Preferences.Get("profile_gold_since", "")))
            Preferences.Set("profile_gold_since", DateTime.Today.ToString("MMM yyyy"));
        OnPropertyChanged(nameof(MemberSince));
    }

    partial void OnDonationTotalChanged(double value)
    {
        Preferences.Set("profile_donation", value);
        OnPropertyChanged(nameof(DonationLabel));
    }

    public void SavePayments() =>
        Preferences.Set("profile_payments", string.Join('|', PaymentMethods));

    public void Logout()
    {
        foreach (var key in new[] { "profile_name", "profile_email", "profile_phone", "profile_address",
                                    "profile_food", "profile_gold", "profile_gold_since", "profile_payments" })
            Preferences.Remove(key);

        Name = "Guest";
        Email = EmailService.DefaultRecipient;
        Phone = "";
        Address = "";
        FoodPref = "🥗 Veg";
        IsGold = false;
        PaymentMethods.Clear();
    }
}
