using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("estimate_cost_items")]
public class EstimateCostItem
{
    [Key]
    [Column("cost_item_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long CostItemId { get; set; }

    [Column("estimate_quantity_id")]
    public long EstimateQuantityId { get; set; }

    [ForeignKey(nameof(EstimateQuantityId))]
    public EstimateQuantity EstimateQuantity { get; set; } = null!;

    [Column("category_id")]
    public int? CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public CostCategory? Category { get; set; }

    [Column("expense_name_snapshot")]
    [Required]
    [MaxLength(150)]
    public string ExpenseNameSnapshot { get; set; } = string.Empty;

    [Column("calculation_method")]
    [Required]
    [MaxLength(50)]
    public string CalculationMethod { get; set; } = "FixedAmount"; // FixedAmount, ManualAmount, RateXUnits, PerPiece, PerSheet

    [Column("unit_rate", TypeName = "numeric(18,4)")]
    public decimal UnitRate { get; set; } = 0m;

    [Column("units", TypeName = "numeric(12,3)")]
    public decimal Units { get; set; } = 1m;

    [Column("amount", TypeName = "numeric(18,4)")]
    public decimal Amount { get; set; } = 0m;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0;
}

