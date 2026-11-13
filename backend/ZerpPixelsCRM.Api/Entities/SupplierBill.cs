using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("supplier_bills")]
public class SupplierBill
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("internal_bill_number")]
    public string InternalBillNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("supplier_invoice_number")]
    public string SupplierInvoiceNumber { get; set; } = string.Empty;

    [Column("supplier_id")]
    public long SupplierId { get; set; }

    [Column("purchase_order_id")]
    public long? PurchaseOrderId { get; set; }

    [Column("bill_date")]
    public DateTime BillDate { get; set; } = DateTime.UtcNow;

    [Column("due_date")]
    public DateTime DueDate { get; set; } = DateTime.UtcNow;

    [MaxLength(1000)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    // Paid amount remains 0 until Page 5: Supplier Payments is implemented.
    [Column("paid_amount")]
    public decimal PaidAmount { get; set; } = 0m;

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Unpaid"; // Unpaid | Partially Paid | Paid | Overdue | Cancelled

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    public virtual Supplier? Supplier { get; set; }
    public virtual PurchaseOrder? PurchaseOrder { get; set; }
    public virtual ICollection<SupplierBillItem> Items { get; set; } = new List<SupplierBillItem>();
}

