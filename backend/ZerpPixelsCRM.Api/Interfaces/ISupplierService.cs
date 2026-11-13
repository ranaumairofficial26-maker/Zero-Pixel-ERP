using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface ISupplierService
{
    Task<PaginatedSuppliersResponse> GetSuppliersAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<SupplierDto?> GetSupplierByIdAsync(long id);
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierRequest request);
    Task<SupplierDto?> UpdateSupplierAsync(long id, UpdateSupplierRequest request);
    Task<bool> DeactivateSupplierAsync(long id);
}

