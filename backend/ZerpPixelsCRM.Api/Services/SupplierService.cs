using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly ILogger<SupplierService> _logger;

    public SupplierService(ISupplierRepository supplierRepository, ILogger<SupplierService> logger)
    {
        _supplierRepository = supplierRepository;
        _logger = logger;
    }

    public async Task<PaginatedSuppliersResponse> GetSuppliersAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize != 10 && pageSize != 25 && pageSize != 50) pageSize = 10;

        var (items, totalCount) = await _supplierRepository.GetSuppliersAsync(search, page, pageSize);

        return new PaginatedSuppliersResponse
        {
            Items = items.Select(s => new SupplierListItemDto
            {
                Id = s.Id,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                PhoneNumber = s.PhoneNumber,
                Email = s.Email,
                Status = s.Status,
                LeadTimeWorkingDays = s.LeadTimeWorkingDays,
                CreatedAt = s.CreatedAt
            }).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<SupplierDto?> GetSupplierByIdAsync(long id)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        return supplier == null ? null : MapToDto(supplier);
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierRequest request)
    {
        var now = DateTime.UtcNow;
        var supplier = new Supplier
        {
            SupplierName = request.SupplierName.Trim(),
            ContactPerson = TrimOrNull(request.ContactPerson),
            PhoneNumber = TrimOrNull(request.PhoneNumber),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant(),
            Address = TrimOrNull(request.Address),
            LeadTimeWorkingDays = request.LeadTimeWorkingDays,
            BankName = TrimOrNull(request.BankName),
            AccountName = TrimOrNull(request.AccountName),
            AccountNumberOrIban = TrimOrNull(request.AccountNumberOrIban),
            Status = request.Status == "Inactive" ? "Inactive" : "Active",
            CreatedAt = now,
            UpdatedAt = now,
            Services = NormalizeServices(request.Services)
        };

        var created = await _supplierRepository.AddAsync(supplier);
        _logger.LogInformation("Created supplier ID {SupplierId} ({SupplierName})", created.Id, created.SupplierName);
        return MapToDto(created);
    }

    public async Task<SupplierDto?> UpdateSupplierAsync(long id, UpdateSupplierRequest request)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        if (supplier == null) return null;

        supplier.SupplierName = request.SupplierName.Trim();
        supplier.ContactPerson = TrimOrNull(request.ContactPerson);
        supplier.PhoneNumber = TrimOrNull(request.PhoneNumber);
        supplier.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        supplier.Address = TrimOrNull(request.Address);
        supplier.LeadTimeWorkingDays = request.LeadTimeWorkingDays;
        supplier.BankName = TrimOrNull(request.BankName);
        supplier.AccountName = TrimOrNull(request.AccountName);
        supplier.AccountNumberOrIban = TrimOrNull(request.AccountNumberOrIban);
        supplier.Status = request.Status == "Inactive" ? "Inactive" : "Active";
        supplier.UpdatedAt = DateTime.UtcNow;

        supplier.Services.Clear();
        foreach (var svc in NormalizeServices(request.Services))
        {
            supplier.Services.Add(svc);
        }

        var updated = await _supplierRepository.UpdateAsync(supplier);
        _logger.LogInformation("Updated supplier ID {SupplierId}", updated.Id);
        return MapToDto(updated);
    }

    public async Task<bool> DeactivateSupplierAsync(long id)
    {
        var success = await _supplierRepository.DeactivateAsync(id);
        if (success)
        {
            _logger.LogInformation("Deactivated supplier ID {SupplierId}", id);
        }
        return success;
    }

    private static string? TrimOrNull(string? val)
    {
        return string.IsNullOrWhiteSpace(val) ? null : val.Trim();
    }

    private static List<SupplierServiceItem> NormalizeServices(List<string>? services)
    {
        if (services == null || services.Count == 0)
            return new List<SupplierServiceItem>();

        return services
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => s.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(s => new SupplierServiceItem { ServiceName = s })
            .ToList();
    }

    private static SupplierDto MapToDto(Supplier supplier)
    {
        return new SupplierDto
        {
            Id = supplier.Id,
            SupplierName = supplier.SupplierName,
            ContactPerson = supplier.ContactPerson,
            PhoneNumber = supplier.PhoneNumber,
            Email = supplier.Email,
            Address = supplier.Address,
            LeadTimeWorkingDays = supplier.LeadTimeWorkingDays,
            BankName = supplier.BankName,
            AccountName = supplier.AccountName,
            AccountNumberOrIban = supplier.AccountNumberOrIban,
            Status = supplier.Status,
            Services = supplier.Services.Select(s => s.ServiceName).ToList(),
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt
        };
    }
}

