using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IInvoiceService
{
    Task<PaginatedInvoicesResponse> GetInvoicesAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<InvoiceDto?> GetInvoiceByIdAsync(long id);
    Task<InvoiceDto?> GetInvoiceByIdOrNumberAsync(string idOrNumber);
    Task<string> GetNextInvoiceNumberAsync();
    Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto dto);
    Task<InvoiceDto> UpdateInvoiceAsync(long id, UpdateInvoiceDto dto);
    Task<bool> DeleteInvoiceAsync(long id);
    Task<(byte[] FileBytes, string FileName)?> GeneratePdfAsync(string idOrNumber);
}

