using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class ClientService : IClientService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ClientService> _logger;

    public ClientService(IUnitOfWork unitOfWork, ILogger<ClientService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginatedResponse<ClientDto>> GetClientsAsync(string? search, string? status, int page, int pageSize)
    {
        if (pageSize != 10 && pageSize != 25 && pageSize != 50)
        {
            pageSize = 10;
        }

        if (page < 1) page = 1;

        var (items, totalCount) = await _unitOfWork.Clients.GetPaginatedClientsAsync(search, status, page, pageSize);

        return new PaginatedResponse<ClientDto>
        {
            Items = items.Select(MapToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ClientDto?> GetClientByIdAsync(long id)
    {
        var client = await _unitOfWork.Clients.GetClientByIdAsync(id);
        return client == null ? null : MapToDto(client);
    }

    public async Task<(ClientDto? client, DuplicateWarningResponse? duplicateWarning)> CreateClientAsync(CreateClientRequest request, bool force = false)
    {
        var companyName = request.CompanyName.Trim();
        var contactPerson = string.IsNullOrWhiteSpace(request.ContactPerson) ? null : request.ContactPerson.Trim();
        var phone = request.Phone.Trim();
        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        var address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();

        if (!force)
        {
            var existingDuplicate = await CheckDuplicatePhoneAsync(phone);
            if (existingDuplicate != null)
            {
                var duplicateWarning = new DuplicateWarningResponse
                {
                    IsDuplicate = true,
                    Message = $"A customer with phone '{phone}' already exists: '{existingDuplicate.CompanyName}' (ID: #{existingDuplicate.ClientId}).",
                    ExistingClient = existingDuplicate
                };
                return (null, duplicateWarning);
            }
        }

        var client = new Client
        {
            CompanyName = companyName,
            ContactPerson = contactPerson,
            Phone = phone,
            Email = email,
            Address = address,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            DeletedAt = null
        };

        await _unitOfWork.Clients.AddAsync(client);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Created new client with ID {ClientId} and company '{CompanyName}'", client.ClientId, client.CompanyName);

        return (MapToDto(client), null);
    }

    public async Task<ClientDto?> UpdateClientAsync(long id, UpdateClientRequest request)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id);
        if (client == null)
            return null;

        client.CompanyName = request.CompanyName.Trim();
        client.ContactPerson = string.IsNullOrWhiteSpace(request.ContactPerson) ? null : request.ContactPerson.Trim();
        client.Phone = request.Phone.Trim();
        client.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        client.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
        client.IsActive = request.IsActive;
        client.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Clients.Update(client);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Updated client ID {ClientId}", client.ClientId);

        return MapToDto(client);
    }

    public async Task<ClientDto?> UpdateClientStatusAsync(long id, bool isActive)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id);
        if (client == null)
            return null;

        client.IsActive = isActive;
        client.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Clients.Update(client);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Changed active status for client ID {ClientId} to {IsActive}", client.ClientId, isActive);

        return MapToDto(client);
    }

    public async Task<bool> ArchiveClientAsync(long id)
    {
        var success = await _unitOfWork.Clients.SoftDeleteAsync(id);
        if (!success)
            return false;

        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("Soft-deleted (archived) client ID {ClientId}", id);
        return true;
    }

    public async Task<bool> RestoreClientAsync(long id)
    {
        var success = await _unitOfWork.Clients.RestoreAsync(id);
        if (!success)
            return false;

        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("Restored client ID {ClientId}", id);
        return true;
    }

    public async Task<bool> DeleteClientPermanentlyAsync(long id)
    {
        var success = await _unitOfWork.Clients.DeletePermanentlyAsync(id);
        if (!success)
            return false;

        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("Permanently deleted client ID {ClientId}", id);
        return true;
    }

    public async Task<ClientDto?> CheckDuplicatePhoneAsync(string phone, long? excludeClientId = null)
    {
        var normalizedInput = PhoneNormalizer.Normalize(phone);
        if (string.IsNullOrEmpty(normalizedInput))
            return null;

        var candidates = await _unitOfWork.Clients.GetCandidatesForDuplicateCheckAsync(excludeClientId);
        var match = candidates.FirstOrDefault(c => PhoneNormalizer.AreNumbersEqual(c.Phone, phone));
        return match == null ? null : MapToDto(match);
    }

    private static ClientDto MapToDto(Client client)
    {
        return new ClientDto
        {
            ClientId = client.ClientId,
            CompanyName = client.CompanyName,
            ContactPerson = client.ContactPerson,
            Phone = client.Phone,
            Email = client.Email,
            Address = client.Address,
            IsActive = client.IsActive,
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt,
            DeletedAt = client.DeletedAt
        };
    }
}
