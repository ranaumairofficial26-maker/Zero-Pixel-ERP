using QuestPDF.Infrastructure;
using Xunit;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Services;

namespace ZerpPixelsCRM.Tests;

public class QuotationPdfServiceTests
{
    private readonly QuotationPdfService _pdfService = new();

    [Fact]
    public void GenerateQuotationPdf_DraftQuotation_GeneratesValidPdfBytes()
    {
        // Arrange
        var quotation = new Quotation
        {
            QuotationId = 1,
            QuotationNumber = "QT-20261030-0001",
            QuotationType = "PrintOnly",
            Currency = "PKR",
            CustomerName = "Crown Group",
            ContactPerson = "Naveed Ahmad",
            CustomerPhone = "+92 300 1234567",
            CustomerEmail = "naveed@crowngroup.pk",
            CustomerAddress = "Industrial Area, Lahore",
            CreatedAt = DateTime.UtcNow
        };

        var revision = new QuotationRevision
        {
            RevisionId = 1,
            QuotationId = 1,
            RevisionNumber = 1,
            QuotationDate = DateTime.UtcNow,
            ValidUntil = DateTime.UtcNow.AddDays(15),
            Status = "Draft",
            Subtotal = 150000m,
            DiscountType = "Percentage",
            DiscountValue = 5m,
            DiscountAmount = 7500m,
            TaxRate = 16m,
            TaxAmount = 22800m,
            GrandTotal = 165300m,
            CustomerNotes = "Deliver to warehouse #2.",
            TermsAndConditions = "Payment within 15 days of invoice.",
            Items = new List<QuotationItem>
            {
                new QuotationItem
                {
                    ItemId = 1,
                    RevisionId = 1,
                    ProductName = "Flyer A4 - Offset Print",
                    Description = "Full color flyer on 150gsm gloss art paper",
                    SizeDimensions = "A4 (210x297mm)",
                    Material = "Gloss Art Paper",
                    Gsm = "150",
                    PrintingColor = "4/4 (CMYK Both Sides)",
                    Finishing = "Gloss UV Varnish",
                    Quantity = 5000,
                    Unit = "pcs",
                    UnitPrice = 30m,
                    LineTotal = 150000m,
                    SortOrder = 1
                }
            }
        };

        // Act
        var pdfBytes = _pdfService.GenerateQuotationPdf(quotation, revision);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.NotEmpty(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "PDF size should be substantial");
        
        // Check PDF header signature: %PDF-
        var header = System.Text.Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray());
        Assert.Equal("%PDF-", header);
    }

    [Fact]
    public void GenerateQuotationPdf_FinalizedQuotation_GeneratesValidPdfBytes()
    {
        // Arrange
        var quotation = new Quotation
        {
            QuotationId = 2,
            QuotationNumber = "QT-20261030-0002",
            QuotationType = "PrintAndDesign",
            Currency = "PKR",
            CustomerName = "Apex Solutions",
            ContactPerson = "Ali Raza",
            CustomerPhone = "+92 321 9876543",
            CustomerEmail = "ali@apex.pk",
            CustomerAddress = "Gulberg III, Lahore",
            CreatedAt = DateTime.UtcNow
        };

        var revision = new QuotationRevision
        {
            RevisionId = 2,
            QuotationId = 2,
            RevisionNumber = 1,
            QuotationDate = DateTime.UtcNow,
            ValidUntil = DateTime.UtcNow.AddDays(30),
            Status = "Finalized",
            Subtotal = 45000m,
            DiscountType = "None",
            DiscountValue = 0m,
            DiscountAmount = 0m,
            TaxRate = 0m,
            TaxAmount = 0m,
            GrandTotal = 45000m,
            Items = new List<QuotationItem>
            {
                new QuotationItem
                {
                    ItemId = 2,
                    RevisionId = 2,
                    ProductName = "Business Cards - Matte Finish",
                    Description = "350gsm art card with matte lamination",
                    SizeDimensions = "3.5 x 2.0 inches",
                    Material = "Art Card",
                    Gsm = "350",
                    PrintingColor = "4/4 Color",
                    Finishing = "Matte Lamination",
                    Quantity = 1000,
                    Unit = "cards",
                    UnitPrice = 45m,
                    LineTotal = 45000m,
                    SortOrder = 1
                }
            }
        };

        // Act
        var pdfBytes = _pdfService.GenerateQuotationPdf(quotation, revision);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000);
        var header = System.Text.Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray());
        Assert.Equal("%PDF-", header);
    }
}
