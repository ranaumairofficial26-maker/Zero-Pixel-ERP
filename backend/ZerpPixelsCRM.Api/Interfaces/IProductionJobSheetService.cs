using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IProductionJobSheetService
{
    Task<IEnumerable<ProductionJobSheetDto>> GetAllAsync(string? search = null);
    Task<ProductionJobSheetDto?> GetByIdAsync(long id);
    Task<ProductionJobSheetDto> SaveAsync(SaveProductionJobSheetDto dto, long? id = null);
    Task<bool> DeleteAsync(long id);
}

