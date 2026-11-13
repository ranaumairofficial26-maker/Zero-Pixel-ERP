using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("supplier_payments")]
public class SupplierPayment
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("payment_number")]
    public string PaymentNumber { get; set; } = string.Empty;

    [Column("supplier_id")]
    public long SupplierId { get; set; }

    [Column("supplier_bill_id")]
    public long SupplierBillId { get; set; }

    [Column("payment_date")]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [Column("amount")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("payment_method")]
    public string PaymentMethod { get; set; } = "Bank Transfer"; // Cash | Bank Transfer | Cheque

    [MaxLength(150)]
    [Column("payment_account_reference")]
    public string? PaymentAccountReference { get; set; }

    [MaxLength(150)]
    [Column("transaction_reference")]
    public string? TransactionReference { get; set; }

    [MaxLength(1000)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Posted"; // Posted | Reversed

    [MaxLength(500)]
    [Column("reversal_reason")]
    public string? ReversalReason { get; set; }

    [Column("reversed_at")]
    public DateTime? ReversedAt { get; set; }

    [MaxLength(150)]
    [Column("reversed_by")]
    public string? ReversedBy { get; set; }

    [MaxLength(150)]
    [Column("created_by")]
    public string? CreatedBy { get; set; }

    [MaxLength(100)]
    [Column("idempotency_key")]
    public string? IdempotencyKey { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual Supplier? Supplier { get; set; }
    public virtual SupplierBill? SupplierBill { get; set; }
}
