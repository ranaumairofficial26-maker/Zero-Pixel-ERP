using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Implementations;
using ZerpPixelsCRM.Api.Services;

namespace ZerpPixelsCRM.Tests;

public class ProductionAndOrderIntegrationTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateOrderFromRevision_Throws_WhenRevisionNotApproved()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);
        var orderService = new PrintingOrderService(uow, NullLogger<PrintingOrderService>.Instance);

        // Seed a draft quotation revision without approvals
        var quotation = new Quotation
        {
            QuotationId = 1,
            QuotationNumber = "ZP-QT-2026-0001",
            QuotationType = "Printing",
            CustomerName = "Test Client",
            CustomerPhone = "03001234567"
        };
        var revision = new QuotationRevision
        {
            RevisionId = 101,
            QuotationId = 1,
            RevisionNumber = 1,
            Status = "Draft",
            ProductionType = "IN_HOUSE",
            GrandTotal = 5000,
            Items = new List<QuotationItem>
            {
                new QuotationItem { ItemId = 1, RevisionId = 101, ProductName = "Brochures", Quantity = 100, UnitPrice = 50, ProductionType = "IN_HOUSE" }
            }
        };

        context.Quotations.Add(quotation);
        context.QuotationRevisions.Add(revision);
        await context.SaveChangesAsync();

        // Should throw InvalidOperationException
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            orderService.CreateOrderFromApprovedRevisionAsync(101));
    }

    [Fact]
    public async Task ConfirmOrder_CreatesSeparateJobs_ForMixedItems_AndIsIdempotent()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);
        var orderService = new PrintingOrderService(uow, NullLogger<PrintingOrderService>.Instance);

        // Seed approved quotation revision with mixed items
        var quotation = new Quotation
        {
            QuotationId = 2,
            QuotationNumber = "ZP-QT-2026-0002",
            QuotationType = "Printing",
            CustomerName = "Acme Corp",
            CustomerPhone = "03009998877"
        };
        var revision = new QuotationRevision
        {
            RevisionId = 202,
            QuotationId = 2,
            RevisionNumber = 1,
            Status = "Finalized",
            ProductionType = "IN_HOUSE",
            GrandTotal = 15000,
            Items = new List<QuotationItem>
            {
                new QuotationItem { ItemId = 10, RevisionId = 202, ProductName = "In-House Posters", Quantity = 50, UnitPrice = 100, ProductionType = "IN_HOUSE" },
                new QuotationItem { ItemId = 11, RevisionId = 202, ProductName = "Outsourced Hardcover Boxes", Quantity = 20, UnitPrice = 500, ProductionType = "OUTSOURCED" }
            },
            ApprovalLogs = new List<QuotationApprovalLog>
            {
                new QuotationApprovalLog { ApprovalId = 1, RevisionId = 202, Decision = "Approved", ResponseMethod = "WhatsApp" }
            }
        };

        context.Quotations.Add(quotation);
        context.QuotationRevisions.Add(revision);
        await context.SaveChangesAsync();

        // 1. Create Order from approved revision - automatically confirmed & jobs created
        var orderDto = await orderService.CreateOrderFromApprovedRevisionAsync(202);
        Assert.NotNull(orderDto);
        Assert.Equal("Confirmed", orderDto.Status);
        Assert.Equal("MIXED", orderDto.ProductionType);
        Assert.Equal(2, orderDto.Items.Count);

        // 2. Verify jobs created directly: 1 IN_HOUSE, 1 OUTSOURCED
        var jobs = await context.ProductionJobs.Include(j => j.JobItems).Where(j => j.OrderId == orderDto.OrderId).ToListAsync();
        Assert.Equal(2, jobs.Count);

        var inHouseJob = jobs.Single(j => j.ProductionType == "IN_HOUSE");
        Assert.StartsWith("JOB-IH-", inHouseJob.JobNumber);
        Assert.Single(inHouseJob.JobItems);

        var outsourcedJob = jobs.Single(j => j.ProductionType == "OUTSOURCED");
        Assert.StartsWith("JOB-OS-", outsourcedJob.JobNumber);
        Assert.Single(outsourcedJob.JobItems);

        // 3. Test Idempotency: Confirming again must NOT throw or create duplicate jobs
        var secondConfirm = await orderService.ConfirmOrderAsync(orderDto.OrderId, new ConfirmPrintingOrderRequest
        {
            ConfirmedBy = "Admin Test"
        });

        var jobsAfterSecondConfirm = await context.ProductionJobs.Where(j => j.OrderId == orderDto.OrderId).ToListAsync();
        Assert.Equal(2, jobsAfterSecondConfirm.Count);
    }

    [Fact]
    public void QuotationPdf_DoesNotExpose_VendorDetailsOrOutsourcedCosts()
    {
        var pdfService = new QuotationPdfService();

        var quotation = new Quotation
        {
            QuotationId = 3,
            QuotationNumber = "ZP-QT-2026-0003",
            CustomerName = "Luxury Brands Ltd",
            CustomerPhone = "03211112233",
            QuotationType = "Printing",
            Currency = "PKR"
        };

        var revision = new QuotationRevision
        {
            RevisionId = 301,
            QuotationId = 3,
            RevisionNumber = 1,
            Status = "Finalized",
            ProductionType = "OUTSOURCED",
            QuotationDate = DateTime.UtcNow,
            ValidUntil = DateTime.UtcNow.AddDays(15),
            Subtotal = 10000,
            GrandTotal = 10000,
            Items = new List<QuotationItem>
            {
                new QuotationItem
                {
                    ItemId = 50,
                    RevisionId = 301,
                    ProductName = "Custom Wooden Gift Boxes",
                    Quantity = 100,
                    Unit = "pcs",
                    UnitPrice = 100,
                    LineTotal = 10000,
                    ProductionType = "OUTSOURCED"
                }
            }
        };

        var pdfBytes = pdfService.GenerateQuotationPdf(quotation, revision);
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 0);

        // The PDF bytes should not contain internal vendor sensitive keywords
        var pdfString = System.Text.Encoding.Latin1.GetString(pdfBytes);
        Assert.DoesNotContain("Vendor Cost", pdfString, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Apex Packaging", pdfString, StringComparison.OrdinalIgnoreCase);
    }
}
