using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IPrintingCalculatorService
{
    Task<object> GetImportStatusAsync();
    Task<List<PrintingCategoryDto>> GetCategoriesAsync();
    Task<List<PrintingItemDto>> GetItemsAsync(int? categoryId);
    Task<PrintingItemDto> CreateCustomItemAsync(CreateCustomItemRequest req);
    Task<List<PaperSizeDto>> GetPaperSizesAsync(string? type);
    Task<PaperSizeDto> CreatePaperSizeAsync(CreatePaperSizeRequest req);
    Task<List<PrintingSizeDto>> GetPrintingSizesAsync(int? itemId);
    Task<PrintingSizeDto?> GetPrintingSizeByIdAsync(int id);
    Task<List<PrintingMaterialDto>> GetMaterialsAsync();
    Task<PrintingMaterialDto> CreateCustomMaterialAsync(CreateCustomMaterialRequest req);
    Task<List<CostCategoryDto>> GetCostCategoriesAsync();
    CalculateEstimateResponse CalculateEstimate(CalculateEstimateRequest req);
    Task<List<EstimateSummaryDto>> GetEstimatesSummaryListAsync(int? categoryId, int? itemId, string? search, int limit);
    Task<EstimateDetailDto?> GetEstimateByIdAsync(long id);
    Task<EstimateDetailDto> SaveEstimateAsync(SaveEstimateRequest req, string? userEmail);
    Task<bool> DeleteEstimateAsync(long id);
    Task<EstimateDetailDto?> DuplicateEstimateAsync(long id, string? userEmail);
    Task<(bool Success, string? ErrorMessage, object? Data)> LinkToQuotationAsync(LinkEstimateToQuotationRequest req);
}

