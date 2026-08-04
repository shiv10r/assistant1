using System.Globalization;

namespace LuxInfra.Services;

/// <summary>
/// Normalizes free-text categories ("paint", "painting", "putty") into
/// canonical interior-design expense buckets so reports group cleanly.
/// </summary>
public static class CategoryClassifier
{
    private static readonly (string Canonical, string[] Keywords)[] Map =
    {
        ("Paint",             new[] { "paint", "painting", "primer", "putty", "polish", "texture" }),
        ("Tiles & Flooring",  new[] { "tile", "tiles", "marble", "granite", "flooring", "floor", "vitrified" }),
        ("Glass & Mirror",    new[] { "glass", "mirror", "toughened" }),
        ("Labour",            new[] { "labour", "labor", "wages", "worker", "workers", "mason", "karigar", "helper" }),
        ("Electrical",        new[] { "electric", "electrical", "wiring", "wire", "wires", "switch", "switches", "light", "lights", "led", "fan" }),
        ("Plumbing",          new[] { "plumb", "plumbing", "plumber", "pipe", "pipes", "sanitary", "tap", "taps", "bathroom" }),
        ("Wood & Carpentry",  new[] { "wood", "plywood", "ply", "carpenter", "carpentry", "laminate", "veneer", "mdf", "hdf" }),
        ("Civil Material",    new[] { "cement", "sand", "concrete", "brick", "bricks", "aggregate", "pop", "gypsum" }),
        ("Steel",             new[] { "steel", "iron", "rod", "rods" }),
        ("Furniture",         new[] { "sofa", "furniture", "chair", "chairs", "table", "bed", "wardrobe", "cabinet" }),
        ("Furnishing",        new[] { "curtain", "curtains", "fabric", "upholstery", "cushion", "carpet", "wallpaper", "blinds" }),
        ("Hardware",          new[] { "hardware", "screw", "screws", "fitting", "fittings", "handle", "handles", "hinge", "hinges", "lock", "rubber", "adhesive", "fevicol" }),
        ("Equipment",         new[] { "crane", "equipment", "machine", "machinery", "rental", "scaffolding", "drill" }),
        ("Transport",         new[] { "transport", "travel", "fuel", "diesel", "petrol", "cartage", "freight", "tempo", "truck" }),
        ("Food & Pantry",     new[] { "food", "pantry", "tea", "chai", "lunch", "snacks", "water" }),
    };

    public static string Normalize(string rawCategory)
    {
        if (string.IsNullOrWhiteSpace(rawCategory))
            return "Misc";

        var words = rawCategory.ToLowerInvariant()
            .Split(new[] { ' ', ',', '&', '/', '-' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var (canonical, keywords) in Map)
            if (words.Any(w => keywords.Contains(w)))
                return canonical;

        return CultureInfo.InvariantCulture.TextInfo.ToTitleCase(rawCategory.ToLowerInvariant());
    }
}
