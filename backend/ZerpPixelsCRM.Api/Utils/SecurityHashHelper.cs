using System.Security.Cryptography;
using System.Text;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Utils;

public static class SecurityHashHelper
{
    private const string FallbackSecret = "ZeroPixel_Default_Integrity_Secret_2026";

    public static string ComputeSha256(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var normalized = input.Trim().ToUpperInvariant();
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public static string ComputeHmacSha256(string payload, string? secretKey = null)
    {
        var key = string.IsNullOrWhiteSpace(secretKey) ? FallbackSecret : secretKey;
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public static string ComputeSupplierPaymentIntegrityHash(SupplierPayment payment, string? secretKey = null)
    {
        var payload = string.Join("|",
            "PAY",
            payment.PaymentNumber,
            payment.SupplierId,
            payment.SupplierBillId,
            payment.Amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture),
            payment.PaymentDate.ToUniversalTime().ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
            payment.Status);

        return ComputeHmacSha256(payload, secretKey);
    }

    public static bool VerifySupplierPaymentIntegrity(SupplierPayment payment, string? secretKey = null)
    {
        if (string.IsNullOrWhiteSpace(payment.RecordIntegrityHash))
            return false;

        var expected = ComputeSupplierPaymentIntegrityHash(payment, secretKey);
        var actualBytes = Encoding.UTF8.GetBytes(payment.RecordIntegrityHash);
        var expectedBytes = Encoding.UTF8.GetBytes(expected);

        return actualBytes.Length == expectedBytes.Length &&
               CryptographicOperations.FixedTimeEquals(actualBytes, expectedBytes);
    }
}
