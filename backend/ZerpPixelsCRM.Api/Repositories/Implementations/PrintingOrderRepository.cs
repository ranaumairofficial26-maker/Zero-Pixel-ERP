using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class PrintingOrderRepository : Repository<PrintingOrder>, IPrintingOrderRepository
{
    public PrintingOrderRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PrintingOrder?> GetOrderWithDetailsAsync(long orderId)
    {
        return await _dbSet
            .Include(o => o.Quotation)
            .Include(o => o.Revision)
            .Include(o => o.Client)
            .Include(o => o.Items)
            .Include(o => o.ProductionJobs)
                .ThenInclude(j => j.JobItems)
                    .ThenInclude(ji => ji.OrderItem)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
    }

    public async Task<PrintingOrder?> GetOrderByRevisionIdAsync(long revisionId)
    {
        return await _dbSet
            .Include(o => o.Quotation)
            .Include(o => o.Revision)
            .Include(o => o.Client)
            .Include(o => o.Items)
            .Include(o => o.ProductionJobs)
            .FirstOrDefaultAsync(o => o.RevisionId == revisionId);
    }

    public async Task<string> GenerateNextOrderNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"PO-{year}-";

        var countThisYear = await _dbSet
            .CountAsync(o => o.OrderNumber.StartsWith(prefix));

        return $"{prefix}{(countThisYear + 1):D4}";
    }
}

