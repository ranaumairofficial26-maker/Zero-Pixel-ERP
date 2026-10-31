using System.Text.RegularExpressions;

namespace ZerpPixelsCRM.Api.Services;

public static class PhoneNormalizer
{
    public static string Normalize(string? rawPhone)
    {
        if (string.IsNullOrWhiteSpace(rawPhone))
            return string.Empty;

        // Remove all whitespace, hyphens, parentheses, dots
        var digitsOnly = Regex.Replace(rawPhone.Trim(), @"[^\d]", "");

        // Pakistani phone normalization:
        // +923001234567 -> 923001234567 (12 digits)
        // 03001234567 -> 11 digits
        // 3001234567 -> 10 digits
        if (digitsOnly.StartsWith("92") && digitsOnly.Length == 12 && digitsOnly[2] == '3')
        {
            return "0" + digitsOnly.Substring(2); // Convert to standard 03XXXXXXXXX
        }
        else if (digitsOnly.StartsWith("0092") && digitsOnly.Length == 14 && digitsOnly[4] == '3')
        {
            return "0" + digitsOnly.Substring(4);
        }
        else if (digitsOnly.StartsWith("3") && digitsOnly.Length == 10)
        {
            return "0" + digitsOnly;
        }
        else if (digitsOnly.StartsWith("03") && digitsOnly.Length == 11)
        {
            return digitsOnly;
        }

        return digitsOnly;
    }

    public static bool AreNumbersEqual(string phone1, string phone2)
    {
        var norm1 = Normalize(phone1);
        var norm2 = Normalize(phone2);

        if (string.IsNullOrEmpty(norm1) || string.IsNullOrEmpty(norm2))
            return false;

        return string.Equals(norm1, norm2, StringComparison.OrdinalIgnoreCase);
    }
}

