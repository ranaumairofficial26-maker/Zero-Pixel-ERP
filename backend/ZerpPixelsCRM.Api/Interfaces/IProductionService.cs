using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IProductionService
{
    Task<List<ProductionJobDto>> GetProductionJobsAsync(string? productionType = null, string? status = null, string? search = null);
    Task<ProductionJobDto?> GetProductionJobByIdAsync(long jobId);
    Task<ProductionJobDto?> UpdateProductionJobAsync(long jobId, UpdateProductionJobRequest request);
    Task<ProductionJobDto?> UpdateJobStatusAsync(long jobId, string status, string? notes = null);
    Task<bool> DeleteJobAsync(long jobId);
    Task<int> ClearInHouseJobsAsync();
}

