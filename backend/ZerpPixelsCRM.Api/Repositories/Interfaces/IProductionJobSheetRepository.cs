using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IProductionJobSheetRepository
{
    Task<IEnumerable<ProductionJobSheet>> GetAllAsync(string? search = null);
    Task<ProductionJobSheet?> GetByIdAsync(long id);
    Task<ProductionJobSheet?> GetByJobCardNumberAsync(string jobCardNumber);
    Task<ProductionJobSheet> AddAsync(ProductionJobSheet sheet);
    Task<ProductionJobSheet> UpdateAsync(ProductionJobSheet sheet);
    Task<bool> DeleteAsync(long id);
}

