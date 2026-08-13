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
        @"(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)\s*(k|l|lakh|lac|cr|crore)?\b",
        RegexOptions.IgnoreCase);

    private static readonly Regex SiteRegex = new(
        @"\b(?:site|project|location)\s*([a-z0-9]+)", RegexOptions.IgnoreCase);

    private static readonly Regex ClientRegex = new(
        @"\bclient\s+([a-z0-9]+)", RegexOptions.IgnoreCase);

    private static readonly string[] NoiseWords =
        { "exp", "expe", "expense", "expenses", "spent", "spend", "logged", "log", "add", "added",
          "bought", "purchase", "purchased", "paid", "cost", "for", "on", "of", "at", "in", "just",
          "today", "rs", "inr", "k", "lakh", "lac", "crore", "thousand", "hundred" };

    private static readonly Dictionary<string, double> WordNumbers = new()
    {
        ["zero"] = 0, ["one"] = 1, ["two"] = 2, ["three"] = 3, ["four"] = 4, ["five"] = 5,
        ["six"] = 6, ["seven"] = 7, ["eight"] = 8, ["nine"] = 9, ["ten"] = 10,
        ["eleven"] = 11, ["twelve"] = 12, ["thirteen"] = 13, ["fourteen"] = 14, ["fifteen"] = 15,
        ["sixteen"] = 16, ["seventeen"] = 17, ["eighteen"] = 18, ["nineteen"] = 19,
        ["twenty"] = 20, ["thirty"] = 30, ["forty"] = 40, ["fifty"] = 50, ["sixty"] = 60,
        ["seventy"] = 70, ["eighty"] = 80, ["ninety"] = 90,
        ["hundred"] = 100, ["thousand"] = 1000, ["lakh"] = 100_000, ["lac"] = 100_000,
        ["crore"] = 10_000_000, ["k"] = 1000, ["l"] = 100_000, ["cr"] = 10_000_000,
    };

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

        // ---- Expense parsing: grab the LAST number (amount usually comes last) ----
        double? amount = null;
        string? body = null;
        var best = (Match?)null;
        foreach (Match m in AmountRegex.Matches(text))
            if (m.Groups[1].Success) best = m;

        if (best is not null &&
            double.TryParse(best.Groups[1].Value.Replace(",", ""), NumberStyles.Any,
                CultureInfo.InvariantCulture, out var parsed))
        {
            var suffix = best.Groups[2].Value.ToLowerInvariant();
            amount = parsed * (suffix switch
            {
                "k" => 1_000,
                "l" or "lakh" or "lac" => 100_000,
                "cr" or "crore" => 10_000_000,
                _ => 1
            });
            body = text.Remove(best.Index, best.Length);
        }

        // Rectify: no digits but words like "five thousand" / "two lakh"
        if (amount is null)
        {
            var (wordAmount, consumed) = WordsToAmount(lower);
            if (wordAmount is not null)
            {
                amount = wordAmount;
                var parts = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                body = string.Join(' ', parts.Where(w => !consumed.Contains(w.ToLowerInvariant())));
            }
        }

        if (amount is null)
            return new ParseResult { Kind = ParseKind.Unknown };

        var entry = new ExpenseEntry
        {
            Amount = amount.Value,
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

        // no explicit "site X" keyword → first meaningful word is treated as the site name
        if (!siteMatch.Success)
        {
            var words = body.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var idx = 0;
            while (idx < words.Length && NoiseWords.Contains(words[idx].ToLowerInvariant())) idx++;
            if (words.Length - idx >= 2)
            {
                entry.Site = ToTitle(words[idx]);
                body = string.Join(' ', words.Skip(idx + 1));
            }
        }

        var categoryWords = body
            .Split(new[] { ' ', ',', '.', '-', '=', ':', '@' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => !NoiseWords.Contains(w.ToLowerInvariant()))
            .ToArray();

        var cat = CategoryClassifier.Normalize(string.Join(' ', categoryWords));
        entry.Category = string.IsNullOrWhiteSpace(cat) ? "Expense" : cat;

        return new ParseResult { Kind = ParseKind.Expense, Entry = entry };
    }

    private static (double?, HashSet<string>) WordsToAmount(string lower)
    {
        var words = lower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        double? best = null;
        var bestLen = 0;
        HashSet<string>? bestConsumed = null;

        for (var i = 0; i < words.Length; i++)
        {
            if (!WordNumbers.ContainsKey(words[i])) continue;

            double total = 0, num = 0;
            var len = 0;
            for (var j = i; j < words.Length; j++)
            {
                if (!WordNumbers.TryGetValue(words[j], out var val)) break;
                len++;
                if (val == 100) num = (num == 0 ? 1 : num) * 100;
                else if (val >= 1000) { num = (num == 0 ? 1 : num) * val; total += num; num = 0; }
                else num += val;
            }
            total += num;

            if (len > bestLen || (len == bestLen && total > (best ?? 0)))
            {
                best = total;
                bestLen = len;
                bestConsumed = new HashSet<string>(words.Skip(i).Take(len).Select(w => w.ToLowerInvariant()));
            }
            if (len > 0) i += len - 1;
        }

        return (best, bestConsumed ?? new HashSet<string>());
    }

    private static string ToTitle(string s) =>
        CultureInfo.InvariantCulture.TextInfo.ToTitleCase(s.ToLowerInvariant());
}
