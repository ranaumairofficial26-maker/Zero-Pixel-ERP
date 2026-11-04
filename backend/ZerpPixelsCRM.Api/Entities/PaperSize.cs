using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("paper_sizes")]
public class PaperSize
{
    [Key]
    [Column("paper_size_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int PaperSizeId { get; set; }

    [Column("size_name")]
    [Required]
    [MaxLength(100)]
    public string SizeName { get; set; } = string.Empty;

    [Column("length_inches", TypeName = "numeric(10,3)")]
    public decimal? LengthInches { get; set; }

    [Column("width_inches", TypeName = "numeric(10,3)")]
    public decimal? WidthInches { get; set; }

    [Column("width_mm", TypeName = "numeric(10,2)")]
    public decimal? WidthMm { get; set; }

    [Column("height_mm", TypeName = "numeric(10,2)")]
    public decimal? HeightMm { get; set; }

    [Column("size_type")]
    [MaxLength(50)]
    public string SizeType { get; set; } = "StockPaper"; // StockPaper, FinishedProduct, SizeGuide

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

