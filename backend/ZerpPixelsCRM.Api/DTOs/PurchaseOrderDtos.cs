namespace ZerpPixelsCRM.Api.DTOs;

public class PurchaseOrderItemDto
{
    public long Id { get; set; }
    public int SerialNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
}

public class PurchaseOrderListItemDto
{
    public long Id { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public long? SupplierQuoteId { get; set; }
    public string? SupplierQuoteNumber { get; set; }
    public long? ProjectJobId { get; set; }
    public string? ProjectJobNumber { get; set; }
    public string? ProjectJobLabel { get; set; }
    public DateTime PoDate { get; set; }
    public string Status { get; set; } = "Draft";
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PurchaseOrderDto
{
    public long Id { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierContactPerson { get; set; }
    public string? SupplierPhone { get; set; }
    public string? SupplierEmail { get; set; }
    public string? SupplierAddress { get; set; }
    public long? SupplierQuoteId { get; set; }
    public string? SupplierQuoteNumber { get; set; }
    public long? ProjectJobId { get; set; }
    public string? ProjectJobNumber { get; set; }
    public string? ProjectJobLabel { get; set; }
    public DateTime PoDate { get; set; }
    public string Status { get; set; } = "Draft";
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? IssuedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class PurchaseOrderItemInput
{
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
}

public class CreatePurchaseOrderRequest
{
    public string? PoNumber { get; set; }
    public long SupplierId { get; set; }
    public long? SupplierQuoteId { get; set; }
    public long? ProjectJobId { get; set; }
    public DateTime PoDate { get; set; }
    public List<PurchaseOrderItemInput> Items { get; set; } = new();
}

public class UpdatePurchaseOrderRequest
{
    public long SupplierId { get; set; }
    public long? SupplierQuoteId { get; set; }
    public long? ProjectJobId { get; set; }
    public DateTime PoDate { get; set; }
    public List<PurchaseOrderItemInput> Items { get; set; } = new();
}

public class PaginatedPurchaseOrdersResponse
{
    public List<PurchaseOrderListItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

