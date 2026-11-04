using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_items")]
public class PrintingItem
{
    [Key]
    [Column("item_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ItemId { get; set; }

    [Column("category_id")]
    public int CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public PrintingCategory Category { get; set; } = null!;

    [Column("source_item_number")]
    public int? SourceItemNumber { get; set; }

    [Column("item_name")]
    [Required]
    [MaxLength(250)]
    public string ItemName { get; set; } = string.Empty;

    [Column("default_width_mm", TypeName = "numeric(10,2)")]
    public decimal? DefaultWidthMm { get; set; }

    [Column("default_height_mm", TypeName = "numeric(10,2)")]
    public decimal? DefaultHeightMm { get; set; }

    [Column("inches_str")]
    [MaxLength(50)]
    public string? InchesStr { get; set; }

    [Column("cm_str")]
    [MaxLength(50)]
    public string? CmStr { get; set; }

    [Column("mm_str")]
    [MaxLength(50)]
    public string? MmStr { get; set; }

    [Column("sizing_basis")]
    [MaxLength(100)]
    public string? SizingBasis { get; set; }

    [Column("source_notes")]
    public string? SourceNotes { get; set; }

    [Column("is_custom")]
    public bool IsCustom { get; set; } = false;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

