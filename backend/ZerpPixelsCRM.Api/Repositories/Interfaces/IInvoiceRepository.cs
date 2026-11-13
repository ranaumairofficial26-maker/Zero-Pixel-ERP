using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IInvoiceRepository
{
    Task<(IEnumerable<Invoice> Items, int TotalCount)> GetInvoicesAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<Invoice?> GetByIdAsync(long id);
    Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber);
    Task<Invoice?> GetByIdOrNumberAsync(string idOrNumber);
    Task<string> GetNextInvoiceNumberAsync();
    Task<Invoice> AddAsync(Invoice invoice);
    Task<Invoice> UpdateAsync(Invoice invoice);
    Task<bool> DeleteAsync(long id);
}

