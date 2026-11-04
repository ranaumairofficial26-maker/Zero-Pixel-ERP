using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("material_price_profiles")]
public class MaterialPriceProfile
{
    [Key]
    [Column("profile_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ProfileId { get; set; }

    [Column("material_id")]
    public int MaterialId { get; set; }

    [ForeignKey(nameof(MaterialId))]
    public PrintingMaterial Material { get; set; } = null!;

    [Column("paper_size_id")]
    public int? PaperSizeId { get; set; }

    [ForeignKey(nameof(PaperSizeId))]
    public PaperSize? PaperSize { get; set; }

    [Column("variant_name")]
    [MaxLength(150)]
    public string? VariantName { get; set; }

    [Column("gsm", TypeName = "numeric(10,3)")]
    public decimal Gsm { get; set; }

    [Column("pricing_method")]
    [Required]
    [MaxLength(50)]
    public string PricingMethod { get; set; } = "RatePerKg"; // RatePerKg, PacketPrice, DirectRimPrice, DirectSheetPrice, ManualRate

    [Column("rate_per_kg", TypeName = "numeric(18,4)")]
    public decimal? RatePerKg { get; set; }

    [Column("conversion_factor", TypeName = "numeric(12,4)")]
    public decimal ConversionFactor { get; set; } = 3100m;

    [Column("packet_price", TypeName = "numeric(18,4)")]
    public decimal? PacketPrice { get; set; }

    [Column("sheets_per_packet")]
    public int? SheetsPerPacket { get; set; }

    [Column("direct_rim_price", TypeName = "numeric(18,4)")]
    public decimal? DirectRimPrice { get; set; }

    [Column("sheets_per_rim")]
    public int SheetsPerRim { get; set; } = 500;

    [Column("direct_sheet_price", TypeName = "numeric(18,4)")]
    public decimal? DirectSheetPrice { get; set; }

    [Column("computed_per_sheet_price", TypeName = "numeric(18,4)")]
    public decimal ComputedPerSheetPrice { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

