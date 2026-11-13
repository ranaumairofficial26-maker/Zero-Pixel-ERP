using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class ProductionJobSheetRepository : IProductionJobSheetRepository
{
    private readonly AppDbContext _context;

    public ProductionJobSheetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductionJobSheet>> GetAllAsync(string? search = null)
    {
        var query = _context.ProductionJobSheets.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(j => 
                j.JobCardNumber.ToLower().Contains(s) ||
                j.CustomerName.ToLower().Contains(s) ||
                j.JobName.ToLower().Contains(s) ||
                (j.PrintingOperator != null && j.PrintingOperator.ToLower().Contains(s)) ||
                (j.PrintingMachine != null && j.PrintingMachine.ToLower().Contains(s)));
        }

        return await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
    }

    public async Task<ProductionJobSheet?> GetByIdAsync(long id)
    {
        return await _context.ProductionJobSheets.FindAsync(id);
    }

    public async Task<ProductionJobSheet?> GetByJobCardNumberAsync(string jobCardNumber)
    {
        return await _context.ProductionJobSheets
            .FirstOrDefaultAsync(j => j.JobCardNumber.ToLower() == jobCardNumber.Trim().ToLower());
    }

    public async Task<ProductionJobSheet> AddAsync(ProductionJobSheet sheet)
    {
        sheet.CreatedAt = DateTime.UtcNow;
        sheet.UpdatedAt = DateTime.UtcNow;
        await _context.ProductionJobSheets.AddAsync(sheet);
        await _context.SaveChangesAsync();
        return sheet;
    }

    public async Task<ProductionJobSheet> UpdateAsync(ProductionJobSheet sheet)
    {
        sheet.UpdatedAt = DateTime.UtcNow;
        _context.ProductionJobSheets.Update(sheet);
        await _context.SaveChangesAsync();
        return sheet;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var sheet = await _context.ProductionJobSheets.FindAsync(id);
        if (sheet == null) return false;

        _context.ProductionJobSheets.Remove(sheet);
        await _context.SaveChangesAsync();
        return true;
    }
}

