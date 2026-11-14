using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IInvoiceService
{
    Task<PaginatedInvoicesResponse> GetInvoicesAsync(string? search = null, string? period = null, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 10);
    Task<InvoiceDto?> GetInvoiceByIdAsync(long id);
    Task<InvoiceDto?> GetInvoiceByIdOrNumberAsync(string idOrNumber);
    Task<string> GetNextInvoiceNumberAsync();
    Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto dto);
    Task<InvoiceDto> UpdateInvoiceAsync(long id, UpdateInvoiceDto dto);
    Task<bool> DeleteInvoiceAsync(long id);
    Task<(byte[] FileBytes, string FileName)?> GeneratePdfAsync(string idOrNumber);
    Task<(byte[] FileBytes, string FileName)> GenerateReportPdfAsync(string? period = null, string? search = null, DateTime? fromDate = null, DateTime? toDate = null);
}

