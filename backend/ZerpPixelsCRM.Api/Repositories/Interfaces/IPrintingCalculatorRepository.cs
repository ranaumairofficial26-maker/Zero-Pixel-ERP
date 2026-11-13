using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IPrintingCalculatorRepository : IRepository<PrintingCostEstimate>
{
    // Categories
    Task<List<PrintingCategory>> GetActiveCategoriesAsync();
    Task<PrintingCategory?> GetCategoryByIdAsync(int categoryId);

    // Items
    Task<List<PrintingItem>> GetItemsAsync(int? categoryId);
    Task<PrintingItem?> GetItemByIdAsync(int itemId);
    Task<PrintingItem> AddCustomItemAsync(PrintingItem item);

    // Paper Sizes
    Task<List<PaperSize>> GetPaperSizesAsync(string? type);
    Task<PaperSize> AddPaperSizeAsync(PaperSize paperSize);

    // Printing Sizes
    Task<List<PrintingSize>> GetAllActivePrintingSizesAsync();
    Task<List<PrintingItemSize>> GetPrintingItemSizesByItemIdAsync(int itemId);

    // Materials
    Task<List<PrintingMaterial>> GetMaterialsAsync();
    Task<PrintingMaterial> AddCustomMaterialAsync(PrintingMaterial material);

    // Cost Categories
    Task<List<CostCategory>> GetCostCategoriesAsync();

    // Machine Rates
    Task<List<PrintingMachineRate>> GetMachineRatesAsync();

    // Estimates
    Task<List<PrintingCostEstimate>> GetEstimatesSummaryListAsync(int? categoryId, int? itemId, string? search, int limit);
    Task<PrintingCostEstimate?> GetEstimateWithFullDetailsAsync(long estimateId);
    Task<bool> SoftDeleteEstimateAsync(long estimateId);

    // Quotation integration
    Task<Quotation?> GetQuotationForLinkingAsync(long quotationId);
    Task<Client?> GetClientByIdAsync(long clientId);
    Task<Quotation> CreateQuotationWithRevisionAsync(Quotation quotation, QuotationRevision revision, QuotationItem item);
    Task<QuotationItem> AddItemToRevisionAsync(QuotationItem item);
}
