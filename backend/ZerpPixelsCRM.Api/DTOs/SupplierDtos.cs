namespace ZerpPixelsCRM.Api.DTOs;

public class SupplierListItemDto
{
    public long Id { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string Status { get; set; } = "Active";
    public int? LeadTimeWorkingDays { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SupplierDto
{
    public long Id { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public int? LeadTimeWorkingDays { get; set; }
    public string? BankName { get; set; }
    public string? AccountName { get; set; }
    public string? AccountNumberOrIban { get; set; }
    public string Status { get; set; } = "Active";
    public List<string> Services { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateSupplierRequest
{
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public int? LeadTimeWorkingDays { get; set; }
    public string? BankName { get; set; }
    public string? AccountName { get; set; }
    public string? AccountNumberOrIban { get; set; }
    public string Status { get; set; } = "Active";
    public List<string>? Services { get; set; }
}

public class UpdateSupplierRequest
{
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public int? LeadTimeWorkingDays { get; set; }
    public string? BankName { get; set; }
    public string? AccountName { get; set; }
    public string? AccountNumberOrIban { get; set; }
    public string Status { get; set; } = "Active";
    public List<string>? Services { get; set; }
}

public class PaginatedSuppliersResponse
{
    public List<SupplierListItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

