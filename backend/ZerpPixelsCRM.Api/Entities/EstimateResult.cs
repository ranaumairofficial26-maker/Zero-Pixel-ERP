using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("estimate_results")]
public class EstimateResult
{
    [Key]
    [Column("result_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long ResultId { get; set; }

    [Column("estimate_quantity_id")]
    public long EstimateQuantityId { get; set; }

    [ForeignKey(nameof(EstimateQuantityId))]
    public EstimateQuantity EstimateQuantity { get; set; } = null!;

    [Column("paper_cost", TypeName = "numeric(18,4)")]
    public decimal PaperCost { get; set; }

    [Column("additional_expenses", TypeName = "numeric(18,4)")]
    public decimal AdditionalExpenses { get; set; }

    [Column("production_cost", TypeName = "numeric(18,4)")]
    public decimal ProductionCost { get; set; }

    [Column("profit_amount", TypeName = "numeric(18,4)")]
    public decimal ProfitAmount { get; set; }

    [Column("subtotal", TypeName = "numeric(18,4)")]
    public decimal Subtotal { get; set; }

    [Column("tax_amount", TypeName = "numeric(18,4)")]
    public decimal TaxAmount { get; set; }

    [Column("grand_total", TypeName = "numeric(18,4)")]
    public decimal GrandTotal { get; set; }

    [Column("per_piece_cost", TypeName = "numeric(18,4)")]
    public decimal PerPieceCost { get; set; }

    [Column("calculated_at")]
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}

