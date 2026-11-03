using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_materials")]
public class PrintingMaterial
{
    [Key]
    [Column("material_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MaterialId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("material_name")]
    public string MaterialName { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("default_length", TypeName = "numeric(10,3)")]
    public decimal? DefaultLength { get; set; }

    [Column("default_width", TypeName = "numeric(10,3)")]
    public decimal? DefaultWidth { get; set; }

    [Column("default_gsm", TypeName = "numeric(10,3)")]
    public decimal? DefaultGsm { get; set; }

    [Column("default_rate_per_kg", TypeName = "numeric(18,4)")]
    public decimal? DefaultRatePerKg { get; set; }

    [Column("default_sheets_per_rim")]
    public int? DefaultSheetsPerRim { get; set; }

    [Column("default_conversion_factor", TypeName = "numeric(12,4)")]
    public decimal? DefaultConversionFactor { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

