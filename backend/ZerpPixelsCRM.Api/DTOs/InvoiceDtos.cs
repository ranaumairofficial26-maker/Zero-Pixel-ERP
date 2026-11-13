using System.ComponentModel.DataAnnotations;

namespace ZerpPixelsCRM.Api.DTOs;

public class CreateInvoiceItemDto
{
    [MaxLength(50)]
    public string? GrNumber { get; set; }

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.0001, double.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
    public decimal Quantity { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Rate cannot be negative.")]
    public decimal Rate { get; set; }
}

public class CreateInvoiceDto
{
    [Required]
    public long CustomerId { get; set; }

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string? NtnNumber { get; set; }

    [MaxLength(100)]
    public string? ClientPoNumber { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Advance cannot be negative.")]
    public decimal Advance { get; set; } = 0;

    [MaxLength(30)]
    public string AdjustmentType { get; set; } = "advance";

    [Range(0, double.MaxValue, ErrorMessage = "Adjustment rate cannot be negative.")]
    public decimal? AdjustmentRate { get; set; }

    public string? Notes { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one invoice item is required.")]
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class UpdateInvoiceDto
{
    [Required]
    public long CustomerId { get; set; }

    public DateTime InvoiceDate { get; set; }

    [MaxLength(100)]
    public string? NtnNumber { get; set; }

    [MaxLength(100)]
    public string? ClientPoNumber { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Advance cannot be negative.")]
    public decimal Advance { get; set; } = 0;

    [MaxLength(30)]
    public string AdjustmentType { get; set; } = "advance";

    [Range(0, double.MaxValue, ErrorMessage = "Adjustment rate cannot be negative.")]
    public decimal? AdjustmentRate { get; set; }

    public string? Notes { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one invoice item is required.")]
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class InvoiceItemDto
{
    public long Id { get; set; }
    public long InvoiceId { get; set; }
    public int SerialNumber { get; set; }
    public string? GrNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
}

public class InvoiceDto
{
    public long Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public string? NtnNumber { get; set; }
    public string? ClientPoNumber { get; set; }
    public long CustomerId { get; set; }

    // Customer Snapshot
    public string CustomerName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? BillingAddress { get; set; }

    // Totals
    public decimal Total { get; set; }
    public decimal Advance { get; set; }
    public string AdjustmentType { get; set; } = "advance";
    public decimal? AdjustmentRate { get; set; }
    public decimal Balance { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<InvoiceItemDto> Items { get; set; } = new();
}

public class InvoiceListDto
{
    public long Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public long CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Advance { get; set; }
    public string AdjustmentType { get; set; } = "advance";
    public decimal? AdjustmentRate { get; set; }
    public decimal Balance { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PaginatedInvoicesResponse
{
    public List<InvoiceListDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

