namespace ZerpPixelsCRM.Api.DTOs;

public class QuotationListItemDto
{
    public long QuotationId { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public long RevisionId { get; set; }
    public int RevisionNumber { get; set; }
    public string QuotationType { get; set; } = string.Empty;
    public DateTime QuotationDate { get; set; }
    public DateTime ValidUntil { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public string ProductSummary { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public string Currency { get; set; } = "PKR";
    public string Status { get; set; } = "Draft";
    public string ProductionType { get; set; } = "IN_HOUSE";
    public string SendingStatus { get; set; } = "Not Sent";
    public string ApprovalStatus { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}

public class QuotationSummaryDto
{
    public int TotalQuotations { get; set; }
    public int DraftQuotations { get; set; }
    public int FinalizedQuotations { get; set; }
    public int ApprovedQuotations { get; set; }
    public int ExpiredQuotations { get; set; }
    public int ConvertedQuotations { get; set; }
}

public class QuotationDetailsDto
{
    public long QuotationId { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public long? ClientId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerAddress { get; set; }
    public string QuotationType { get; set; } = "Printing";
    public string Currency { get; set; } = "PKR";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public QuotationRevisionDto ActiveRevision { get; set; } = null!;
    public List<QuotationRevisionSummaryDto> Revisions { get; set; } = new();
}

public class QuotationRevisionSummaryDto
{
    public long RevisionId { get; set; }
    public int RevisionNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime QuotationDate { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTime? FinalizedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class QuotationRevisionDto
{
    public long RevisionId { get; set; }
    public long QuotationId { get; set; }
    public int RevisionNumber { get; set; }
    public string Status { get; set; } = "Draft";
    public string ProductionType { get; set; } = "IN_HOUSE";
    public long? LinkedOrderId { get; set; }
    public string? LinkedOrderNumber { get; set; }
    public string? LinkedOrderStatus { get; set; }
    public DateTime QuotationDate { get; set; }
    public DateTime ValidUntil { get; set; }
    public decimal Subtotal { get; set; }
    public string DiscountType { get; set; } = "None";
    public decimal DiscountValue { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string? InternalNotes { get; set; }
    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }
    public DateTime? FinalizedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<QuotationItemDto> Items { get; set; } = new();
    public List<QuotationSendLogDto> SendLogs { get; set; } = new();
    public List<QuotationApprovalLogDto> ApprovalLogs { get; set; } = new();
}

public class QuotationItemDto
{
    public long ItemId { get; set; }
    public long RevisionId { get; set; }
    public int SortOrder { get; set; }
    public string ItemType { get; set; } = "Printing";
    public string ProductionType { get; set; } = "IN_HOUSE";
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SizeDimensions { get; set; }
    public string? Material { get; set; }
    public string? Gsm { get; set; }
    public string? PrintingColor { get; set; }
    public string? Finishing { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "pcs";
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string? ServiceCategory { get; set; }
    public string? ServiceDetails { get; set; }
    public string? Notes { get; set; }
}

public class QuotationSendLogDto
{
    public long SendId { get; set; }
    public long RevisionId { get; set; }
    public string SendMethod { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public DateTime MarkedSentAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class QuotationApprovalLogDto
{
    public long ApprovalId { get; set; }
    public long RevisionId { get; set; }
    public string Decision { get; set; } = string.Empty;
    public string ResponseMethod { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public DateTime ResponseAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateQuotationRequest
{
    public long? ClientId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerAddress { get; set; }

    public string QuotationType { get; set; } = "Printing"; // Printing | Service
    public string ProductionType { get; set; } = "IN_HOUSE"; // IN_HOUSE | OUTSOURCED
    public string Currency { get; set; } = "PKR";
    public DateTime? QuotationDate { get; set; }
    public DateTime? ValidUntil { get; set; }

    public string DiscountType { get; set; } = "None"; // None | Fixed | Percentage
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }

    public string? InternalNotes { get; set; }
    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }

    public List<CreateQuotationItemRequest> Items { get; set; } = new();
}

public class CreateQuotationItemRequest
{
    public int SortOrder { get; set; }
    public string ItemType { get; set; } = "Printing";
    public string? ProductionType { get; set; } = "IN_HOUSE";
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SizeDimensions { get; set; }
    public string? Material { get; set; }
    public string? Gsm { get; set; }
    public string? PrintingColor { get; set; }
    public string? Finishing { get; set; }
    public decimal Quantity { get; set; } = 1;
    public string Unit { get; set; } = "pcs";
    public decimal UnitPrice { get; set; }
    public string? ServiceCategory { get; set; }
    public string? ServiceDetails { get; set; }
    public string? Notes { get; set; }
}

public class UpdateDraftQuotationRequest : CreateQuotationRequest
{
}

public class RecordSendLogRequest
{
    public long RevisionId { get; set; }
    public string SendMethod { get; set; } = "WhatsApp"; // WhatsApp | Email | Manual
    public string Recipient { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class RecordApprovalLogRequest
{
    public long RevisionId { get; set; }
    public string Decision { get; set; } = "Approved"; // Approved | Rejected | Revision Requested
    public string ResponseMethod { get; set; } = "WhatsApp"; // WhatsApp | Email | Phone Call | Office Visit
    public string? ContactName { get; set; }
    public string? Notes { get; set; }
}

