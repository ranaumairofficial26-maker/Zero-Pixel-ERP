using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("quotation_revisions")]
public class QuotationRevision
{
    [Key]
    [Column("revision_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long RevisionId { get; set; }

    [Column("quotation_id")]
    public long QuotationId { get; set; }

    [ForeignKey(nameof(QuotationId))]
    public Quotation Quotation { get; set; } = null!;

    [Column("revision_number")]
    public int RevisionNumber { get; set; } = 1;

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Draft"; // Draft | Finalized | Converted | Expired

    [Column("quotation_date")]
    public DateTime QuotationDate { get; set; } = DateTime.UtcNow;

    [Column("valid_until")]
    public DateTime ValidUntil { get; set; } = DateTime.UtcNow.AddDays(14);

    [Column("subtotal", TypeName = "numeric(18,2)")]
    public decimal Subtotal { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("discount_type")]
    public string DiscountType { get; set; } = "None"; // None | Fixed | Percentage

    [Column("discount_value", TypeName = "numeric(18,2)")]
    public decimal DiscountValue { get; set; }

    [Column("discount_amount", TypeName = "numeric(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column("tax_rate", TypeName = "numeric(8,4)")]
    public decimal TaxRate { get; set; }

    [Column("tax_amount", TypeName = "numeric(18,2)")]
    public decimal TaxAmount { get; set; }

    [Column("grand_total", TypeName = "numeric(18,2)")]
    public decimal GrandTotal { get; set; }

    [Column("internal_notes")]
    public string? InternalNotes { get; set; }

    [Column("customer_notes")]
    public string? CustomerNotes { get; set; }

    [Column("terms_and_conditions")]
    public string? TermsAndConditions { get; set; }

    [Column("finalized_at")]
    public DateTime? FinalizedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public ICollection<QuotationItem> Items { get; set; } = new List<QuotationItem>();
    public ICollection<QuotationSendLog> SendLogs { get; set; } = new List<QuotationSendLog>();
    public ICollection<QuotationApprovalLog> ApprovalLogs { get; set; } = new List<QuotationApprovalLog>();
}

