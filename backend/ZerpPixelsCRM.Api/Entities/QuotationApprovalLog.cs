using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("quotation_approval_logs")]
public class QuotationApprovalLog
{
    [Key]
    [Column("approval_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long ApprovalId { get; set; }

    [Column("revision_id")]
    public long RevisionId { get; set; }

    [ForeignKey(nameof(RevisionId))]
    public QuotationRevision Revision { get; set; } = null!;

    [Required]
    [MaxLength(30)]
    [Column("decision")]
    public string Decision { get; set; } = "Pending"; // Pending | Approved | Rejected | Revision Requested

    [Required]
    [MaxLength(30)]
    [Column("response_method")]
    public string ResponseMethod { get; set; } = "WhatsApp"; // WhatsApp | Email | Phone Call | Office Visit

    [MaxLength(150)]
    [Column("contact_name")]
    public string? ContactName { get; set; }

    [Column("response_at")]
    public DateTime ResponseAt { get; set; } = DateTime.UtcNow;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

