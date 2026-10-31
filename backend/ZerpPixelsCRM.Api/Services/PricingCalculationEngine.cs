namespace ZerpPixelsCRM.Api.Services;

public record PricingResult(
    decimal Subtotal,
    decimal DiscountAmount,
    decimal TaxableAmount,
    decimal TaxAmount,
    decimal GrandTotal
);

public static class PricingCalculationEngine
{
    public static decimal CalculateLineTotal(decimal quantity, decimal unitPrice)
    {
        if (quantity <= 0 || unitPrice <= 0) return 0m;
        return Math.Round(quantity * unitPrice, 2, MidpointRounding.AwayFromZero);
    }

    public static PricingResult CalculateTotals(
        IEnumerable<(decimal Quantity, decimal UnitPrice)> items,
        string discountType,
        decimal discountValue,
        decimal taxRate)
    {
        decimal subtotal = 0m;
        foreach (var item in items)
        {
            subtotal += CalculateLineTotal(item.Quantity, item.UnitPrice);
        }

        decimal discountAmount = 0m;
        if (string.Equals(discountType, "Percentage", StringComparison.OrdinalIgnoreCase))
        {
            if (discountValue > 0)
            {
                discountAmount = Math.Round(subtotal * (discountValue / 100m), 2, MidpointRounding.AwayFromZero);
            }
        }
        else if (string.Equals(discountType, "Fixed", StringComparison.OrdinalIgnoreCase))
        {
            discountAmount = Math.Max(0m, Math.Round(discountValue, 2, MidpointRounding.AwayFromZero));
        }

        // Prevent discount exceeding subtotal
        if (discountAmount > subtotal)
        {
            discountAmount = subtotal;
        }

        decimal taxableAmount = Math.Max(0m, subtotal - discountAmount);

        decimal taxAmount = 0m;
        if (taxRate > 0)
        {
            taxAmount = Math.Round(taxableAmount * (taxRate / 100m), 2, MidpointRounding.AwayFromZero);
        }

        decimal grandTotal = Math.Round(taxableAmount + taxAmount, 2, MidpointRounding.AwayFromZero);

        return new PricingResult(subtotal, discountAmount, taxableAmount, taxAmount, grandTotal);
    }
}

