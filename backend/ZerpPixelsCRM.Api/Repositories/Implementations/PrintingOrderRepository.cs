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

    public async Task<List<PrintingOrder>> GetAllOrdersAsync(string? status, string? search)
    {
        var query = _dbSet
            .Include(o => o.Quotation)
            .Include(o => o.Revision)
            .Include(o => o.Items)
            .Include(o => o.ProductionJobs)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(term) ||
                o.CustomerName.ToLower().Contains(term) ||
                o.CustomerPhone.Contains(term) ||
                o.Quotation.QuotationNumber.ToLower().Contains(term));
        }

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
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

