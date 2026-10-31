using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("quotations")]
public class Quotation
{
    [Key]
    [Column("quotation_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long QuotationId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("quotation_number")]
    public string QuotationNumber { get; set; } = string.Empty;

    [Column("client_id")]
    public long? ClientId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(150)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("customer_phone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("customer_email")]
    public string? CustomerEmail { get; set; }

    [Column("customer_address")]
    public string? CustomerAddress { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("quotation_type")]
    public string QuotationType { get; set; } = "Printing"; // Printing | Service

    [Required]
    [MaxLength(3)]
    [Column("currency")]
    public string Currency { get; set; } = "PKR";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public ICollection<QuotationRevision> Revisions { get; set; } = new List<QuotationRevision>();
}

