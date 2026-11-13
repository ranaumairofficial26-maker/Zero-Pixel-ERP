using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class SupplierQuoteRepository : ISupplierQuoteRepository
{
    private readonly AppDbContext _context;

    public SupplierQuoteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<SupplierQuote> Items, int TotalCount)> GetQuotesAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        var query = _context.SupplierQuotes
            .Include(q => q.Supplier)
            .Include(q => q.Items)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(q =>
                EF.Functions.ILike(q.QuoteNumber, term) ||
                (q.SupplierReferenceNumber != null && EF.Functions.ILike(q.SupplierReferenceNumber, term)) ||
                (q.Description != null && EF.Functions.ILike(q.Description, term)) ||
                (q.Supplier != null && EF.Functions.ILike(q.Supplier.SupplierName, term)));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(q => q.QuoteDate)
            .ThenByDescending(q => q.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<SupplierQuote?> GetByIdAsync(long id)
    {
        return await _context.SupplierQuotes
            .Include(q => q.Supplier)
            .Include(q => q.Items.OrderBy(i => i.SerialNumber))
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<string> GetNextQuoteNumberAsync()
    {
        var now = DateTime.UtcNow;
        var prefix = $"SQ-{now:yyyyMM}-";

        var latest = await _context.SupplierQuotes
            .Where(q => q.QuoteNumber.StartsWith(prefix))
            .OrderByDescending(q => q.QuoteNumber)
            .Select(q => q.QuoteNumber)
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

    public async Task<bool> QuoteNumberExistsAsync(string quoteNumber, long? excludeId = null)
    {
        return await _context.SupplierQuotes.AnyAsync(q =>
            q.QuoteNumber == quoteNumber && (!excludeId.HasValue || q.Id != excludeId.Value));
    }

    public async Task<SupplierQuote> AddAsync(SupplierQuote quote)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        if (string.IsNullOrWhiteSpace(quote.QuoteNumber))
        {
            quote.QuoteNumber = await GetNextQuoteNumberAsync();
        }
        await _context.SupplierQuotes.AddAsync(quote);
        await _context.SaveChangesAsync();
        await tx.CommitAsync();
        return (await GetByIdAsync(quote.Id))!;
    }

    public async Task<SupplierQuote> UpdateAsync(SupplierQuote quote, List<SupplierQuoteItem> newItems)
    {
        using var tx = await _context.Database.BeginTransactionAsync();

        var existingItems = await _context.SupplierQuoteItems
            .Where(i => i.SupplierQuoteId == quote.Id)
            .ToListAsync();

        if (existingItems.Count > 0)
        {
            _context.SupplierQuoteItems.RemoveRange(existingItems);
        }

        foreach (var item in newItems)
        {
            item.SupplierQuoteId = quote.Id;
            await _context.SupplierQuoteItems.AddAsync(item);
        }

        await _context.SaveChangesAsync();
        await tx.CommitAsync();
        return (await GetByIdAsync(quote.Id))!;
    }

    public async Task<bool> CancelAsync(long id)
    {
        var quote = await _context.SupplierQuotes.FirstOrDefaultAsync(q => q.Id == id);
        if (quote == null) return false;

        quote.Status = "Cancelled";
        quote.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}

