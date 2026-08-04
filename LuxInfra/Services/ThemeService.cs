namespace LuxInfra.Services;

/// <summary>
/// Applies one of the LuxInfra themes by overwriting the app-level dynamic
/// color resources. Includes color-blind friendly palettes (protan / deutan /
/// tritan) where the accent hues stay distinguishable.
/// </summary>
public static class ThemeService
{
    public static readonly string[] Themes = { "Dark", "Light", "Protan", "Deutan", "Tritan" };

    public static string Current => Preferences.Get("app_theme", "Dark");

    private record Palette(
        string Bg, string Surface, string Surface2,
        string Primary, string PrimarySoft, string Accent, string Pink,
        string Text, string TextDim,
        string Grad1, string Grad2, string Grad3,
        string Success, string SuccessSurface, string DangerSurface, string Fab, string OverlayText);

    private static readonly Dictionary<string, Palette> Palettes = new()
    {
        ["Dark"] = new("#0F0F1A", "#1C1C2E", "#26263C",
                       "#7C4DFF", "#B39DFF", "#00E5C3", "#FF5C8A",
                       "#F2F2F7", "#9A9AB0",
                       "#7C4DFF", "#00B8D9", "#00E5C3",
                       "#37B24D", "#1D6F42", "#8B1E3F", "#E5484D", "#CCFFFFFF"),

        ["Light"] = new("#F2F2F8", "#FFFFFF", "#E6E6F0",
                        "#6A3FF5", "#5B34D6", "#008F7A", "#D6336C",
                        "#1A1A2E", "#6A6A80",
                        "#6A3FF5", "#00A3C4", "#00BFA5",
                        "#2F9E44", "#2F9E44", "#C92A2A", "#E03131", "#CCFFFFFF"),

        // red-green blindness (protanopia): lean on blue + amber
        ["Protan"] = new("#0F1220", "#1B2033", "#252C44",
                         "#2C6BED", "#8FB3FF", "#FFC53D", "#B197FC",
                         "#F2F2F7", "#9AA3B8",
                         "#2C6BED", "#4DABF7", "#FFC53D",
                         "#FFC53D", "#1B4F91", "#5C3D91", "#2C6BED", "#CCFFFFFF"),

        // red-green blindness (deuteranopia): blue + yellow
        ["Deutan"] = new("#101322", "#1C2136", "#272E48",
                         "#3B5BDB", "#91A7FF", "#F5D90A", "#9775FA",
                         "#F2F2F7", "#9AA3B8",
                         "#3B5BDB", "#5C7CFA", "#F5D90A",
                         "#F5D90A", "#2140A3", "#5F3DC4", "#3B5BDB", "#CCFFFFFF"),

        // blue-yellow blindness (tritanopia): crimson + green
        ["Tritan"] = new("#161018", "#241A28", "#302336",
                         "#C2255C", "#F783AC", "#37B24D", "#E8590C",
                         "#F7F2F4", "#B0A0AA",
                         "#C2255C", "#E64980", "#37B24D",
                         "#37B24D", "#1D6F42", "#A61E4D", "#C2255C", "#CCFFFFFF"),
    };

    public static void Apply(string theme)
    {
        if (!Palettes.TryGetValue(theme, out var p))
            p = Palettes["Dark"];

        Preferences.Set("app_theme", theme);

        var res = Application.Current!.Resources;
        res["LuxBg"] = Color.FromArgb(p.Bg);
        res["LuxSurface"] = Color.FromArgb(p.Surface);
        res["LuxSurface2"] = Color.FromArgb(p.Surface2);
        res["LuxPrimary"] = Color.FromArgb(p.Primary);
        res["LuxPrimarySoft"] = Color.FromArgb(p.PrimarySoft);
        res["LuxAccent"] = Color.FromArgb(p.Accent);
        res["LuxPink"] = Color.FromArgb(p.Pink);
        res["LuxText"] = Color.FromArgb(p.Text);
        res["LuxTextDim"] = Color.FromArgb(p.TextDim);
        res["LuxSuccess"] = Color.FromArgb(p.Success);
        res["LuxSuccessSurface"] = Color.FromArgb(p.SuccessSurface);
        res["LuxDangerSurface"] = Color.FromArgb(p.DangerSurface);
        res["LuxFab"] = Color.FromArgb(p.Fab);
        res["LuxOverlayText"] = Color.FromArgb(p.OverlayText);
        res["LuxGradient"] = new LinearGradientBrush(
            new GradientStopCollection
            {
                new GradientStop(Color.FromArgb(p.Grad1), 0.0f),
                new GradientStop(Color.FromArgb(p.Grad2), 0.6f),
                new GradientStop(Color.FromArgb(p.Grad3), 1.0f),
            },
            new Point(0, 0), new Point(1, 1));
    }
}
