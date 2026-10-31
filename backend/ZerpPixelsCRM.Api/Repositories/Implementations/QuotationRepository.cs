using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class QuotationRepository : Repository<Quotation>, IQuotationRepository
{
    public QuotationRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<QuotationListItemDto> Items, int TotalCount)> GetPaginatedQuotationsAsync(
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
        // Enforce supported page sizes (10, 25, 50)
        if (pageSize != 10 && pageSize != 25 && pageSize != 50)
        {
            pageSize = 10;
        }

        if (page < 1) page = 1;

        // Base query - only non-deleted quotations
        var query = _context.Quotations
            .AsNoTracking()
            .Where(q => q.DeletedAt == null);

        // 1. Quotation Type filter (Printing | Service)
        if (!string.IsNullOrWhiteSpace(quotationType) && !quotationType.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(q => q.QuotationType.ToLower() == quotationType.Trim().ToLower());
        }

        // 2. Free Text Search (Quotation #, Customer Name, Phone, Contact Person, Product Item)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(q =>
                q.QuotationNumber.ToLower().Contains(term) ||
                q.CustomerName.ToLower().Contains(term) ||
                (q.ContactPerson != null && q.ContactPerson.ToLower().Contains(term)) ||
                q.CustomerPhone.Contains(term) ||
                q.Revisions.Any(r => r.Items.Any(i => i.ProductName.ToLower().Contains(term)))
            );
        }

        // 3. Status Filter (Draft, Finalized, Converted, Expired)
        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var s = status.Trim().ToLower();
            query = query.Where(q => q.Revisions.OrderByDescending(r => r.RevisionNumber).Select(r => r.Status.ToLower()).FirstOrDefault() == s);
        }

        // 4. Approval Status Filter (Pending, Approved, Rejected, Revision Requested)
        if (!string.IsNullOrWhiteSpace(approvalStatus) && !approvalStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var app = approvalStatus.Trim().ToLower();
            query = query.Where(q => q.Revisions
                .OrderByDescending(r => r.RevisionNumber)
                .Select(r => r.ApprovalLogs.OrderByDescending(a => a.CreatedAt).Select(a => a.Decision.ToLower()).FirstOrDefault() ?? "pending")
                .FirstOrDefault() == app);
        }

        // 5. Sending Status Filter (Not Sent, WhatsApp, Email, Manual)
        if (!string.IsNullOrWhiteSpace(sendingStatus) && !sendingStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var snd = sendingStatus.Trim().ToLower();
            if (snd == "not sent")
            {
                query = query.Where(q => !q.Revisions.Any(r => r.SendLogs.Any()));
            }
            else
            {
                query = query.Where(q => q.Revisions
                    .OrderByDescending(r => r.RevisionNumber)
                    .Select(r => r.SendLogs.OrderByDescending(s => s.CreatedAt).Select(s => s.SendMethod.ToLower()).FirstOrDefault() ?? "not sent")
                    .FirstOrDefault() == snd);
            }
        }

        // 6. Date Range Filter
        if (fromDate.HasValue)
        {
            query = query.Where(q => q.CreatedAt >= fromDate.Value.ToUniversalTime());
        }

        if (toDate.HasValue)
        {
            var endOfDay = toDate.Value.Date.AddDays(1).AddTicks(-1).ToUniversalTime();
            query = query.Where(q => q.CreatedAt <= endOfDay);
        }

        // Total count for pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // 7. Sorting
        query = (sortBy?.ToLower()) switch
        {
            "quotationnumber" or "quotation_number" => isAscending ? query.OrderBy(q => q.QuotationNumber) : query.OrderByDescending(q => q.QuotationNumber),
            "customername" or "customer" => isAscending ? query.OrderBy(q => q.CustomerName) : query.OrderByDescending(q => q.CustomerName),
            "totalamount" or "amount" => isAscending
                ? query.OrderBy(q => q.Revisions.OrderByDescending(r => r.RevisionNumber).Select(r => r.GrandTotal).FirstOrDefault())
                : query.OrderByDescending(q => q.Revisions.OrderByDescending(r => r.RevisionNumber).Select(r => r.GrandTotal).FirstOrDefault()),
            "date" or _ => isAscending ? query.OrderBy(q => q.CreatedAt) : query.OrderByDescending(q => q.CreatedAt)
        };

        // 8. Projection to DTO with pagination
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new
            {
                q.QuotationId,
                q.QuotationNumber,
                q.QuotationType,
                q.CustomerName,
                q.ContactPerson,
                q.CustomerPhone,
                q.Currency,
                q.CreatedAt,
                LatestRev = q.Revisions.OrderByDescending(r => r.RevisionNumber).Select(r => new
                {
                    r.RevisionId,
                    r.RevisionNumber,
                    r.Status,
                    r.QuotationDate,
                    r.ValidUntil,
                    r.GrandTotal,
                    Products = r.Items.OrderBy(i => i.SortOrder).Select(i => i.ProductName).Take(3).ToList(),
                    TotalItemsCount = r.Items.Count(),
                    LatestSend = r.SendLogs.OrderByDescending(s => s.CreatedAt).Select(s => s.SendMethod).FirstOrDefault(),
                    LatestApproval = r.ApprovalLogs.OrderByDescending(a => a.CreatedAt).Select(a => a.Decision).FirstOrDefault()
                }).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var dtoList = items.Select(x =>
        {
            var prodSummary = x.LatestRev != null && x.LatestRev.Products.Count > 0
                ? string.Join(", ", x.LatestRev.Products) + (x.LatestRev.TotalItemsCount > 3 ? $" (+{x.LatestRev.TotalItemsCount - 3} more)" : "")
                : "No items";

            return new QuotationListItemDto
            {
                QuotationId = x.QuotationId,
                QuotationNumber = x.QuotationNumber,
                RevisionId = x.LatestRev?.RevisionId ?? 0,
                RevisionNumber = x.LatestRev?.RevisionNumber ?? 1,
                QuotationType = x.QuotationType,
                QuotationDate = x.LatestRev?.QuotationDate ?? x.CreatedAt,
                ValidUntil = x.LatestRev?.ValidUntil ?? x.CreatedAt.AddDays(14),
                CustomerName = x.CustomerName,
                ContactPerson = x.ContactPerson,
                CustomerPhone = x.CustomerPhone,
                ProductSummary = prodSummary,
                GrandTotal = x.LatestRev?.GrandTotal ?? 0,
                Currency = x.Currency,
                Status = x.LatestRev?.Status ?? "Draft",
                SendingStatus = x.LatestRev?.LatestSend ?? "Not Sent",
                ApprovalStatus = x.LatestRev?.LatestApproval ?? "Pending",
                CreatedAt = x.CreatedAt
            };
        }).ToList();

        return (dtoList, totalCount);
    }

    public async Task<QuotationSummaryDto> GetSummaryCountsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var counts = await _context.Quotations
            .AsNoTracking()
            .Where(q => q.DeletedAt == null)
            .Select(q => new
            {
                LatestRev = q.Revisions.OrderByDescending(r => r.RevisionNumber).Select(r => new
                {
                    r.Status,
                    r.ValidUntil,
                    LatestApproval = r.ApprovalLogs.OrderByDescending(a => a.CreatedAt).Select(a => a.Decision).FirstOrDefault()
                }).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        int total = counts.Count;
        int draft = 0;
        int finalized = 0;
        int approved = 0;
        int expired = 0;
        int converted = 0;

        foreach (var c in counts)
        {
            var rev = c.LatestRev;
            if (rev == null) continue;

            var status = rev.Status;
            var approval = rev.LatestApproval ?? "Pending";

            if (status.Equals("Draft", StringComparison.OrdinalIgnoreCase))
            {
                draft++;
            }
            else if (status.Equals("Converted", StringComparison.OrdinalIgnoreCase))
            {
                converted++;
            }
            else if (status.Equals("Finalized", StringComparison.OrdinalIgnoreCase))
            {
                finalized++;
            }

            if (approval.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            {
                approved++;
            }

            if (rev.ValidUntil < now && !status.Equals("Converted", StringComparison.OrdinalIgnoreCase))
            {
                expired++;
            }
        }

        return new QuotationSummaryDto
        {
            TotalQuotations = total,
            DraftQuotations = draft,
            FinalizedQuotations = finalized,
            ApprovedQuotations = approved,
            ExpiredQuotations = expired,
            ConvertedQuotations = converted
        };
    }

    public async Task<Quotation?> GetQuotationWithDetailsAsync(long id)
    {
        return await _context.Quotations
            .Include(q => q.Revisions)
                .ThenInclude(r => r.Items.OrderBy(i => i.SortOrder))
            .Include(q => q.Revisions)
                .ThenInclude(r => r.SendLogs.OrderByDescending(s => s.CreatedAt))
            .Include(q => q.Revisions)
                .ThenInclude(r => r.ApprovalLogs.OrderByDescending(a => a.CreatedAt))
            .FirstOrDefaultAsync(q => q.QuotationId == id && q.DeletedAt == null);
    }

    public async Task<QuotationRevision?> GetRevisionWithDetailsAsync(long revisionId)
    {
        return await _context.QuotationRevisions
            .Include(r => r.Quotation)
            .Include(r => r.Items.OrderBy(i => i.SortOrder))
            .Include(r => r.SendLogs.OrderByDescending(s => s.CreatedAt))
            .Include(r => r.ApprovalLogs.OrderByDescending(a => a.CreatedAt))
            .FirstOrDefaultAsync(r => r.RevisionId == revisionId);
    }

    public async Task<QuotationRevision?> GetLatestRevisionAsync(long quotationId)
    {
        return await _context.QuotationRevisions
            .Include(r => r.Items.OrderBy(i => i.SortOrder))
            .Include(r => r.SendLogs.OrderByDescending(s => s.CreatedAt))
            .Include(r => r.ApprovalLogs.OrderByDescending(a => a.CreatedAt))
            .Where(r => r.QuotationId == quotationId)
            .OrderByDescending(r => r.RevisionNumber)
            .FirstOrDefaultAsync();
    }

    public async Task<string> GenerateNextQuotationNumberAsync()
    {
        var today = DateTime.UtcNow;
        var prefix = $"QT-{today:yyyyMMdd}-";

        // Query highest sequence generated today
        var maxQuoteNumber = await _context.Quotations
            .AsNoTracking()
            .Where(q => q.QuotationNumber.StartsWith(prefix))
            .OrderByDescending(q => q.QuotationNumber)
            .Select(q => q.QuotationNumber)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (!string.IsNullOrEmpty(maxQuoteNumber))
        {
            var parts = maxQuoteNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int currentSeq))
            {
                nextSeq = currentSeq + 1;
            }
        }

        return $"{prefix}{nextSeq:D4}";
    }

    public async Task AddRevisionAsync(QuotationRevision revision)
    {
        await _context.QuotationRevisions.AddAsync(revision);
    }

    public async Task AddItemsAsync(IEnumerable<QuotationItem> items)
    {
        await _context.QuotationItems.AddRangeAsync(items);
    }

    public void RemoveItems(IEnumerable<QuotationItem> items)
    {
        _context.QuotationItems.RemoveRange(items);
    }

    public async Task AddSendLogAsync(QuotationSendLog log)
    {
        await _context.QuotationSendLogs.AddAsync(log);
    }

    public async Task AddApprovalLogAsync(QuotationApprovalLog log)
    {
        await _context.QuotationApprovalLogs.AddAsync(log);
    }

    public async Task<bool> SoftDeleteQuotationAsync(long id)
    {
        var quote = await _context.Quotations.FirstOrDefaultAsync(q => q.QuotationId == id);
        if (quote == null || quote.DeletedAt != null)
            return false;

        quote.DeletedAt = DateTime.UtcNow;
        quote.UpdatedAt = DateTime.UtcNow;
        return true;
    }
}

