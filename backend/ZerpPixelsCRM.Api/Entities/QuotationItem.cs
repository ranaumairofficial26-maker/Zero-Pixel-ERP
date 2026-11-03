using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("quotation_items")]
public class QuotationItem
{
    [Key]
    [Column("item_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long ItemId { get; set; }

    [Column("revision_id")]
    public long RevisionId { get; set; }

    [ForeignKey(nameof(RevisionId))]
    public QuotationRevision Revision { get; set; } = null!;

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0;

    [Required]
    [MaxLength(30)]
    [Column("item_type")]
    public string ItemType { get; set; } = "Printing"; // Printing | Service

    [MaxLength(50)]
    [Column("production_type")]
    public string? ProductionType { get; set; } = "IN_HOUSE"; // IN_HOUSE | OUTSOURCED

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

    [MaxLength(50)]
    [Column("service_category")]
    public string? ServiceCategory { get; set; }

    [Column("service_details")]
    public string? ServiceDetails { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }
}

