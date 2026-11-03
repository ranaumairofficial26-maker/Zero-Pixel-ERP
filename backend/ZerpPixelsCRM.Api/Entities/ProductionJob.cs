using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("production_jobs")]
public class ProductionJob
{
    [Key]
    [Column("job_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long JobId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("job_number")]
    public string JobNumber { get; set; } = string.Empty; // e.g. JOB-2026-0001

    [Column("order_id")]
    public long OrderId { get; set; }

    [ForeignKey(nameof(OrderId))]
    public PrintingOrder Order { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    [Column("production_type")]
    public string ProductionType { get; set; } = "IN_HOUSE"; // IN_HOUSE | OUTSOURCED

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Queued";
    // For IN_HOUSE: Queued | In Progress | Printing | Finishing | Quality Check | Completed | Cancelled
    // For OUTSOURCED: Pending Vendor PO | Sent to Vendor | In Production | Received & Inspected | Completed | Cancelled

    [Required]
    [MaxLength(30)]
    [Column("priority")]
    public string Priority { get; set; } = "Normal"; // Normal | High | Urgent

    [Column("target_start_date")]
    public DateTime? TargetStartDate { get; set; }

    [Column("due_date")]
    public DateTime? DueDate { get; set; }

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    // In-House Specific Fields
    [MaxLength(150)]
    [Column("assigned_operator")]
    public string? AssignedOperator { get; set; }

    [MaxLength(150)]
    [Column("machine_name")]
    public string? MachineName { get; set; }

    // Outsourced / Vendor Specific Fields
    [MaxLength(200)]
    [Column("vendor_name")]
    public string? VendorName { get; set; }

    [MaxLength(50)]
    [Column("vendor_phone")]
    public string? VendorPhone { get; set; }

    [MaxLength(200)]
    [Column("vendor_email")]
    public string? VendorEmail { get; set; }

    [MaxLength(100)]
    [Column("vendor_reference")]
    public string? VendorReference { get; set; }

    [Column("outsourced_cost", TypeName = "numeric(18,2)")]
    public decimal? OutsourcedCost { get; set; }

    [Column("expected_delivery_date")]
    public DateTime? ExpectedDeliveryDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<ProductionJobItem> JobItems { get; set; } = new List<ProductionJobItem>();
}

