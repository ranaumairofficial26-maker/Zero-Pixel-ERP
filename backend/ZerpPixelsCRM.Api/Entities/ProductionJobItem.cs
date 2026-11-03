using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("production_job_items")]
public class ProductionJobItem
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("job_id")]
    public long JobId { get; set; }

    [ForeignKey(nameof(JobId))]
    public ProductionJob Job { get; set; } = null!;

    [Column("order_item_id")]
    public long OrderItemId { get; set; }

    [ForeignKey(nameof(OrderItemId))]
    public PrintingOrderItem OrderItem { get; set; } = null!;
}

