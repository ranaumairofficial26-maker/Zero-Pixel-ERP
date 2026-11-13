using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("invoice_items")]
public class InvoiceItem
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("invoice_id")]
    public long InvoiceId { get; set; }

    [Column("serial_number")]
    public int SerialNumber { get; set; }

    [MaxLength(50)]
    [Column("gr_number")]
    public string? GrNumber { get; set; }

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

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Invoice? Invoice { get; set; }
}

