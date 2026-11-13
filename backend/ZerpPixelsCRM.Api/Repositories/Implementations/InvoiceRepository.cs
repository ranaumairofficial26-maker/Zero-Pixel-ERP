using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly AppDbContext _context;

    public InvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<Invoice> Items, int TotalCount)> GetInvoicesAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        var query = _context.Invoices
            .Include(i => i.Items)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(s) ||
                i.CustomerName.ToLower().Contains(s) ||
                (i.CompanyName != null && i.CompanyName.ToLower().Contains(s)) ||
                i.ContactNumber.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.InvoiceDate)
            .ThenByDescending(i => i.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Invoice?> GetByIdAsync(long id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice != null && invoice.Items != null)
        {
            invoice.Items = invoice.Items.OrderBy(item => item.SerialNumber).ToList();
        }

        return invoice;
    }

    public async Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber)
    {
        var norm = invoiceNumber.Trim().ToLower();
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.InvoiceNumber.ToLower() == norm);

        if (invoice != null && invoice.Items != null)
        {
            invoice.Items = invoice.Items.OrderBy(item => item.SerialNumber).ToList();
        }

        return invoice;
    }

    public async Task<Invoice?> GetByIdOrNumberAsync(string idOrNumber)
    {
        if (string.IsNullOrWhiteSpace(idOrNumber)) return null;

        if (long.TryParse(idOrNumber.Trim(), out long id))
        {
            var byId = await GetByIdAsync(id);
            if (byId != null) return byId;
        }

        return await GetByInvoiceNumberAsync(idOrNumber);
    }

    public async Task<string> GetNextInvoiceNumberAsync()
    {
        var now = DateTime.UtcNow;
        var prefix = $"INV-{now:yyyyMM}-";

        var latest = await _context.Invoices
            .Where(i => i.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.InvoiceNumber)
            .Select(i => i.InvoiceNumber)
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

    public async Task<Invoice> AddAsync(Invoice invoice)
    {
        invoice.CreatedAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;

        if (string.IsNullOrWhiteSpace(invoice.InvoiceNumber))
        {
            invoice.InvoiceNumber = await GetNextInvoiceNumberAsync();
        }

        await _context.Invoices.AddAsync(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice> UpdateAsync(Invoice invoice)
    {
        invoice.UpdatedAt = DateTime.UtcNow;

        // Existing items in database
        var existingItems = await _context.InvoiceItems
            .Where(item => item.InvoiceId == invoice.Id)
            .ToListAsync();

        _context.InvoiceItems.RemoveRange(existingItems);

        foreach (var item in invoice.Items)
        {
            item.InvoiceId = invoice.Id;
            item.CreatedAt = DateTime.UtcNow;
            await _context.InvoiceItems.AddAsync(item);
        }

        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return false;

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return true;
    }
}

