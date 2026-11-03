using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IProductionJobRepository : IRepository<ProductionJob>
{
    Task<ProductionJob?> GetJobWithDetailsAsync(long jobId);
    Task<List<ProductionJob>> GetJobsAsync(string? productionType, string? status, string? search);
    Task<string> GenerateNextJobNumberAsync(string productionType);
}

