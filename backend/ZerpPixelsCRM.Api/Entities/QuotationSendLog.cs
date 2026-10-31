using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("quotation_send_logs")]
public class QuotationSendLog
{
    [Key]
    [Column("send_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long SendId { get; set; }

    [Column("revision_id")]
    public long RevisionId { get; set; }

    [ForeignKey(nameof(RevisionId))]
    public QuotationRevision Revision { get; set; } = null!;

    [Required]
    [MaxLength(30)]
    [Column("send_method")]
    public string SendMethod { get; set; } = "WhatsApp"; // WhatsApp | Email | Manual

    [Required]
    [MaxLength(200)]
    [Column("recipient")]
    public string Recipient { get; set; } = string.Empty;

    [Column("marked_sent_at")]
    public DateTime MarkedSentAt { get; set; } = DateTime.UtcNow;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

