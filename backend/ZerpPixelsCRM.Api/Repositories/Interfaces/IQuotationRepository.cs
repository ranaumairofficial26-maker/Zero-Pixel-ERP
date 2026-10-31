using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IQuotationRepository : IRepository<Quotation>
{
    Task<(IReadOnlyList<QuotationListItemDto> Items, int TotalCount)> GetPaginatedQuotationsAsync(
        string? search,
        string? quotationType,
        string? status,
        string? approvalStatus,
        string? sendingStatus,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        string? sortBy,
        bool isAscending,
        CancellationToken cancellationToken = default);

    Task<QuotationSummaryDto> GetSummaryCountsAsync(CancellationToken cancellationToken = default);

    Task<Quotation?> GetQuotationWithDetailsAsync(long id);

    Task<QuotationRevision?> GetRevisionWithDetailsAsync(long revisionId);

    Task<QuotationRevision?> GetLatestRevisionAsync(long quotationId);

    Task<string> GenerateNextQuotationNumberAsync();

    Task AddRevisionAsync(QuotationRevision revision);

    Task AddItemsAsync(IEnumerable<QuotationItem> items);

    void RemoveItems(IEnumerable<QuotationItem> items);

    Task AddSendLogAsync(QuotationSendLog log);

    Task AddApprovalLogAsync(QuotationApprovalLog log);

    Task<bool> SoftDeleteQuotationAsync(long id);
}

