using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_cost_estimates")]
public class PrintingCostEstimate
{
    [Key]
    [Column("estimate_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long EstimateId { get; set; }

    [Column("estimate_number")]
    [Required]
    [MaxLength(50)]
    public string EstimateNumber { get; set; } = string.Empty;

    [Column("job_title")]
    [Required]
    [MaxLength(250)]
    public string JobTitle { get; set; } = string.Empty;

    [Column("product_type")]
    [MaxLength(100)]
    public string? ProductType { get; set; }

    [Column("printing_category_id")]
    public int? PrintingCategoryId { get; set; }

    [ForeignKey(nameof(PrintingCategoryId))]
    public PrintingCategory? PrintingCategory { get; set; }

    [Column("printing_item_id")]
    public int? PrintingItemId { get; set; }

    [ForeignKey(nameof(PrintingItemId))]
    public PrintingItem? PrintingItem { get; set; }

    [Column("material_id")]
    public int? MaterialId { get; set; }

    [ForeignKey(nameof(MaterialId))]
    public PrintingMaterial? Material { get; set; }

    [Column("paper_size_id")]
    public int? PaperSizeId { get; set; }

    [ForeignKey(nameof(PaperSizeId))]
    public PaperSize? PaperSize { get; set; }

    [Column("printing_side")]
    [MaxLength(50)]
    public string? PrintingSide { get; set; } // Single, Double, NotApplicable

    [Column("color_mode")]
    [MaxLength(50)]
    public string? ColorMode { get; set; } // 1 Color, 2 Color, 4 Color, Custom, NotApplicable

    [Column("printing_color_count")]
    [Range(0, 10, ErrorMessage = "Printing color count must be between 0 and 10.")]
    public short? PrintingColorCount { get; set; }

    [Column("job_description")]
    public string? JobDescription { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("specifications_snapshot", TypeName = "jsonb")]
    public string? SpecificationsSnapshot { get; set; }

    [Column("material_pricing_snapshot", TypeName = "jsonb")]
    public string? MaterialPricingSnapshot { get; set; }

    [Column("profit_percentage", TypeName = "numeric(8,2)")]
    public decimal ProfitPercentage { get; set; } = 20m;

    [Column("fixed_profit_amount", TypeName = "numeric(18,2)")]
    public decimal? FixedProfitAmount { get; set; }

    [Column("profit_calculation_method")]
    [MaxLength(50)]
    public string ProfitCalculationMethod { get; set; } = "Percentage"; // Percentage, FixedAmount

    [Column("tax_percentage", TypeName = "numeric(8,2)")]
    public decimal TaxPercentage { get; set; } = 0m;

    [Column("tax_calculation_method")]
    [MaxLength(50)]
    public string TaxCalculationMethod { get; set; } = "OnSubtotal"; // OnSubtotal, OnProductionCost

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Draft"; // Draft, Approved, Linked, Archived

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    public ICollection<EstimateQuantity> Quantities { get; set; } = new List<EstimateQuantity>();
}

