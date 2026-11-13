using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("supplier_services")]
public class SupplierServiceItem
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("supplier_id")]
    public long SupplierId { get; set; }

    [Required]
    [MaxLength(250)]
    [Column("service_name")]
    public string ServiceName { get; set; } = string.Empty;

    public virtual Supplier? Supplier { get; set; }
}

