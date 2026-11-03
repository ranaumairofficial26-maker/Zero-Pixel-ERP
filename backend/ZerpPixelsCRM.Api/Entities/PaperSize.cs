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

    [Required]
    [MaxLength(100)]
    [Column("size_name")]
    public string SizeName { get; set; } = string.Empty;

    [Column("length_inches", TypeName = "numeric(10,3)")]
    public decimal LengthInches { get; set; }

    [Column("width_inches", TypeName = "numeric(10,3)")]
    public decimal WidthInches { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at", TypeName = "timestamptz")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at", TypeName = "timestamptz")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

