using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("purchase_orders")]
public class PurchaseOrder
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("po_number")]
    public string PoNumber { get; set; } = string.Empty;

    [Column("supplier_id")]
    public long SupplierId { get; set; }

    [Column("supplier_quote_id")]
    public long? SupplierQuoteId { get; set; }

    [Column("project_job_id")]
    public long? ProjectJobId { get; set; }

    [Column("po_date")]
    public DateTime PoDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Draft"; // Draft | Issued | Cancelled

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("issued_at")]
    public DateTime? IssuedAt { get; set; }

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    public virtual Supplier? Supplier { get; set; }
    public virtual SupplierQuote? SupplierQuote { get; set; }
    public virtual ProductionJob? ProjectJob { get; set; }
    public virtual ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}

