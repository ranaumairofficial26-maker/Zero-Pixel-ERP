using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IPurchaseOrderService
{
    Task<PaginatedPurchaseOrdersResponse> GetPurchaseOrdersAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<List<PurchaseOrderListItemDto>> GetPurchaseOrdersBySupplierIdAsync(long supplierId);
    Task<PurchaseOrderDto?> GetPurchaseOrderByIdAsync(long id);
    Task<string> GetNextPoNumberAsync();
    Task<PurchaseOrderDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequest request, bool issueImmediately = false);
    Task<PurchaseOrderDto?> UpdateDraftPurchaseOrderAsync(long id, UpdatePurchaseOrderRequest request);
    Task<PurchaseOrderDto?> IssuePurchaseOrderAsync(long id);
    Task<bool> CancelPurchaseOrderAsync(long id);
}

