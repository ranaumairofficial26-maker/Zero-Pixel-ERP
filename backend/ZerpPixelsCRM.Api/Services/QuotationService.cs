using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class QuotationService : IQuotationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly QuotationPdfService _pdfService;

    public QuotationService(IUnitOfWork _unitOfWork, QuotationPdfService pdfService)
    {
        this._unitOfWork = _unitOfWork;
        _pdfService = pdfService;
    }

    public async Task<PaginatedResponse<QuotationListItemDto>> GetQuotationsAsync(
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
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _unitOfWork.Quotations.GetPaginatedQuotationsAsync(
            search, quotationType, status, approvalStatus, sendingStatus, fromDate, toDate, page, pageSize, sortBy, isAscending, cancellationToken);

        return new PaginatedResponse<QuotationListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<QuotationSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Quotations.GetSummaryCountsAsync(cancellationToken);
    }

    public async Task<QuotationDetailsDto?> GetQuotationByIdAsync(long id, long? revisionId = null)
    {
        var quote = await _unitOfWork.Quotations.GetQuotationWithDetailsAsync(id);
        if (quote == null) return null;

        return MapToQuotationDetailsDto(quote, revisionId);
    }

    public async Task<QuotationDetailsDto> CreateDraftQuotationAsync(CreateQuotationRequest request)
    {
        var quoteNumber = await _unitOfWork.Quotations.GenerateNextQuotationNumberAsync();
        var now = DateTime.UtcNow;

        var resolvedClientId = await ResolveOrAutoCreateClientAsync(
            request.ClientId,
            request.CustomerName,
            request.ContactPerson,
            request.CustomerPhone,
            request.CustomerEmail,
            request.CustomerAddress);

        var quotation = new Quotation
        {
            QuotationNumber = quoteNumber,
            ClientId = resolvedClientId,
            CustomerName = request.CustomerName.Trim(),
            ContactPerson = request.ContactPerson?.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim(),
            CustomerAddress = request.CustomerAddress?.Trim(),
            QuotationType = request.QuotationType ?? "Printing",
            Currency = request.Currency ?? "PKR",
            CreatedAt = now,
            UpdatedAt = now
        };

        // Pricing calculation
        var itemTuples = request.Items.Select(i => (i.Quantity, i.UnitPrice));
        var pricing = PricingCalculationEngine.CalculateTotals(
            itemTuples, request.DiscountType, request.DiscountValue, request.TaxRate);

        var revision = new QuotationRevision
        {
            Quotation = quotation,
            RevisionNumber = 1,
            Status = "Draft",
            QuotationDate = request.QuotationDate.HasValue ? ToUtcDateTime(request.QuotationDate.Value) : now,
            ValidUntil = request.ValidUntil.HasValue ? ToUtcDateTime(request.ValidUntil.Value) : now.AddDays(15),
            Subtotal = pricing.Subtotal,
            DiscountType = request.DiscountType ?? "None",
            DiscountValue = request.DiscountValue,
            DiscountAmount = pricing.DiscountAmount,
            TaxRate = request.TaxRate,
            TaxAmount = pricing.TaxAmount,
            GrandTotal = pricing.GrandTotal,
            InternalNotes = request.InternalNotes,
            CustomerNotes = request.CustomerNotes,
            TermsAndConditions = request.TermsAndConditions,
            CreatedAt = now,
            UpdatedAt = now
        };

        int sort = 1;
        foreach (var itemReq in request.Items)
        {
            revision.Items.Add(new QuotationItem
            {
                Revision = revision,
                SortOrder = itemReq.SortOrder > 0 ? itemReq.SortOrder : sort++,
                ItemType = itemReq.ItemType ?? "Printing",
                ProductName = itemReq.ProductName.Trim(),
                Description = itemReq.Description?.Trim(),
                SizeDimensions = itemReq.SizeDimensions?.Trim(),
                Material = itemReq.Material?.Trim(),
                Gsm = itemReq.Gsm?.Trim(),
                PrintingColor = itemReq.PrintingColor?.Trim(),
                Finishing = itemReq.Finishing?.Trim(),
                Quantity = itemReq.Quantity,
                Unit = string.IsNullOrWhiteSpace(itemReq.Unit) ? "pcs" : itemReq.Unit.Trim(),
                UnitPrice = itemReq.UnitPrice,
                LineTotal = PricingCalculationEngine.CalculateLineTotal(itemReq.Quantity, itemReq.UnitPrice),
                ServiceCategory = itemReq.ServiceCategory,
                ServiceDetails = itemReq.ServiceDetails,
                Notes = itemReq.Notes?.Trim()
            });
        }

        quotation.Revisions.Add(revision);

        await _unitOfWork.Quotations.AddAsync(quotation);
        await _unitOfWork.CompleteAsync();

        return MapToQuotationDetailsDto(quotation);
    }

    public async Task<QuotationDetailsDto?> UpdateDraftQuotationAsync(long id, UpdateDraftQuotationRequest request)
    {
        var quotation = await _unitOfWork.Quotations.GetQuotationWithDetailsAsync(id);
        if (quotation == null) return null;

        var activeRevision = quotation.Revisions.OrderByDescending(r => r.RevisionNumber).FirstOrDefault();
        if (activeRevision == null) return null;

        if (!activeRevision.Status.Equals("Draft", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Cannot update quotation because revision {activeRevision.RevisionNumber} is {activeRevision.Status}. Only Draft revisions can be modified.");
        }

        var now = DateTime.UtcNow;

        var resolvedClientId = await ResolveOrAutoCreateClientAsync(
            request.ClientId,
            request.CustomerName,
            request.ContactPerson,
            request.CustomerPhone,
            request.CustomerEmail,
            request.CustomerAddress);

        // Update master info
        quotation.ClientId = resolvedClientId;
        quotation.CustomerName = request.CustomerName.Trim();
        quotation.ContactPerson = request.ContactPerson?.Trim();
        quotation.CustomerPhone = request.CustomerPhone.Trim();
        quotation.CustomerEmail = request.CustomerEmail?.Trim();
        quotation.CustomerAddress = request.CustomerAddress?.Trim();
        quotation.QuotationType = request.QuotationType ?? "Printing";
        quotation.Currency = request.Currency ?? "PKR";
        quotation.UpdatedAt = now;

        // Pricing calculation
        var itemTuples = request.Items.Select(i => (i.Quantity, i.UnitPrice));
        var pricing = PricingCalculationEngine.CalculateTotals(
            itemTuples, request.DiscountType, request.DiscountValue, request.TaxRate);

        if (request.QuotationDate.HasValue)
        {
            activeRevision.QuotationDate = ToUtcDateTime(request.QuotationDate.Value);
        }
        if (request.ValidUntil.HasValue)
        {
            activeRevision.ValidUntil = ToUtcDateTime(request.ValidUntil.Value);
        }
        activeRevision.Subtotal = pricing.Subtotal;
        activeRevision.DiscountType = request.DiscountType ?? "None";
        activeRevision.DiscountValue = request.DiscountValue;
        activeRevision.DiscountAmount = pricing.DiscountAmount;
        activeRevision.TaxRate = request.TaxRate;
        activeRevision.TaxAmount = pricing.TaxAmount;
        activeRevision.GrandTotal = pricing.GrandTotal;
        activeRevision.InternalNotes = request.InternalNotes;
        activeRevision.CustomerNotes = request.CustomerNotes;
        activeRevision.TermsAndConditions = request.TermsAndConditions;
        activeRevision.UpdatedAt = now;

        // Replace items: remove existing from database tracking first
        _unitOfWork.Quotations.RemoveItems(activeRevision.Items);
        activeRevision.Items.Clear();
        int sort = 1;
        foreach (var itemReq in request.Items)
        {
            activeRevision.Items.Add(new QuotationItem
            {
                RevisionId = activeRevision.RevisionId,
                SortOrder = itemReq.SortOrder > 0 ? itemReq.SortOrder : sort++,
                ItemType = itemReq.ItemType ?? "Printing",
                ProductName = itemReq.ProductName.Trim(),
                Description = itemReq.Description?.Trim(),
                SizeDimensions = itemReq.SizeDimensions?.Trim(),
                Material = itemReq.Material?.Trim(),
                Gsm = itemReq.Gsm?.Trim(),
                PrintingColor = itemReq.PrintingColor?.Trim(),
                Finishing = itemReq.Finishing?.Trim(),
                Quantity = itemReq.Quantity,
                Unit = string.IsNullOrWhiteSpace(itemReq.Unit) ? "pcs" : itemReq.Unit.Trim(),
                UnitPrice = itemReq.UnitPrice,
                LineTotal = PricingCalculationEngine.CalculateLineTotal(itemReq.Quantity, itemReq.UnitPrice),
                ServiceCategory = itemReq.ServiceCategory,
                ServiceDetails = itemReq.ServiceDetails,
                Notes = itemReq.Notes?.Trim()
            });
        }

        await _unitOfWork.CompleteAsync();
        return MapToQuotationDetailsDto(quotation);
    }

    public async Task<QuotationDetailsDto?> FinalizeQuotationAsync(long id)
    {
        var quotation = await _unitOfWork.Quotations.GetQuotationWithDetailsAsync(id);
        if (quotation == null) return null;

        var activeRevision = quotation.Revisions.OrderByDescending(r => r.RevisionNumber).FirstOrDefault();
        if (activeRevision == null) return null;

        if (!activeRevision.Status.Equals("Draft", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Revision {activeRevision.RevisionNumber} is already {activeRevision.Status}.");
        }

        if (!activeRevision.Items.Any())
        {
            throw new InvalidOperationException("Cannot finalize a quotation without any items.");
        }

        var now = DateTime.UtcNow;
        activeRevision.Status = "Finalized";
        activeRevision.FinalizedAt = now;
        activeRevision.UpdatedAt = now;
        quotation.UpdatedAt = now;

        await _unitOfWork.CompleteAsync();
        return MapToQuotationDetailsDto(quotation);
    }

    public async Task<QuotationDetailsDto?> CreateRevisionAsync(long id)
    {
        var quotation = await _unitOfWork.Quotations.GetQuotationWithDetailsAsync(id);
        if (quotation == null) return null;

        var currentLatest = quotation.Revisions.OrderByDescending(r => r.RevisionNumber).FirstOrDefault();
        if (currentLatest == null) return null;

        var now = DateTime.UtcNow;
        int nextRevNum = currentLatest.RevisionNumber + 1;

        var newRevision = new QuotationRevision
        {
            QuotationId = quotation.QuotationId,
            RevisionNumber = nextRevNum,
            Status = "Draft",
            QuotationDate = now,
            ValidUntil = now.AddDays(15),
            Subtotal = currentLatest.Subtotal,
            DiscountType = currentLatest.DiscountType,
            DiscountValue = currentLatest.DiscountValue,
            DiscountAmount = currentLatest.DiscountAmount,
            TaxRate = currentLatest.TaxRate,
            TaxAmount = currentLatest.TaxAmount,
            GrandTotal = currentLatest.GrandTotal,
            InternalNotes = currentLatest.InternalNotes,
            CustomerNotes = currentLatest.CustomerNotes,
            TermsAndConditions = currentLatest.TermsAndConditions,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in currentLatest.Items)
        {
            newRevision.Items.Add(new QuotationItem
            {
                Revision = newRevision,
                SortOrder = item.SortOrder,
                ItemType = item.ItemType,
                ProductName = item.ProductName,
                Description = item.Description,
                SizeDimensions = item.SizeDimensions,
                Material = item.Material,
                Gsm = item.Gsm,
                PrintingColor = item.PrintingColor,
                Finishing = item.Finishing,
                Quantity = item.Quantity,
                Unit = item.Unit,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal,
                ServiceCategory = item.ServiceCategory,
                ServiceDetails = item.ServiceDetails,
                Notes = item.Notes
            });
        }

        quotation.Revisions.Add(newRevision);
        quotation.UpdatedAt = now;

        await _unitOfWork.CompleteAsync();
        return MapToQuotationDetailsDto(quotation);
    }

    public async Task<QuotationSendLogDto?> RecordSendLogAsync(RecordSendLogRequest request)
    {
        var revision = await _unitOfWork.Quotations.GetRevisionWithDetailsAsync(request.RevisionId);
        if (revision == null) return null;

        var now = DateTime.UtcNow;
        var log = new QuotationSendLog
        {
            RevisionId = request.RevisionId,
            SendMethod = request.SendMethod,
            Recipient = request.Recipient.Trim(),
            MarkedSentAt = now,
            Notes = request.Notes?.Trim(),
            CreatedAt = now
        };

        await _unitOfWork.Quotations.AddSendLogAsync(log);
        await _unitOfWork.CompleteAsync();

        return new QuotationSendLogDto
        {
            SendId = log.SendId,
            RevisionId = log.RevisionId,
            SendMethod = log.SendMethod,
            Recipient = log.Recipient,
            MarkedSentAt = log.MarkedSentAt,
            Notes = log.Notes,
            CreatedAt = log.CreatedAt
        };
    }

    public async Task<QuotationApprovalLogDto?> RecordApprovalLogAsync(RecordApprovalLogRequest request)
    {
        var revision = await _unitOfWork.Quotations.GetRevisionWithDetailsAsync(request.RevisionId);
        if (revision == null) return null;

        var now = DateTime.UtcNow;
        var log = new QuotationApprovalLog
        {
            RevisionId = request.RevisionId,
            Decision = request.Decision,
            ResponseMethod = request.ResponseMethod,
            ContactName = request.ContactName?.Trim(),
            ResponseAt = now,
            Notes = request.Notes?.Trim(),
            CreatedAt = now
        };

        await _unitOfWork.Quotations.AddApprovalLogAsync(log);
        await _unitOfWork.CompleteAsync();

        return new QuotationApprovalLogDto
        {
            ApprovalId = log.ApprovalId,
            RevisionId = log.RevisionId,
            Decision = log.Decision,
            ResponseMethod = log.ResponseMethod,
            ContactName = log.ContactName,
            ResponseAt = log.ResponseAt,
            Notes = log.Notes,
            CreatedAt = log.CreatedAt
        };
    }

    public async Task<bool> DeleteQuotationAsync(long id)
    {
        var success = await _unitOfWork.Quotations.SoftDeleteQuotationAsync(id);
        if (success)
        {
            await _unitOfWork.CompleteAsync();
        }
        return success;
    }

    public async Task<(byte[] FileBytes, string FileName)?> GeneratePdfAsync(long id, long? revisionId = null)
    {
        var quotation = await _unitOfWork.Quotations.GetQuotationWithDetailsAsync(id);
        if (quotation == null) return null;

        var revision = revisionId.HasValue
            ? quotation.Revisions.FirstOrDefault(r => r.RevisionId == revisionId.Value)
            : quotation.Revisions.OrderByDescending(r => r.RevisionNumber).FirstOrDefault();

        if (revision == null) return null;

        var bytes = _pdfService.GenerateQuotationPdf(quotation, revision);
        var fileName = $"{quotation.QuotationNumber}_Rev{revision.RevisionNumber}.pdf";

        return (bytes, fileName);
    }

    private static QuotationDetailsDto MapToQuotationDetailsDto(Quotation quotation, long? selectedRevisionId = null)
    {
        var activeRev = selectedRevisionId.HasValue
            ? quotation.Revisions.FirstOrDefault(r => r.RevisionId == selectedRevisionId.Value)
            : null;

        activeRev ??= quotation.Revisions.OrderByDescending(r => r.RevisionNumber).FirstOrDefault()
            ?? new QuotationRevision();

        return new QuotationDetailsDto
        {
            QuotationId = quotation.QuotationId,
            QuotationNumber = quotation.QuotationNumber,
            ClientId = quotation.ClientId,
            CustomerName = quotation.CustomerName,
            ContactPerson = quotation.ContactPerson,
            CustomerPhone = quotation.CustomerPhone,
            CustomerEmail = quotation.CustomerEmail,
            CustomerAddress = quotation.CustomerAddress,
            QuotationType = quotation.QuotationType,
            Currency = quotation.Currency,
            CreatedAt = quotation.CreatedAt,
            UpdatedAt = quotation.UpdatedAt,
            ActiveRevision = MapToRevisionDto(activeRev),
            Revisions = quotation.Revisions.OrderByDescending(r => r.RevisionNumber).Select(r => new QuotationRevisionSummaryDto
            {
                RevisionId = r.RevisionId,
                RevisionNumber = r.RevisionNumber,
                Status = r.Status,
                QuotationDate = r.QuotationDate,
                GrandTotal = r.GrandTotal,
                FinalizedAt = r.FinalizedAt,
                CreatedAt = r.CreatedAt
            }).ToList()
        };
    }

    private static QuotationRevisionDto MapToRevisionDto(QuotationRevision revision)
    {
        return new QuotationRevisionDto
        {
            RevisionId = revision.RevisionId,
            QuotationId = revision.QuotationId,
            RevisionNumber = revision.RevisionNumber,
            Status = revision.Status,
            QuotationDate = revision.QuotationDate,
            ValidUntil = revision.ValidUntil,
            Subtotal = revision.Subtotal,
            DiscountType = revision.DiscountType,
            DiscountValue = revision.DiscountValue,
            DiscountAmount = revision.DiscountAmount,
            TaxRate = revision.TaxRate,
            TaxAmount = revision.TaxAmount,
            GrandTotal = revision.GrandTotal,
            InternalNotes = revision.InternalNotes,
            CustomerNotes = revision.CustomerNotes,
            TermsAndConditions = revision.TermsAndConditions,
            FinalizedAt = revision.FinalizedAt,
            CreatedAt = revision.CreatedAt,
            UpdatedAt = revision.UpdatedAt,
            Items = revision.Items.OrderBy(i => i.SortOrder).ThenBy(i => i.ItemId).Select(i => new QuotationItemDto
            {
                ItemId = i.ItemId,
                RevisionId = i.RevisionId,
                SortOrder = i.SortOrder,
                ItemType = i.ItemType,
                ProductName = i.ProductName,
                Description = i.Description,
                SizeDimensions = i.SizeDimensions,
                Material = i.Material,
                Gsm = i.Gsm,
                PrintingColor = i.PrintingColor,
                Finishing = i.Finishing,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                LineTotal = i.LineTotal,
                ServiceCategory = i.ServiceCategory,
                ServiceDetails = i.ServiceDetails,
                Notes = i.Notes
            }).ToList(),
            SendLogs = revision.SendLogs.OrderByDescending(s => s.MarkedSentAt).Select(s => new QuotationSendLogDto
            {
                SendId = s.SendId,
                RevisionId = s.RevisionId,
                SendMethod = s.SendMethod,
                Recipient = s.Recipient,
                MarkedSentAt = s.MarkedSentAt,
                Notes = s.Notes,
                CreatedAt = s.CreatedAt
            }).ToList(),
            ApprovalLogs = revision.ApprovalLogs.OrderByDescending(a => a.ResponseAt).Select(a => new QuotationApprovalLogDto
            {
                ApprovalId = a.ApprovalId,
                RevisionId = a.RevisionId,
                Decision = a.Decision,
                ResponseMethod = a.ResponseMethod,
                ContactName = a.ContactName,
                ResponseAt = a.ResponseAt,
                Notes = a.Notes,
                CreatedAt = a.CreatedAt
            }).ToList()
        };
    }

    private async Task<long?> ResolveOrAutoCreateClientAsync(
        long? clientId,
        string customerName,
        string? contactPerson,
        string customerPhone,
        string? customerEmail,
        string? customerAddress)
    {
        // 1. If an existing ClientId was provided, verify it exists
        if (clientId.HasValue && clientId.Value > 0)
        {
            var existing = await _unitOfWork.Clients.GetByIdAsync(clientId.Value);
            if (existing != null)
            {
                return existing.ClientId;
            }
        }

        var cleanPhone = customerPhone?.Trim() ?? string.Empty;
        var cleanName = customerName?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(cleanName) || string.IsNullOrWhiteSpace(cleanPhone))
        {
            return clientId;
        }

        // 2. Search if a client already exists with this phone number or company name
        var existingClients = await _unitOfWork.Clients.FindAsync(c =>
            c.DeletedAt == null && (c.Phone == cleanPhone || c.CompanyName.ToLower() == cleanName.ToLower()));

        var match = existingClients.FirstOrDefault();
        if (match != null)
        {
            return match.ClientId;
        }

        // 3. Auto-create new Client in Customers Directory
        var newClient = new Client
        {
            CompanyName = cleanName,
            ContactPerson = !string.IsNullOrWhiteSpace(contactPerson) ? contactPerson.Trim() : null,
            Phone = cleanPhone,
            Email = !string.IsNullOrWhiteSpace(customerEmail) ? customerEmail.Trim() : null,
            Address = !string.IsNullOrWhiteSpace(customerAddress) ? customerAddress.Trim() : null,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Clients.AddAsync(newClient);
        await _unitOfWork.CompleteAsync();

        return newClient.ClientId;
    }

    private static DateTime ToUtcDateTime(DateTime dt)
    {
        return dt.Kind switch
        {
            DateTimeKind.Utc => dt,
            DateTimeKind.Local => dt.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
        };
    }
}
