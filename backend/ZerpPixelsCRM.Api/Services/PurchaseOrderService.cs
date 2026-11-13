using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly IPurchaseOrderRepository _poRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly ISupplierQuoteRepository _quoteRepository;
    private readonly ILogger<PurchaseOrderService> _logger;

    public PurchaseOrderService(
        IPurchaseOrderRepository poRepository,
        ISupplierRepository supplierRepository,
        ISupplierQuoteRepository quoteRepository,
        ILogger<PurchaseOrderService> logger)
    {
        _poRepository = poRepository;
        _supplierRepository = supplierRepository;
        _quoteRepository = quoteRepository;
        _logger = logger;
    }

    public async Task<PaginatedPurchaseOrdersResponse> GetPurchaseOrdersAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize != 10 && pageSize != 25 && pageSize != 50) pageSize = 10;

        var (items, totalCount) = await _poRepository.GetPurchaseOrdersAsync(search, page, pageSize);

        return new PaginatedPurchaseOrdersResponse
        {
            Items = items.Select(MapToListItemDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<PurchaseOrderListItemDto>> GetPurchaseOrdersBySupplierIdAsync(long supplierId)
    {
        var items = await _poRepository.GetBySupplierIdAsync(supplierId);
        return items.Select(MapToListItemDto).ToList();
    }

    public async Task<PurchaseOrderDto?> GetPurchaseOrderByIdAsync(long id)
    {
        var po = await _poRepository.GetByIdAsync(id);
        return po == null ? null : MapToDto(po);
    }

    public async Task<string> GetNextPoNumberAsync()
    {
        return await _poRepository.GetNextPoNumberAsync();
    }

    public async Task<PurchaseOrderDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequest request, bool issueImmediately = false)
    {
        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId);
        if (supplier == null)
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");

        if (!string.Equals(supplier.Status, "Active", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Supplier '{supplier.SupplierName}' is inactive and cannot be used for a new Purchase Order.");

        await ValidateOptionalReferencesAsync(request.SupplierId, request.SupplierQuoteId, request.ProjectJobId);

        var poNumber = string.IsNullOrWhiteSpace(request.PoNumber)
            ? await _poRepository.GetNextPoNumberAsync()
            : request.PoNumber.Trim();

        if (await _poRepository.PoNumberExistsAsync(poNumber))
            throw new InvalidOperationException($"PO Number '{poNumber}' already exists.");

        var calculatedItems = BuildCalculatedItems(request.Items);
        var totalAmount = calculatedItems.Sum(i => i.Amount);
        var now = DateTime.UtcNow;

        var po = new PurchaseOrder
        {
            PoNumber = poNumber,
            SupplierId = supplier.Id,
            SupplierQuoteId = request.SupplierQuoteId,
            ProjectJobId = request.ProjectJobId,
            PoDate = DateTime.SpecifyKind(request.PoDate, DateTimeKind.Utc),
            Status = issueImmediately ? "Issued" : "Draft",
            TotalAmount = totalAmount,
            CreatedAt = now,
            UpdatedAt = now,
            IssuedAt = issueImmediately ? now : null,
            Items = calculatedItems
        };

        var created = await _poRepository.AddAsync(po);
        _logger.LogInformation("Created Purchase Order {PoNumber} (ID {PoId}) with status {Status}", created.PoNumber, created.Id, created.Status);
        return MapToDto(created);
    }

    public async Task<PurchaseOrderDto?> UpdateDraftPurchaseOrderAsync(long id, UpdatePurchaseOrderRequest request)
    {
        var existing = await _poRepository.GetByIdAsync(id);
        if (existing == null) return null;

        if (!string.Equals(existing.Status, "Draft", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Purchase Order '{existing.PoNumber}' is '{existing.Status}' and cannot be edited.");

        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId);
        if (supplier == null)
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");

        if (request.SupplierId != existing.SupplierId && !string.Equals(supplier.Status, "Active", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Supplier '{supplier.SupplierName}' is inactive and cannot be selected.");

        await ValidateOptionalReferencesAsync(request.SupplierId, request.SupplierQuoteId, request.ProjectJobId);

        var calculatedItems = BuildCalculatedItems(request.Items);
        var totalAmount = calculatedItems.Sum(i => i.Amount);

        existing.SupplierId = supplier.Id;
        existing.SupplierQuoteId = request.SupplierQuoteId;
        existing.ProjectJobId = request.ProjectJobId;
        existing.PoDate = DateTime.SpecifyKind(request.PoDate, DateTimeKind.Utc);
        existing.TotalAmount = totalAmount;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _poRepository.UpdateAsync(existing, calculatedItems);
        _logger.LogInformation("Updated Draft Purchase Order {PoNumber} (ID {PoId})", updated.PoNumber, updated.Id);
        return MapToDto(updated);
    }

    public async Task<PurchaseOrderDto?> IssuePurchaseOrderAsync(long id)
    {
        var existing = await _poRepository.GetByIdAsync(id);
        if (existing == null) return null;

        if (!string.Equals(existing.Status, "Draft", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Only Draft Purchase Orders can be issued. Current status is '{existing.Status}'.");

        var issued = await _poRepository.IssueAsync(id);
        _logger.LogInformation("Issued Purchase Order {PoNumber} (ID {PoId})", existing.PoNumber, id);
        return issued == null ? null : MapToDto(issued);
    }

    public async Task<bool> CancelPurchaseOrderAsync(long id)
    {
        var existing = await _poRepository.GetByIdAsync(id);
        if (existing == null) return false;

        if (string.Equals(existing.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            return true;

        var success = await _poRepository.CancelAsync(id);
        if (success)
        {
            _logger.LogInformation("Cancelled Purchase Order {PoNumber} (ID {PoId})", existing.PoNumber, id);
        }
        return success;
    }

    private async Task ValidateOptionalReferencesAsync(long supplierId, long? supplierQuoteId, long? projectJobId)
    {
        if (supplierQuoteId.HasValue)
        {
            var quote = await _quoteRepository.GetByIdAsync(supplierQuoteId.Value);
            if (quote == null)
                throw new ArgumentException($"Supplier Quote with ID {supplierQuoteId.Value} does not exist.");
            if (quote.SupplierId != supplierId)
                throw new ArgumentException("Selected Supplier Quote does not belong to the selected Supplier.");
            if (string.Equals(quote.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Cancelled Supplier Quotes cannot be referenced in a Purchase Order.");
        }

        if (projectJobId.HasValue)
        {
            var jobExists = await _poRepository.ProjectJobExistsAsync(projectJobId.Value);
            if (!jobExists)
                throw new ArgumentException($"Project / Job with ID {projectJobId.Value} does not exist.");
        }
    }

    private static List<PurchaseOrderItem> BuildCalculatedItems(List<PurchaseOrderItemInput> inputs)
    {
        if (inputs == null || inputs.Count == 0)
            throw new ArgumentException("At least one purchase order item is required.");

        var result = new List<PurchaseOrderItem>();
        int serial = 1;
        foreach (var item in inputs)
        {
            if (string.IsNullOrWhiteSpace(item.Description))
                throw new ArgumentException($"Item #{serial} description is required.");
            if (item.Quantity <= 0)
                throw new ArgumentException($"Item #{serial} quantity must be greater than zero.");
            if (item.Rate < 0)
                throw new ArgumentException($"Item #{serial} rate cannot be negative.");

            var amount = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            result.Add(new PurchaseOrderItem
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

    private static string? FormatJobLabel(ProductionJob? job)
    {
        if (job == null) return null;
        var cust = job.Order?.CustomerName;
        return string.IsNullOrWhiteSpace(cust) ? job.JobNumber : $"{job.JobNumber} — {cust}";
    }

    private static PurchaseOrderListItemDto MapToListItemDto(PurchaseOrder po)
    {
        return new PurchaseOrderListItemDto
        {
            Id = po.Id,
            PoNumber = po.PoNumber,
            SupplierId = po.SupplierId,
            SupplierName = po.Supplier?.SupplierName ?? "Unknown Supplier",
            SupplierQuoteId = po.SupplierQuoteId,
            SupplierQuoteNumber = po.SupplierQuote?.QuoteNumber,
            ProjectJobId = po.ProjectJobId,
            ProjectJobNumber = po.ProjectJob?.JobNumber,
            ProjectJobLabel = FormatJobLabel(po.ProjectJob),
            PoDate = po.PoDate,
            Status = po.Status,
            TotalAmount = po.TotalAmount,
            ItemCount = po.Items?.Count ?? 0,
            CreatedAt = po.CreatedAt
        };
    }

    private static PurchaseOrderDto MapToDto(PurchaseOrder po)
    {
        return new PurchaseOrderDto
        {
            Id = po.Id,
            PoNumber = po.PoNumber,
            SupplierId = po.SupplierId,
            SupplierName = po.Supplier?.SupplierName ?? "Unknown Supplier",
            SupplierContactPerson = po.Supplier?.ContactPerson,
            SupplierPhone = po.Supplier?.PhoneNumber,
            SupplierEmail = po.Supplier?.Email,
            SupplierAddress = po.Supplier?.Address,
            SupplierQuoteId = po.SupplierQuoteId,
            SupplierQuoteNumber = po.SupplierQuote?.QuoteNumber,
            ProjectJobId = po.ProjectJobId,
            ProjectJobNumber = po.ProjectJob?.JobNumber,
            ProjectJobLabel = FormatJobLabel(po.ProjectJob),
            PoDate = po.PoDate,
            Status = po.Status,
            TotalAmount = po.TotalAmount,
            CreatedAt = po.CreatedAt,
            UpdatedAt = po.UpdatedAt,
            IssuedAt = po.IssuedAt,
            CancelledAt = po.CancelledAt,
            Items = (po.Items ?? new List<PurchaseOrderItem>())
                .OrderBy(i => i.SerialNumber)
                .Select(i => new PurchaseOrderItemDto
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

