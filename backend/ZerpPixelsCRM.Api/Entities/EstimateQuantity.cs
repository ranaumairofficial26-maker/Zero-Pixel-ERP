using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("estimate_quantities")]
public class EstimateQuantity
{
    [Key]
    [Column("estimate_quantity_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long EstimateQuantityId { get; set; }

    [Column("estimate_id")]
    public long EstimateId { get; set; }

    [ForeignKey(nameof(EstimateId))]
    public PrintingCostEstimate Estimate { get; set; } = null!;

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("sheets_required", TypeName = "numeric(12,2)")]
    public decimal SheetsRequired { get; set; }

    [Column("wastage_percentage", TypeName = "numeric(8,2)")]
    public decimal WastagePercentage { get; set; } = 0m;

    [Column("paper_cost", TypeName = "numeric(18,4)")]
    public decimal PaperCost { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0;

    public ICollection<EstimateCostItem> CostItems { get; set; } = new List<EstimateCostItem>();

    public EstimateResult? Result { get; set; }
}

