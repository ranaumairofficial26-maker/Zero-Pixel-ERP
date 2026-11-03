using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_orders")]
public class PrintingOrder
{
    [Key]
    [Column("order_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long OrderId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("order_number")]
    public string OrderNumber { get; set; } = string.Empty; // e.g. ORD-2026-0001

    [Column("quotation_id")]
    public long QuotationId { get; set; }

    [ForeignKey(nameof(QuotationId))]
    public Quotation Quotation { get; set; } = null!;

    [Column("revision_id")]
    public long RevisionId { get; set; }

    [ForeignKey(nameof(RevisionId))]
    public QuotationRevision Revision { get; set; } = null!;

    [Column("client_id")]
    public long? ClientId { get; set; }

    [ForeignKey(nameof(ClientId))]
    public Client? Client { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(150)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("customer_phone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("customer_email")]
    public string? CustomerEmail { get; set; }

    [Column("customer_address")]
    public string? CustomerAddress { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending Review"; // Pending Review | Confirmed | In Production | Completed | Cancelled

    [Required]
    [MaxLength(50)]
    [Column("production_type")]
    public string ProductionType { get; set; } = "IN_HOUSE"; // IN_HOUSE | OUTSOURCED | MIXED

    [Column("subtotal", TypeName = "numeric(18,2)")]
    public decimal Subtotal { get; set; }

    [Column("discount_amount", TypeName = "numeric(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column("tax_amount", TypeName = "numeric(18,2)")]
    public decimal TaxAmount { get; set; }

    [Column("grand_total", TypeName = "numeric(18,2)")]
    public decimal GrandTotal { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("confirmed_at")]
    public DateTime? ConfirmedAt { get; set; }

    [MaxLength(100)]
    [Column("confirmed_by")]
    public string? ConfirmedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<PrintingOrderItem> Items { get; set; } = new List<PrintingOrderItem>();
    public ICollection<ProductionJob> ProductionJobs { get; set; } = new List<ProductionJob>();
}

