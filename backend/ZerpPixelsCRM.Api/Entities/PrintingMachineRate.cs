using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_machine_rates")]
public class PrintingMachineRate
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("machine_name")]
    [Required]
    [MaxLength(100)]
    public string MachineName { get; set; } = string.Empty;

    // Group A — Printing Charges
    [Column("print_per_plate")]
    public decimal PrintPerPlate { get; set; }

    [Column("print_per_set")]
    public decimal PrintPerSet { get; set; }

    // Group B — Plate Charges
    [Column("printing_plate")]
    public decimal PrintingPlate { get; set; }

    [Column("plate_per_set")]
    public decimal PlatePerSet { get; set; }

    [Column("display_order")]
    public int DisplayOrder { get; set; } = 0;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

