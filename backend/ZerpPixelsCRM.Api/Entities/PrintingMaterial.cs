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

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

