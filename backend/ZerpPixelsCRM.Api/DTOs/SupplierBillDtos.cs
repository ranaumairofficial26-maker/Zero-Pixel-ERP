namespace ZerpPixelsCRM.Api.DTOs;

public class SupplierBillItemDto
{
    public long Id { get; set; }
    public int SerialNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
}

public class SupplierBillListItemDto
{
    public long Id { get; set; }
    public string InternalBillNumber { get; set; } = string.Empty;
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public long? PurchaseOrderId { get; set; }
    public string? PurchaseOrderNumber { get; set; }
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SupplierBillDto
{
    public long Id { get; set; }
    public string InternalBillNumber { get; set; } = string.Empty;
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierContactPerson { get; set; }
    public string? SupplierPhone { get; set; }
    public string? SupplierEmail { get; set; }
    public string? SupplierAddress { get; set; }
    public long? PurchaseOrderId { get; set; }
    public string? PurchaseOrderNumber { get; set; }
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    public string? Description { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public List<SupplierBillItemDto> Items { get; set; } = new();
}

public class SupplierBillItemInputDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
}

public class CreateSupplierBillRequest
{
    public string? InternalBillNumber { get; set; }
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public long? PurchaseOrderId { get; set; }
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    public string? Description { get; set; }
    public List<SupplierBillItemInputDto> Items { get; set; } = new();
}

public class UpdateSupplierBillRequest
{
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public long? PurchaseOrderId { get; set; }
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    public string? Description { get; set; }
    public List<SupplierBillItemInputDto> Items { get; set; } = new();
}

public class PaginatedSupplierBillsResponse
{
    public List<SupplierBillListItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

public class SupplierBillSummaryDto
{
    public decimal OutstandingPayables { get; set; }
    public int OverdueBillsCount { get; set; }
    public string PaidThisMonth { get; set; } = "Not Available";
}

public class SupplierBillAgingItemDto
{
    public long BillId { get; set; }
    public string InternalBillNumber { get; set; } = string.Empty;
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }
    public int DaysOverdue { get; set; }
    public string AgingCategory { get; set; } = string.Empty; // Not Yet Due | 1-30 Days | 31-60 Days | 61-90 Days | Over 90 Days
}

public class SupplierBillAgingReportDto
{
    public decimal TotalOutstanding { get; set; }
    public decimal TotalNotYetDue { get; set; }
    public decimal Total1To30Days { get; set; }
    public decimal Total31To60Days { get; set; }
    public decimal Total61To90Days { get; set; }
    public decimal TotalOver90Days { get; set; }
    public List<SupplierBillAgingItemDto> Items { get; set; } = new();
}

