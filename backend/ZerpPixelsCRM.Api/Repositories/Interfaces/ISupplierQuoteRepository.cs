using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface ISupplierQuoteRepository
{
    Task<(IEnumerable<SupplierQuote> Items, int TotalCount)> GetQuotesAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<SupplierQuote?> GetByIdAsync(long id);
    Task<string> GetNextQuoteNumberAsync();
    Task<bool> QuoteNumberExistsAsync(string quoteNumber, long? excludeId = null);
    Task<SupplierQuote> AddAsync(SupplierQuote quote);
    Task<SupplierQuote> UpdateAsync(SupplierQuote quote, List<SupplierQuoteItem> newItems);
    Task<bool> CancelAsync(long id);
}

