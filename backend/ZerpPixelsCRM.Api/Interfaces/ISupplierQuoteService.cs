using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface ISupplierQuoteService
{
    Task<PaginatedSupplierQuotesResponse> GetQuotesAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<SupplierQuoteDto?> GetQuoteByIdAsync(long id);
    Task<string> GetNextQuoteNumberAsync();
    Task<SupplierQuoteDto> CreateQuoteAsync(CreateSupplierQuoteRequest request);
    Task<SupplierQuoteDto?> UpdateQuoteAsync(long id, UpdateSupplierQuoteRequest request);
    Task<bool> CancelQuoteAsync(long id);
}

