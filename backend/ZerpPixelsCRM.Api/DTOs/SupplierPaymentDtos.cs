namespace ZerpPixelsCRM.Api.DTOs;

public class SupplierPaymentListItemDto
{
    public long Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public long SupplierBillId { get; set; }
    public string InternalBillNumber { get; set; } = string.Empty;
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentAccountReference { get; set; }
    public string? TransactionReference { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SupplierPaymentDto
{
    public long Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierContactPerson { get; set; }
    public long SupplierBillId { get; set; }
    public string InternalBillNumber { get; set; } = string.Empty;
    public string SupplierInvoiceNumber { get; set; } = string.Empty;
    public decimal BillTotalAmount { get; set; }
    public decimal BillPaidAmount { get; set; }
    public decimal BillOutstandingBalance { get; set; }
    public string BillStatus { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentAccountReference { get; set; }
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ReversalReason { get; set; }
    public DateTime? ReversedAt { get; set; }
    public string? ReversedBy { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateSupplierPaymentRequest
{
    public long SupplierId { get; set; }
    public long SupplierBillId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentAccountReference { get; set; }
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public string? IdempotencyKey { get; set; }
}

public class ReverseSupplierPaymentRequest
{
    public string ReversalReason { get; set; } = string.Empty;
}

public class PaginatedSupplierPaymentsResponse
{
    public List<SupplierPaymentListItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}
