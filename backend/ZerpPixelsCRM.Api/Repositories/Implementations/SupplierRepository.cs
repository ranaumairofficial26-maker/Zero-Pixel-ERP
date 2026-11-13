using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class SupplierRepository : ISupplierRepository
{
    private readonly AppDbContext _context;

    public SupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<Supplier> Items, int TotalCount)> GetSuppliersAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        var query = _context.Suppliers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(s =>
                EF.Functions.ILike(s.SupplierName, term) ||
                (s.ContactPerson != null && EF.Functions.ILike(s.ContactPerson, term)) ||
                (s.Email != null && EF.Functions.ILike(s.Email, term)) ||
                (s.PhoneNumber != null && EF.Functions.ILike(s.PhoneNumber, term)));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .ThenByDescending(s => s.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Supplier?> GetByIdAsync(long id)
    {
        return await _context.Suppliers
            .Include(s => s.Services)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Supplier> AddAsync(Supplier supplier)
    {
        await _context.Suppliers.AddAsync(supplier);
        await _context.SaveChangesAsync();
        return supplier;
    }

    public async Task<Supplier> UpdateAsync(Supplier supplier)
    {
        await _context.SaveChangesAsync();
        return supplier;
    }

    public async Task<bool> DeactivateAsync(long id)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
        if (supplier == null) return false;

        supplier.Status = "Inactive";
        supplier.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}

