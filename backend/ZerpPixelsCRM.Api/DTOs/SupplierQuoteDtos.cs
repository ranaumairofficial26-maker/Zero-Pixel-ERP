namespace ZerpPixelsCRM.Api.DTOs;

public class SupplierQuoteItemDto
{
    public long Id { get; set; }
    public int SerialNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
}

public class SupplierQuoteListItemDto
{
    public long Id { get; set; }
    public string QuoteNumber { get; set; } = string.Empty;
    public string? SupplierReferenceNumber { get; set; }
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime QuoteDate { get; set; }
    public string? Description { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Recorded";
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SupplierQuoteDto
{
    public long Id { get; set; }
    public string QuoteNumber { get; set; } = string.Empty;
    public string? SupplierReferenceNumber { get; set; }
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierContactPerson { get; set; }
    public string? SupplierPhone { get; set; }
    public string? SupplierEmail { get; set; }
    public DateTime QuoteDate { get; set; }
    public string? Description { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Recorded";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<SupplierQuoteItemDto> Items { get; set; } = new();
}

public class SupplierQuoteItemInput
{
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
}

public class CreateSupplierQuoteRequest
{
    public string? QuoteNumber { get; set; }
    public string? SupplierReferenceNumber { get; set; }
    public long SupplierId { get; set; }
    public DateTime QuoteDate { get; set; }
    public string? Description { get; set; }
    public List<SupplierQuoteItemInput> Items { get; set; } = new();
}

public class UpdateSupplierQuoteRequest
{
    public string? SupplierReferenceNumber { get; set; }
    public long SupplierId { get; set; }
    public DateTime QuoteDate { get; set; }
    public string? Description { get; set; }
    public List<SupplierQuoteItemInput> Items { get; set; } = new();
}

public class PaginatedSupplierQuotesResponse
{
    public List<SupplierQuoteListItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

