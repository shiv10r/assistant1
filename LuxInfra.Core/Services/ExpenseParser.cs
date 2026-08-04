using System.Globalization;
using System.Text.RegularExpressions;
using LuxInfra.Models;

namespace LuxInfra.Services;

public enum ParseKind
{
    Expense,
    Summary,      // show today's structured report in-app
    Total,
    SiteTotal,
    SendReport,   // email the report
    Undo,
    Help,
    Unknown
}

public class ParseResult
{
    public ParseKind Kind { get; set; } = ParseKind.Unknown;
    public ExpenseEntry? Entry { get; set; }
    public string? SiteQuery { get; set; }
}

public static class ExpenseParser
{
    private static readonly Regex AmountRegex = new(
        @"(?:=|-|:)?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)\s*(k|l|lakh|lac|cr|crore)?\s*$",
        RegexOptions.IgnoreCase);

    private static readonly Regex SiteRegex = new(
        @"\b(?:site|project|location)\s+([a-z0-9]+)", RegexOptions.IgnoreCase);

    private static readonly Regex ClientRegex = new(
        @"\bclient\s+([a-z0-9]+)", RegexOptions.IgnoreCase);

    private static readonly string[] NoiseWords =
        { "exp", "expe", "expense", "expenses", "spent", "spend", "paid", "cost", "for", "on", "of", "rs", "inr" };

    public static ParseResult Parse(string input)
    {
        var text = input.Trim();
        var lower = text.ToLowerInvariant();

        if (Regex.IsMatch(lower, @"^(hi|hello|hey|yo)\b"))
            return new ParseResult { Kind = ParseKind.Help };
        if (Regex.IsMatch(lower, @"^(help|\?|what can you do)"))
            return new ParseResult { Kind = ParseKind.Help };

        // explicit email / mail keywords → send by email
        if (Regex.IsMatch(lower, @"\b(email|mail)\b") && lower.Contains("report"))
            return new ParseResult { Kind = ParseKind.SendReport };
        if (Regex.IsMatch(lower, @"^(email|mail)\b"))
            return new ParseResult { Kind = ParseKind.SendReport };

        // "show report", "send me complete report now", "full report", "summary", ...
        if (Regex.IsMatch(lower, @"^(summary|report|today)\b") ||
            (lower.Contains("report") && Regex.IsMatch(lower, @"\b(show|open|view|see|give|send|complete|full|now)\b")))
            return new ParseResult { Kind = ParseKind.Summary };

        if (Regex.IsMatch(lower, @"^(undo|delete last|remove last)\b"))
            return new ParseResult { Kind = ParseKind.Undo };

        var totalMatch = Regex.Match(lower, @"^total\s*(?:for\s+)?(?:site\s+)?([a-z0-9]+)?");
        if (totalMatch.Success && lower.StartsWith("total"))
        {
            var siteQ = totalMatch.Groups[1].Success ? totalMatch.Groups[1].Value : null;
            return siteQ is null
                ? new ParseResult { Kind = ParseKind.Total }
                : new ParseResult { Kind = ParseKind.SiteTotal, SiteQuery = ToTitle(siteQ) };
        }

        // ---- Expense parsing ----
        var amountMatch = AmountRegex.Match(text);
        if (!amountMatch.Success)
            return new ParseResult { Kind = ParseKind.Unknown };

        var numberPart = amountMatch.Groups[1].Value.Replace(",", "");
        if (!double.TryParse(numberPart, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
            return new ParseResult { Kind = ParseKind.Unknown };

        var suffix = amountMatch.Groups[2].Value.ToLowerInvariant();
        amount *= suffix switch
        {
            "k" => 1_000,
            "l" or "lakh" or "lac" => 100_000,
            "cr" or "crore" => 10_000_000,
            _ => 1
        };

        var body = text[..amountMatch.Index].Trim();

        var entry = new ExpenseEntry
        {
            Amount = amount,
            Date = DateTime.Now,
            RawText = input.Trim()
        };

        var siteMatch = SiteRegex.Match(body);
        if (siteMatch.Success)
        {
            entry.Site = "Site " + ToTitle(siteMatch.Groups[1].Value);
            body = body.Remove(siteMatch.Index, siteMatch.Length).Trim();
        }

        var clientMatch = ClientRegex.Match(body);
        if (clientMatch.Success)
        {
            entry.Client = ToTitle(clientMatch.Groups[1].Value);
            body = body.Remove(clientMatch.Index, clientMatch.Length).Trim();
        }

        // no explicit "site X" keyword → first word is treated as the site name
        if (!siteMatch.Success)
        {
            var words = body.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length > 1)
            {
                entry.Site = ToTitle(words[0]);
                body = string.Join(' ', words.Skip(1));
            }
        }

        var categoryWords = body
            .Split(new[] { ' ', ',', '.', '-', '=', ':' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => !NoiseWords.Contains(w.ToLowerInvariant()))
            .ToArray();

        entry.Category = CategoryClassifier.Normalize(string.Join(' ', categoryWords));

        return new ParseResult { Kind = ParseKind.Expense, Entry = entry };
    }

    private static string ToTitle(string s) =>
        CultureInfo.InvariantCulture.TextInfo.ToTitleCase(s.ToLowerInvariant());
}
