using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_order_items")]
public class PrintingOrderItem
{
    [Key]
    [Column("order_item_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long OrderItemId { get; set; }

    [Column("order_id")]
    public long OrderId { get; set; }

    [ForeignKey(nameof(OrderId))]
    public PrintingOrder Order { get; set; } = null!;

    [Column("quotation_item_id")]
    public long? QuotationItemId { get; set; }

    [ForeignKey(nameof(QuotationItemId))]
    public QuotationItem? QuotationItem { get; set; }

    [Required]
    [MaxLength(250)]
    [Column("product_name")]
    public string ProductName { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(150)]
    [Column("size_dimensions")]
    public string? SizeDimensions { get; set; }

    [MaxLength(150)]
    [Column("material")]
    public string? Material { get; set; }

    [MaxLength(50)]
    [Column("gsm")]
    public string? Gsm { get; set; }

    [MaxLength(100)]
    [Column("printing_color")]
    public string? PrintingColor { get; set; }

    [MaxLength(150)]
    [Column("finishing")]
    public string? Finishing { get; set; }

    [Column("quantity", TypeName = "numeric(18,3)")]
    public decimal Quantity { get; set; } = 1;

    [Required]
    [MaxLength(50)]
    [Column("unit")]
    public string Unit { get; set; } = "pcs";

    [Column("unit_price", TypeName = "numeric(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column("line_total", TypeName = "numeric(18,2)")]
    public decimal LineTotal { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("production_type")]
    public string ProductionType { get; set; } = "IN_HOUSE"; // IN_HOUSE | OUTSOURCED

    [Column("notes")]
    public string? Notes { get; set; }
}

