using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("production_job_sheets")]
public class ProductionJobSheet
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("job_card_number")]
    public string JobCardNumber { get; set; } = string.Empty;

    [Required]
    [Column("job_date")]
    public DateTime JobDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(150)]
    [Column("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [Column("job_name")]
    public string JobName { get; set; } = string.Empty;

    [Required]
    [Column("quantity")]
    public int Quantity { get; set; }

    [MaxLength(100)]
    [Column("paper_size")]
    public string? PaperSize { get; set; }

    [MaxLength(100)]
    [Column("paper_type")]
    public string? PaperType { get; set; }

    [Column("gsm")]
    public int? Gsm { get; set; }

    // Printing Details
    [MaxLength(100)]
    [Column("printing_sheet_size")]
    public string? PrintingSheetSize { get; set; }

    [MaxLength(50)]
    [Column("printing_colors")]
    public string? PrintingColors { get; set; }

    [MaxLength(50)]
    [Column("printing_side")]
    public string? PrintingSide { get; set; }

    [MaxLength(50)]
    [Column("printing_method")]
    public string? PrintingMethod { get; set; }

    [MaxLength(100)]
    [Column("printing_method_other")]
    public string? PrintingMethodOther { get; set; }

    [MaxLength(100)]
    [Column("printing_machine")]
    public string? PrintingMachine { get; set; }

    [MaxLength(100)]
    [Column("printing_operator")]
    public string? PrintingOperator { get; set; }

    [Column("printing_start_date")]
    public DateTime? PrintingStartDate { get; set; }

    [Column("printing_completion_date")]
    public DateTime? PrintingCompletionDate { get; set; }

    // Finishing Details
    [MaxLength(50)]
    [Column("lamination")]
    public string? Lamination { get; set; }

    [MaxLength(100)]
    [Column("lamination_other")]
    public string? LaminationOther { get; set; }

    [MaxLength(50)]
    [Column("die_cutting")]
    public string? DieCutting { get; set; }

    [MaxLength(50)]
    [Column("binding")]
    public string? Binding { get; set; }

    [MaxLength(100)]
    [Column("binding_other")]
    public string? BindingOther { get; set; }

    [MaxLength(50)]
    [Column("uv_coating")]
    public string? UvCoating { get; set; }

    [MaxLength(50)]
    [Column("packing")]
    public string? Packing { get; set; }

    [MaxLength(500)]
    [Column("packing_instructions")]
    public string? PackingInstructions { get; set; }

    // Special Instructions
    [MaxLength(2000)]
    [Column("special_instructions")]
    public string? SpecialInstructions { get; set; }

    // Approval
    [MaxLength(100)]
    [Column("production_supervisor")]
    public string? ProductionSupervisor { get; set; }

    [MaxLength(100)]
    [Column("authorized_by")]
    public string? AuthorizedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

