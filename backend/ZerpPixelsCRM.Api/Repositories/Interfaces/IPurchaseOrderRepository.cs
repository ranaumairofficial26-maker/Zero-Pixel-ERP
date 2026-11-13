using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IPurchaseOrderRepository
{
    Task<(IEnumerable<PurchaseOrder> Items, int TotalCount)> GetPurchaseOrdersAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<List<PurchaseOrder>> GetBySupplierIdAsync(long supplierId);
    Task<PurchaseOrder?> GetByIdAsync(long id);
    Task<string> GetNextPoNumberAsync();
    Task<bool> PoNumberExistsAsync(string poNumber, long? excludeId = null);
    Task<bool> ProjectJobExistsAsync(long projectJobId);
    Task<PurchaseOrder> AddAsync(PurchaseOrder po);
    Task<PurchaseOrder> UpdateAsync(PurchaseOrder po, List<PurchaseOrderItem> newItems);
    Task<PurchaseOrder?> IssueAsync(long id);
    Task<bool> CancelAsync(long id);
}

