using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("clients")]
public class Client
{
    [Key]
    [Column("client_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long ClientId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("company_name")]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(150)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("phone")]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("email")]
    public string? Email { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }
}

