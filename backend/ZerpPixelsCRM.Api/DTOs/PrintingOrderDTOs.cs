namespace ZerpPixelsCRM.Api.DTOs;

public class PrintingOrderDto
{
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public long QuotationId { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public long RevisionId { get; set; }
    public int RevisionNumber { get; set; }
    public long? ClientId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerAddress { get; set; }
    public string Status { get; set; } = "Pending Review";
    public string ProductionType { get; set; } = "IN_HOUSE";
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string? Notes { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public string? ConfirmedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<PrintingOrderItemDto> Items { get; set; } = new();
    public List<ProductionJobSummaryDto> ProductionJobs { get; set; } = new();
}

public class PrintingOrderItemDto
{
    public long OrderItemId { get; set; }
    public long OrderId { get; set; }
    public long? QuotationItemId { get; set; }
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
    public string ProductionType { get; set; } = "IN_HOUSE";
    public string? Notes { get; set; }
}

public class ConvertQuotationToOrderRequest
{
    public long RevisionId { get; set; }
    public string? Notes { get; set; }
}

public class UpdateOrderItemsProductionTypeRequest
{
    public string? OverallProductionType { get; set; }
    public List<OrderItemProductionTypeUpdate> Items { get; set; } = new();
}

public class OrderItemProductionTypeUpdate
{
    public long OrderItemId { get; set; }
    public string ProductionType { get; set; } = "IN_HOUSE"; // IN_HOUSE | OUTSOURCED
}

public class ConfirmPrintingOrderRequest
{
    public string? ConfirmedBy { get; set; } = "Admin";
    public string? Notes { get; set; }
    public List<OrderItemProductionTypeUpdate>? Items { get; set; }
}

public class ProductionJobDto
{
    public long JobId { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string ProductionType { get; set; } = "IN_HOUSE";
    public string Status { get; set; } = "Queued";
    public string Priority { get; set; } = "Normal";
    public DateTime? TargetStartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }

    // In-House
    public string? AssignedOperator { get; set; }
    public string? MachineName { get; set; }

    // Outsourced
    public string? VendorName { get; set; }
    public string? VendorPhone { get; set; }
    public string? VendorEmail { get; set; }
    public string? VendorReference { get; set; }
    public decimal? OutsourcedCost { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }

    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<PrintingOrderItemDto> Items { get; set; } = new();
}

public class ProductionJobSummaryDto
{
    public long JobId { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public string ProductionType { get; set; } = "IN_HOUSE";
    public string Status { get; set; } = "Queued";
    public string? AssignedOperator { get; set; }
    public string? VendorName { get; set; }
    public int ItemCount { get; set; }
}

public class UpdateProductionJobRequest
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public DateTime? TargetStartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }

    // In-House
    public string? AssignedOperator { get; set; }
    public string? MachineName { get; set; }

    // Outsourced
    public string? VendorName { get; set; }
    public string? VendorPhone { get; set; }
    public string? VendorEmail { get; set; }
    public string? VendorReference { get; set; }
    public decimal? OutsourcedCost { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }

    public string? Notes { get; set; }
}

