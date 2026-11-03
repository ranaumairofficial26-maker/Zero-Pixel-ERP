using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("sheet_calculations")]
public class SheetCalculation
{
    [Key]
    [Column("calculation_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long CalculationId { get; set; }

    [Column("length", TypeName = "numeric(12,3)")]
    public decimal Length { get; set; }

    [Column("width", TypeName = "numeric(12,3)")]
    public decimal Width { get; set; }

    [Column("gsm", TypeName = "numeric(12,3)")]
    public decimal Gsm { get; set; }

    [Column("rate_per_kg", TypeName = "numeric(18,4)")]
    public decimal RatePerKg { get; set; }

    [Column("sheets_per_rim")]
    public int SheetsPerRim { get; set; } = 500;

    [Column("required_sheets")]
    public int RequiredSheets { get; set; } = 500;

    [Column("conversion_factor", TypeName = "numeric(12,4)")]
    public decimal ConversionFactor { get; set; } = 3100m;

    [Column("rim_price", TypeName = "numeric(18,4)")]
    public decimal RimPrice { get; set; }

    [Column("per_sheet_price", TypeName = "numeric(18,4)")]
    public decimal PerSheetPrice { get; set; }

    [Column("total_paper_cost", TypeName = "numeric(18,4)")]
    public decimal TotalPaperCost { get; set; }

    [Column("notes", TypeName = "text")]
    public string? Notes { get; set; }

    [Column("created_at", TypeName = "timestamptz")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
