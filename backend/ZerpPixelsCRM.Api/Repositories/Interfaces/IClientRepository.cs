using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IClientRepository : IRepository<Client>
{
    Task<(IReadOnlyList<Client> Items, int TotalCount)> GetPaginatedClientsAsync(
        string? search, string? status, int page, int pageSize);
    Task<Client?> GetClientByIdAsync(long id);
    Task<IReadOnlyList<Client>> GetCandidatesForDuplicateCheckAsync(long? excludeClientId);
    Task<bool> SoftDeleteAsync(long id);
    Task<bool> RestoreAsync(long id);
    Task<bool> DeletePermanentlyAsync(long id);
}

