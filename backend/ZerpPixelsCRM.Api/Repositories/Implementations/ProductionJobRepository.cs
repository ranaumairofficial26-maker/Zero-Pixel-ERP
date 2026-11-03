using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class ProductionJobRepository : Repository<ProductionJob>, IProductionJobRepository
{
    public ProductionJobRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<ProductionJob?> GetJobWithDetailsAsync(long jobId)
    {
        return await _dbSet
            .Include(j => j.Order)
                .ThenInclude(o => o.Quotation)
            .Include(j => j.JobItems)
                .ThenInclude(ji => ji.OrderItem)
            .FirstOrDefaultAsync(j => j.JobId == jobId);
    }

    public async Task<List<ProductionJob>> GetJobsAsync(string? productionType, string? status, string? search)
    {
        var query = _dbSet
            .Include(j => j.Order)
                .ThenInclude(o => o.Quotation)
            .Include(j => j.JobItems)
                .ThenInclude(ji => ji.OrderItem)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(productionType) && !productionType.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(j => j.ProductionType.ToLower() == productionType.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(j => j.Status.ToLower() == status.Trim().ToLower());
        }
        else
        {
            query = query.Where(j => j.Status.ToLower() != "cancelled");
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(j =>
                j.JobNumber.ToLower().Contains(term) ||
                j.Order.OrderNumber.ToLower().Contains(term) ||
                j.Order.CustomerName.ToLower().Contains(term) ||
                (j.VendorName != null && j.VendorName.ToLower().Contains(term)) ||
                (j.AssignedOperator != null && j.AssignedOperator.ToLower().Contains(term)));
        }

        return await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
    }

    public async Task<string> GenerateNextJobNumberAsync(string productionType)
    {
        var year = DateTime.UtcNow.Year;
        var code = productionType.Equals("OUTSOURCED", StringComparison.OrdinalIgnoreCase) ? "OS" : "IH";
        var prefix = $"JOB-{code}-{year}-";

        var countThisYear = await _dbSet
            .CountAsync(j => j.JobNumber.StartsWith(prefix));

        return $"{prefix}{(countThisYear + 1):D4}";
    }
}

