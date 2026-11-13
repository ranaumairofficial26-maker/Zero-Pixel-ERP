using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface ISupplierRepository
{
    Task<(IEnumerable<Supplier> Items, int TotalCount)> GetSuppliersAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<Supplier?> GetByIdAsync(long id);
    Task<Supplier> AddAsync(Supplier supplier);
    Task<Supplier> UpdateAsync(Supplier supplier);
    Task<bool> DeactivateAsync(long id);
}

