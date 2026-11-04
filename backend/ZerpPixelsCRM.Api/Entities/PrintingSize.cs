using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_sizes")]
public class PrintingSize
{
    [Key]
    [Column("size_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SizeId { get; set; }

    [Column("size_name")]
    [Required]
    [MaxLength(100)]
    public string SizeName { get; set; } = string.Empty;

    [Column("width_mm", TypeName = "numeric(10,2)")]
    public decimal? WidthMm { get; set; }

    [Column("height_mm", TypeName = "numeric(10,2)")]
    public decimal? HeightMm { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("display_order")]
    public int DisplayOrder { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PrintingItemSize> ItemSizes { get; set; } = new List<PrintingItemSize>();
}

