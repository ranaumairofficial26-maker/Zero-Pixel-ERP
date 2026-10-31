using Xunit;
using ZerpPixelsCRM.Api.Services;

namespace ZerpPixelsCRM.Tests;

public class PricingCalculationEngineTests
{
    [Fact]
    public void CalculateLineTotal_CorrectlyCalculatesQuantityTimesPrice()
    {
        // 2000 brochures @ 45 PKR
        var total = PricingCalculationEngine.CalculateLineTotal(2000, 45);
        Assert.Equal(90000m, total);
    }

    [Fact]
    public void CalculateTotals_WithPercentageDiscountAndTax_CalculatesAccurately()
    {
        // Item 1: 2000 * 45 = 90000
        // Item 2: 1000 * 12 = 12000
        // Subtotal = 102000
        // Discount 10% = 10200
        // Taxable = 91800
        // Tax 16% = 14688
        // GrandTotal = 106488
        var items = new List<(decimal Quantity, decimal UnitPrice)>
        {
            (2000m, 45m),
            (1000m, 12m)
        };

        var result = PricingCalculationEngine.CalculateTotals(items, "Percentage", 10m, 16m);

        Assert.Equal(102000m, result.Subtotal);
        Assert.Equal(10200m, result.DiscountAmount);
        Assert.Equal(91800m, result.TaxableAmount);
        Assert.Equal(14688m, result.TaxAmount);
        Assert.Equal(106488m, result.GrandTotal);
    }

    [Fact]
    public void CalculateTotals_FixedDiscountExceedingSubtotal_CappedAtSubtotal()
    {
        var items = new List<(decimal Quantity, decimal UnitPrice)>
        {
            (10m, 100m) // Subtotal = 1000
        };

        var result = PricingCalculationEngine.CalculateTotals(items, "Fixed", 1500m, 0m);

        Assert.Equal(1000m, result.Subtotal);
        Assert.Equal(1000m, result.DiscountAmount);
        Assert.Equal(0m, result.TaxableAmount);
        Assert.Equal(0m, result.GrandTotal);
    }

    [Fact]
    public void CalculateTotals_NoDiscountNoTax_GrandTotalEqualsSubtotal()
    {
        var items = new List<(decimal Quantity, decimal UnitPrice)>
        {
            (500m, 20m) // Subtotal = 10000
        };

        var result = PricingCalculationEngine.CalculateTotals(items, "None", 0m, 0m);

        Assert.Equal(10000m, result.Subtotal);
        Assert.Equal(0m, result.DiscountAmount);
        Assert.Equal(10000m, result.GrandTotal);
    }
}

