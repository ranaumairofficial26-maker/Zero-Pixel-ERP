using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class PurchaseOrderRepository : IPurchaseOrderRepository
{
    private readonly AppDbContext _context;

    public PurchaseOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<PurchaseOrder> Items, int TotalCount)> GetPurchaseOrdersAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        var query = _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.SupplierQuote)
            .Include(p => p.ProjectJob)
                .ThenInclude(j => j!.Order)
            .Include(p => p.Items)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(p =>
                EF.Functions.ILike(p.PoNumber, term) ||
                (p.Supplier != null && EF.Functions.ILike(p.Supplier.SupplierName, term)) ||
                (p.ProjectJob != null && EF.Functions.ILike(p.ProjectJob.JobNumber, term)) ||
                (p.ProjectJob != null && p.ProjectJob.Order != null && EF.Functions.ILike(p.ProjectJob.Order.CustomerName, term)));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<List<PurchaseOrder>> GetBySupplierIdAsync(long supplierId)
    {
        return await _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.SupplierQuote)
            .Include(p => p.ProjectJob)
                .ThenInclude(j => j!.Order)
            .Include(p => p.Items)
            .AsNoTracking()
            .Where(p => p.SupplierId == supplierId)
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .ToListAsync();
    }

    public async Task<PurchaseOrder?> GetByIdAsync(long id)
    {
        return await _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.SupplierQuote)
            .Include(p => p.ProjectJob)
                .ThenInclude(j => j!.Order)
            .Include(p => p.Items.OrderBy(i => i.SerialNumber))
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<string> GetNextPoNumberAsync()
    {
        var now = DateTime.UtcNow;
        var prefix = $"PO-{now:yyyyMM}-";

        var latest = await _context.PurchaseOrders
            .Where(p => p.PoNumber.StartsWith(prefix))
            .OrderByDescending(p => p.PoNumber)
            .Select(p => p.PoNumber)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (!string.IsNullOrWhiteSpace(latest))
        {
            var suffix = latest.Substring(prefix.Length);
            if (int.TryParse(suffix, out int parsedSeq))
            {
                nextSeq = parsedSeq + 1;
            }
        }

        return $"{prefix}{nextSeq:D4}";
    }

    public async Task<bool> PoNumberExistsAsync(string poNumber, long? excludeId = null)
    {
        return await _context.PurchaseOrders.AnyAsync(p =>
            p.PoNumber == poNumber && (!excludeId.HasValue || p.Id != excludeId.Value));
    }

    public async Task<bool> ProjectJobExistsAsync(long projectJobId)
    {
        return await _context.ProductionJobs.AnyAsync(j => j.JobId == projectJobId);
    }

    public async Task<PurchaseOrder> AddAsync(PurchaseOrder po)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        if (string.IsNullOrWhiteSpace(po.PoNumber))
        {
            po.PoNumber = await GetNextPoNumberAsync();
        }
        await _context.PurchaseOrders.AddAsync(po);
        await _context.SaveChangesAsync();
        await tx.CommitAsync();
        return (await GetByIdAsync(po.Id))!;
    }

    public async Task<PurchaseOrder> UpdateAsync(PurchaseOrder po, List<PurchaseOrderItem> newItems)
    {
        using var tx = await _context.Database.BeginTransactionAsync();

        var existingItems = await _context.PurchaseOrderItems
            .Where(i => i.PurchaseOrderId == po.Id)
            .ToListAsync();

        if (existingItems.Count > 0)
        {
            _context.PurchaseOrderItems.RemoveRange(existingItems);
        }

        foreach (var item in newItems)
        {
            item.PurchaseOrderId = po.Id;
            await _context.PurchaseOrderItems.AddAsync(item);
        }

        await _context.SaveChangesAsync();
        await tx.CommitAsync();
        return (await GetByIdAsync(po.Id))!;
    }

    public async Task<PurchaseOrder?> IssueAsync(long id)
    {
        var po = await _context.PurchaseOrders.FirstOrDefaultAsync(p => p.Id == id);
        if (po == null) return null;

        po.Status = "Issued";
        po.IssuedAt = DateTime.UtcNow;
        po.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> CancelAsync(long id)
    {
        var po = await _context.PurchaseOrders.FirstOrDefaultAsync(p => p.Id == id);
        if (po == null) return false;

        po.Status = "Cancelled";
        po.CancelledAt = DateTime.UtcNow;
        po.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}

