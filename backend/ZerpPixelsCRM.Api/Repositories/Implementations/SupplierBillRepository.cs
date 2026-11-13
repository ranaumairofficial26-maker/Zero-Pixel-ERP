using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class SupplierBillRepository : ISupplierBillRepository
{
    private readonly AppDbContext _context;

    public SupplierBillRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<SupplierBill> Items, int TotalCount)> GetSupplierBillsAsync(string? search = null, string? status = null, int page = 1, int pageSize = 10)
    {
        var query = _context.SupplierBills
            .Include(b => b.Supplier)
            .Include(b => b.PurchaseOrder)
            .Include(b => b.Items)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(b =>
                EF.Functions.ILike(b.InternalBillNumber, term) ||
                EF.Functions.ILike(b.SupplierInvoiceNumber, term) ||
                (b.Supplier != null && EF.Functions.ILike(b.Supplier.SupplierName, term)) ||
                (b.PurchaseOrder != null && EF.Functions.ILike(b.PurchaseOrder.PoNumber, term)));
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(b => b.Status == status);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .ThenByDescending(b => b.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<List<SupplierBill>> GetBySupplierIdAsync(long supplierId)
    {
        return await _context.SupplierBills
            .Include(b => b.Supplier)
            .Include(b => b.PurchaseOrder)
            .Include(b => b.Items)
            .AsNoTracking()
            .Where(b => b.SupplierId == supplierId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<SupplierBill>> GetAllActiveBillsAsync()
    {
        return await _context.SupplierBills
            .Include(b => b.Supplier)
            .Include(b => b.PurchaseOrder)
            .AsNoTracking()
            .Where(b => b.Status != "Cancelled")
            .OrderBy(b => b.DueDate)
            .ToListAsync();
    }

    public async Task<SupplierBill?> GetByIdAsync(long id)
    {
        return await _context.SupplierBills
            .Include(b => b.Supplier)
            .Include(b => b.PurchaseOrder)
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<string> GetNextInternalBillNumberAsync()
    {
        var currentYearMonth = DateTime.UtcNow.ToString("yyyyMM");
        var prefix = $"BILL-{currentYearMonth}-";

        var latestBill = await _context.SupplierBills
            .Where(b => b.InternalBillNumber.StartsWith(prefix))
            .OrderByDescending(b => b.InternalBillNumber)
            .Select(b => b.InternalBillNumber)
            .FirstOrDefaultAsync();

        var nextSequence = 1;
        if (!string.IsNullOrEmpty(latestBill) && latestBill.Length >= prefix.Length + 4)
        {
            var seqString = latestBill.Substring(prefix.Length);
            if (int.TryParse(seqString, out var seq))
            {
                nextSequence = seq + 1;
            }
        }

        return $"{prefix}{nextSequence:D4}";
    }

    public async Task<bool> InternalBillNumberExistsAsync(string internalBillNumber, long? excludeId = null)
    {
        var query = _context.SupplierBills.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }
        return await query.AnyAsync(b => b.InternalBillNumber == internalBillNumber);
    }

    public async Task<bool> SupplierInvoiceNumberExistsAsync(long supplierId, string supplierInvoiceNumber, long? excludeId = null)
    {
        var query = _context.SupplierBills.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }
        return await query.AnyAsync(b => b.SupplierId == supplierId && b.SupplierInvoiceNumber.ToLower() == supplierInvoiceNumber.Trim().ToLower() && b.Status != "Cancelled");
    }

    public async Task<SupplierBill> AddAsync(SupplierBill bill)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            if (string.IsNullOrWhiteSpace(bill.InternalBillNumber))
            {
                bill.InternalBillNumber = await GetNextInternalBillNumberAsync();
            }

            _context.SupplierBills.Add(bill);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();
            return bill;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<SupplierBill> UpdateAsync(SupplierBill bill, List<SupplierBillItem> newItems)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var existingItems = await _context.SupplierBillItems
                .Where(i => i.SupplierBillId == bill.Id)
                .ToListAsync();

            _context.SupplierBillItems.RemoveRange(existingItems);

            foreach (var item in newItems)
            {
                item.SupplierBillId = bill.Id;
                _context.SupplierBillItems.Add(item);
            }

            bill.UpdatedAt = DateTime.UtcNow;
            _context.SupplierBills.Update(bill);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();
            return bill;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> CancelAsync(long id)
    {
        var bill = await _context.SupplierBills.FindAsync(id);
        if (bill == null) return false;

        bill.Status = "Cancelled";
        bill.CancelledAt = DateTime.UtcNow;
        bill.UpdatedAt = DateTime.UtcNow;

        _context.SupplierBills.Update(bill);
        await _context.SaveChangesAsync();
        return true;
    }
}

