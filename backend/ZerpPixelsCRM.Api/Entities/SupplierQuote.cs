using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("supplier_quotes")]
public class SupplierQuote
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("quote_number")]
    public string QuoteNumber { get; set; } = string.Empty;

    [Column("supplier_id")]
    public long SupplierId { get; set; }

    [MaxLength(100)]
    [Column("supplier_reference_number")]
    public string? SupplierReferenceNumber { get; set; }

    [Column("quote_date")]
    public DateTime QuoteDate { get; set; } = DateTime.UtcNow;

    [Column("description")]
    public string? Description { get; set; }

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Recorded";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual Supplier? Supplier { get; set; }
    public virtual ICollection<SupplierQuoteItem> Items { get; set; } = new List<SupplierQuoteItem>();
}

