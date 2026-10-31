using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IClientService
{
    Task<PaginatedResponse<ClientDto>> GetClientsAsync(string? search, string? status, int page, int pageSize);
    Task<ClientDto?> GetClientByIdAsync(long id);
    Task<(ClientDto? client, DuplicateWarningResponse? duplicateWarning)> CreateClientAsync(CreateClientRequest request, bool force = false);
    Task<ClientDto?> UpdateClientAsync(long id, UpdateClientRequest request);
    Task<ClientDto?> UpdateClientStatusAsync(long id, bool isActive);
    Task<bool> ArchiveClientAsync(long id);
    Task<bool> RestoreClientAsync(long id);
    Task<bool> DeleteClientPermanentlyAsync(long id);
    Task<ClientDto?> CheckDuplicatePhoneAsync(string phone, long? excludeClientId = null);
}

