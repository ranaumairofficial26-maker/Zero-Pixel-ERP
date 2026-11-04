using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IPrintingCalculatorRepository : IRepository<PrintingCostEstimate>
{
    // Status counts
    Task<int> GetCategoryCountAsync();
    Task<int> GetItemCountAsync();
    Task<int> GetPaperSizeCountAsync();
    Task<int> GetMaterialCountAsync();

    // Categories
    Task<List<PrintingCategory>> GetActiveCategoriesAsync();
    Task<PrintingCategory?> GetCategoryByIdAsync(int categoryId);

    // Items
    Task<List<PrintingItem>> GetItemsAsync(int? categoryId);
    Task<PrintingItem?> GetItemByIdAsync(int itemId);
    Task<PrintingItem?> GetItemWithCategoryAsync(int itemId);
    Task<PrintingItem> AddCustomItemAsync(PrintingItem item);

    // Paper Sizes
    Task<List<PaperSize>> GetPaperSizesAsync(string? type);
    Task<PaperSize?> GetPaperSizeByIdAsync(int paperSizeId);
    Task<PaperSize> AddPaperSizeAsync(PaperSize paperSize);

    // Printing Sizes
    Task<List<PrintingSize>> GetAllActivePrintingSizesAsync();
    Task<List<PrintingItemSize>> GetPrintingItemSizesByItemIdAsync(int itemId);
    Task<PrintingSize?> GetPrintingSizeByIdAsync(int sizeId);

    // Materials
    Task<List<PrintingMaterial>> GetMaterialsAsync();
    Task<PrintingMaterial?> GetMaterialByIdAsync(int materialId);
    Task<PrintingMaterial> AddCustomMaterialAsync(PrintingMaterial material);

    // Cost Categories
    Task<List<CostCategory>> GetCostCategoriesAsync();

    // Estimates
    Task<List<PrintingCostEstimate>> GetEstimatesSummaryListAsync(int? categoryId, int? itemId, string? search, int limit);
    Task<PrintingCostEstimate?> GetEstimateWithFullDetailsAsync(long estimateId);
    Task<PrintingCostEstimate> CreateEstimateWithDetailsAsync(PrintingCostEstimate estimate);
    Task<bool> SoftDeleteEstimateAsync(long estimateId);
    Task<string> GenerateNextEstimateNumberAsync();

    // Quotation integration
    Task<Quotation?> GetQuotationForLinkingAsync(long quotationId);
    Task<Client?> GetClientByIdAsync(long clientId);
    Task<Quotation> CreateQuotationWithRevisionAsync(Quotation quotation, QuotationRevision revision, QuotationItem item);
    Task<QuotationItem> AddItemToRevisionAsync(QuotationItem item);
}
