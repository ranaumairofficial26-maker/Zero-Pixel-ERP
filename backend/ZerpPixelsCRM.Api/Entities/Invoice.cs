using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("invoices")]
public class Invoice
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("invoice_number")]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Column("invoice_date")]
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    [Column("ntn_number")]
    public string? NtnNumber { get; set; }

    [MaxLength(100)]
    [Column("client_po_number")]
    public string? ClientPoNumber { get; set; }

    [Column("customer_id")]
    public long CustomerId { get; set; }

    // Customer Snapshot fields (ensures historical integrity)
    [Required]
    [MaxLength(200)]
    [Column("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("company_name")]
    public string? CompanyName { get; set; }

    [MaxLength(50)]
    [Column("contact_number")]
    public string ContactNumber { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("email")]
    public string? Email { get; set; }

    [Column("billing_address")]
    public string? BillingAddress { get; set; }

    // Financial Totals
    [Column("total")]
    public decimal Total { get; set; }

    [Column("advance")]
    public decimal Advance { get; set; }

    [MaxLength(30)]
    [Column("adjustment_type")]
    public string AdjustmentType { get; set; } = "advance";

    [Column("adjustment_rate")]
    public decimal? AdjustmentRate { get; set; }

    [Column("balance")]
    public decimal Balance { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Client? Customer { get; set; }

    public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}

