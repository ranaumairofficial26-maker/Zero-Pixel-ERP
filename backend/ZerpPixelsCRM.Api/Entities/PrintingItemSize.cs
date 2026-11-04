using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("printing_item_sizes")]
public class PrintingItemSize
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("printing_item_id")]
    public int PrintingItemId { get; set; }

    [ForeignKey(nameof(PrintingItemId))]
    public PrintingItem PrintingItem { get; set; } = null!;

    [Column("size_id")]
    public int SizeId { get; set; }

    [ForeignKey(nameof(SizeId))]
    public PrintingSize PrintingSize { get; set; } = null!;

    [Column("is_default")]
    public bool IsDefault { get; set; } = false;
}

