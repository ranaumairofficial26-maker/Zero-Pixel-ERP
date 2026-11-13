using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface ISupplierBillService
{
    Task<PaginatedSupplierBillsResponse> GetSupplierBillsAsync(string? search = null, string? status = null, int page = 1, int pageSize = 10);
    Task<List<SupplierBillListItemDto>> GetBillsBySupplierIdAsync(long supplierId);
    Task<SupplierBillDto?> GetSupplierBillByIdAsync(long id);
    Task<string> GetNextInternalBillNumberAsync();
    Task<SupplierBillSummaryDto> GetSummaryAsync();
    Task<SupplierBillAgingReportDto> GetAgingReportAsync();
    Task<SupplierBillDto> CreateSupplierBillAsync(CreateSupplierBillRequest request);
    Task<SupplierBillDto?> UpdateSupplierBillAsync(long id, UpdateSupplierBillRequest request);
    Task<bool> CancelSupplierBillAsync(long id);
}

