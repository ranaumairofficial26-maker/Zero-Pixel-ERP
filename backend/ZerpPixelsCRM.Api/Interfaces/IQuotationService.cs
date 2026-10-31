using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IQuotationService
{
    Task<PaginatedResponse<QuotationListItemDto>> GetQuotationsAsync(
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

    Task<QuotationSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);

    Task<QuotationDetailsDto?> GetQuotationByIdAsync(long id, long? revisionId = null);

    Task<QuotationDetailsDto> CreateDraftQuotationAsync(CreateQuotationRequest request);

    Task<QuotationDetailsDto?> UpdateDraftQuotationAsync(long id, UpdateDraftQuotationRequest request);

    Task<QuotationDetailsDto?> FinalizeQuotationAsync(long id);

    Task<QuotationDetailsDto?> CreateRevisionAsync(long id);

    Task<QuotationSendLogDto?> RecordSendLogAsync(RecordSendLogRequest request);

    Task<QuotationApprovalLogDto?> RecordApprovalLogAsync(RecordApprovalLogRequest request);

    Task<bool> DeleteQuotationAsync(long id);

    Task<(byte[] FileBytes, string FileName)?> GeneratePdfAsync(long id, long? revisionId = null);
}

