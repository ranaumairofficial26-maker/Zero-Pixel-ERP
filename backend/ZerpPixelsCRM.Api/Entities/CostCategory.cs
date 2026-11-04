using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("cost_categories")]
public class CostCategory
{
    [Key]
    [Column("category_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CategoryId { get; set; }

    [Column("category_name")]
    [Required]
    [MaxLength(150)]
    public string CategoryName { get; set; } = string.Empty;

    [Column("display_order")]
    public int DisplayOrder { get; set; } = 0;

    [Column("default_calculation_method")]
    [MaxLength(50)]
    public string? DefaultCalculationMethod { get; set; } // FixedAmount, ManualAmount, RateXUnits, PerPiece, PerSheet

    [Column("default_rate", TypeName = "numeric(18,4)")]
    public decimal? DefaultRate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

