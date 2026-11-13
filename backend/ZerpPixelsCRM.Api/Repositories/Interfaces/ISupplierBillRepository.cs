using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface ISupplierBillRepository
{
    Task<(IEnumerable<SupplierBill> Items, int TotalCount)> GetSupplierBillsAsync(string? search = null, string? status = null, int page = 1, int pageSize = 10);
    Task<List<SupplierBill>> GetBySupplierIdAsync(long supplierId);
    Task<List<SupplierBill>> GetAllActiveBillsAsync();
    Task<SupplierBill?> GetByIdAsync(long id);
    Task<string> GetNextInternalBillNumberAsync();
    Task<bool> InternalBillNumberExistsAsync(string internalBillNumber, long? excludeId = null);
    Task<bool> SupplierInvoiceNumberExistsAsync(long supplierId, string supplierInvoiceNumber, long? excludeId = null);
    Task<SupplierBill> AddAsync(SupplierBill bill);
    Task<SupplierBill> UpdateAsync(SupplierBill bill, List<SupplierBillItem> newItems);
    Task<bool> CancelAsync(long id);
}

