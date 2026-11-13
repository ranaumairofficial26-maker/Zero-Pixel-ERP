using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("supplier_quote_items")]
public class SupplierQuoteItem
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("supplier_quote_id")]
    public long SupplierQuoteId { get; set; }

    [Column("serial_number")]
    public int SerialNumber { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("quantity")]
    public decimal Quantity { get; set; }

    [Column("rate")]
    public decimal Rate { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    public virtual SupplierQuote? SupplierQuote { get; set; }
}

