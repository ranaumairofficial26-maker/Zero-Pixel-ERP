using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZerpPixelsCRM.Api.Entities;

[Table("suppliers")]
public class Supplier
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("supplier_name")]
    public string SupplierName { get; set; } = string.Empty;

    [MaxLength(150)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    [MaxLength(30)]
    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [MaxLength(200)]
    [Column("email")]
    public string? Email { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("lead_time_working_days")]
    public int? LeadTimeWorkingDays { get; set; }

    [MaxLength(150)]
    [Column("bank_name")]
    public string? BankName { get; set; }

    [MaxLength(200)]
    [Column("account_name")]
    public string? AccountName { get; set; }

    [MaxLength(100)]
    [Column("account_number_or_iban")]
    public string? AccountNumberOrIban { get; set; }

    [MaxLength(64)]
    [Column("account_number_hash")]
    public string? AccountNumberHash { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Active";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<SupplierServiceItem> Services { get; set; } = new List<SupplierServiceItem>();
}

