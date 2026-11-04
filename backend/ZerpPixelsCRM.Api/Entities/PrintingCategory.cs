using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_categories")]
public class PrintingCategory
{
    [Key]
    [Column("category_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CategoryId { get; set; }

    [Column("category_name")]
    [Required]
    [MaxLength(150)]
    public string CategoryName { get; set; } = string.Empty;

    [Column("source_category_name")]
    [MaxLength(150)]
    public string? SourceCategoryName { get; set; }

    [Column("item_count")]
    public int ItemCount { get; set; }

    [Column("item_number_range")]
    [MaxLength(50)]
    public string? ItemNumberRange { get; set; }

    [Column("display_order")]
    public int DisplayOrder { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PrintingItem> Items { get; set; } = new List<PrintingItem>();
}

