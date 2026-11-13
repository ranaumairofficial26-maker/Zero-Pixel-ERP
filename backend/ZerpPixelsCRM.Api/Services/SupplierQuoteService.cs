using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class SupplierQuoteService : ISupplierQuoteService
{
    private readonly ISupplierQuoteRepository _quoteRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly ILogger<SupplierQuoteService> _logger;

    public SupplierQuoteService(
        ISupplierQuoteRepository quoteRepository,
        ISupplierRepository supplierRepository,
        ILogger<SupplierQuoteService> logger)
    {
        _quoteRepository = quoteRepository;
        _supplierRepository = supplierRepository;
        _logger = logger;
    }

    public async Task<PaginatedSupplierQuotesResponse> GetQuotesAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize != 10 && pageSize != 25 && pageSize != 50) pageSize = 10;

        var (items, totalCount) = await _quoteRepository.GetQuotesAsync(search, page, pageSize);

        return new PaginatedSupplierQuotesResponse
        {
            Items = items.Select(q => new SupplierQuoteListItemDto
            {
                Id = q.Id,
                QuoteNumber = q.QuoteNumber,
                SupplierReferenceNumber = q.SupplierReferenceNumber,
                SupplierId = q.SupplierId,
                SupplierName = q.Supplier?.SupplierName ?? "Unknown Supplier",
                QuoteDate = q.QuoteDate,
                Description = q.Description,
                TotalAmount = q.TotalAmount,
                Status = q.Status,
                ItemCount = q.Items?.Count ?? 0,
                CreatedAt = q.CreatedAt
            }).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<SupplierQuoteDto?> GetQuoteByIdAsync(long id)
    {
        var quote = await _quoteRepository.GetByIdAsync(id);
        return quote == null ? null : MapToDto(quote);
    }

    public async Task<string> GetNextQuoteNumberAsync()
    {
        return await _quoteRepository.GetNextQuoteNumberAsync();
    }

    public async Task<SupplierQuoteDto> CreateQuoteAsync(CreateSupplierQuoteRequest request)
    {
        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId);
        if (supplier == null)
        {
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");
        }
        if (!string.Equals(supplier.Status, "Active", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Supplier '{supplier.SupplierName}' is currently inactive and cannot be selected for a new quote.");
        }

        var quoteNumber = string.IsNullOrWhiteSpace(request.QuoteNumber)
            ? await _quoteRepository.GetNextQuoteNumberAsync()
            : request.QuoteNumber.Trim();

        if (await _quoteRepository.QuoteNumberExistsAsync(quoteNumber))
        {
            throw new InvalidOperationException($"Quote Number '{quoteNumber}' already exists.");
        }

        var calculatedItems = BuildCalculatedItems(request.Items);
        var totalAmount = calculatedItems.Sum(i => i.Amount);
        var now = DateTime.UtcNow;

        var quote = new SupplierQuote
        {
            QuoteNumber = quoteNumber,
            SupplierId = supplier.Id,
            SupplierReferenceNumber = string.IsNullOrWhiteSpace(request.SupplierReferenceNumber) ? null : request.SupplierReferenceNumber.Trim(),
            QuoteDate = DateTime.SpecifyKind(request.QuoteDate, DateTimeKind.Utc),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            TotalAmount = totalAmount,
            Status = "Recorded",
            CreatedAt = now,
            UpdatedAt = now,
            Items = calculatedItems
        };

        var created = await _quoteRepository.AddAsync(quote);
        _logger.LogInformation("Recorded supplier quote {QuoteNumber} (ID {QuoteId}) for supplier {SupplierId}", created.QuoteNumber, created.Id, supplier.Id);
        return MapToDto(created);
    }

    public async Task<SupplierQuoteDto?> UpdateQuoteAsync(long id, UpdateSupplierQuoteRequest request)
    {
        var existing = await _quoteRepository.GetByIdAsync(id);
        if (existing == null) return null;

        if (string.Equals(existing.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Cancelled supplier quotes cannot be edited.");
        }

        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId);
        if (supplier == null)
        {
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");
        }
        if (request.SupplierId != existing.SupplierId && !string.Equals(supplier.Status, "Active", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Supplier '{supplier.SupplierName}' is currently inactive and cannot be selected.");
        }

        var calculatedItems = BuildCalculatedItems(request.Items);
        var totalAmount = calculatedItems.Sum(i => i.Amount);

        existing.SupplierId = supplier.Id;
        existing.SupplierReferenceNumber = string.IsNullOrWhiteSpace(request.SupplierReferenceNumber) ? null : request.SupplierReferenceNumber.Trim();
        existing.QuoteDate = DateTime.SpecifyKind(request.QuoteDate, DateTimeKind.Utc);
        existing.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        existing.TotalAmount = totalAmount;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _quoteRepository.UpdateAsync(existing, calculatedItems);
        _logger.LogInformation("Updated supplier quote {QuoteNumber} (ID {QuoteId})", updated.QuoteNumber, updated.Id);
        return MapToDto(updated);
    }

    public async Task<bool> CancelQuoteAsync(long id)
    {
        var success = await _quoteRepository.CancelAsync(id);
        if (success)
        {
            _logger.LogInformation("Cancelled supplier quote ID {QuoteId}", id);
        }
        return success;
    }

    private static List<SupplierQuoteItem> BuildCalculatedItems(List<SupplierQuoteItemInput> inputs)
    {
        if (inputs == null || inputs.Count == 0)
        {
            throw new ArgumentException("At least one quotation item is required.");
        }

        var result = new List<SupplierQuoteItem>();
        int serial = 1;
        foreach (var item in inputs)
        {
            if (string.IsNullOrWhiteSpace(item.Description))
            {
                throw new ArgumentException($"Item #{serial} description is required.");
            }
            if (item.Quantity <= 0)
            {
                throw new ArgumentException($"Item #{serial} quantity must be greater than zero.");
            }
            if (item.Rate < 0)
            {
                throw new ArgumentException($"Item #{serial} rate cannot be negative.");
            }

            var amount = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            result.Add(new SupplierQuoteItem
            {
                SerialNumber = serial++,
                Description = item.Description.Trim(),
                Quantity = item.Quantity,
                Rate = item.Rate,
                Amount = amount
            });
        }

        return result;
    }

    private static SupplierQuoteDto MapToDto(SupplierQuote q)
    {
        return new SupplierQuoteDto
        {
            Id = q.Id,
            QuoteNumber = q.QuoteNumber,
            SupplierReferenceNumber = q.SupplierReferenceNumber,
            SupplierId = q.SupplierId,
            SupplierName = q.Supplier?.SupplierName ?? "Unknown Supplier",
            SupplierContactPerson = q.Supplier?.ContactPerson,
            SupplierPhone = q.Supplier?.PhoneNumber,
            SupplierEmail = q.Supplier?.Email,
            QuoteDate = q.QuoteDate,
            Description = q.Description,
            TotalAmount = q.TotalAmount,
            Status = q.Status,
            CreatedAt = q.CreatedAt,
            UpdatedAt = q.UpdatedAt,
            Items = (q.Items ?? new List<SupplierQuoteItem>())
                .OrderBy(i => i.SerialNumber)
                .Select(i => new SupplierQuoteItemDto
                {
                    Id = i.Id,
                    SerialNumber = i.SerialNumber,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Amount = i.Amount
                }).ToList()
        };
    }
}

