using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface ISupplierPaymentService
{
    Task<PaginatedSupplierPaymentsResponse> GetSupplierPaymentsAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<SupplierPaymentDto?> GetSupplierPaymentByIdAsync(long id);
    Task<List<SupplierPaymentListItemDto>> GetPaymentsBySupplierIdAsync(long supplierId);
    Task<List<SupplierPaymentListItemDto>> GetPaymentsByBillIdAsync(long billId);
    Task<string> GetNextPaymentNumberAsync();
    Task<SupplierPaymentDto> CreateSupplierPaymentAsync(CreateSupplierPaymentRequest request, string? createdBy);
    Task<SupplierPaymentDto?> UpdateSupplierPaymentAsync(long id, UpdateSupplierPaymentRequest request);
    Task<SupplierPaymentDto?> ReverseSupplierPaymentAsync(long id, ReverseSupplierPaymentRequest request, string? reversedBy);
}
