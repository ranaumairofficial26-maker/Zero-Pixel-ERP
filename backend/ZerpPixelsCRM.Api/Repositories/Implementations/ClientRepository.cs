using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class ClientRepository : Repository<Client>, IClientRepository
{
    public ClientRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Client> Items, int TotalCount)> GetPaginatedClientsAsync(
        string? search, string? status, int page, int pageSize)
    {
        var query = _dbSet.AsNoTracking().AsQueryable();

        // Status Filter
        var statusFilter = (status ?? "active").Trim().ToLowerInvariant();
        query = statusFilter switch
        {
            "archived" => query.Where(c => c.DeletedAt != null),
            "inactive" => query.Where(c => c.DeletedAt == null && !c.IsActive),
            "all" => query.Where(c => c.DeletedAt == null),
            "active" or _ => query.Where(c => c.DeletedAt == null && c.IsActive),
        };

        // Search Filter (Company Name, Contact Person, Phone, Email)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.CompanyName.ToLower().Contains(term) ||
                (c.ContactPerson != null && c.ContactPerson.ToLower().Contains(term)) ||
                c.Phone.Contains(term) ||
                (c.Email != null && c.Email.ToLower().Contains(term))
            );
        }

        // Sorting: Line-wise numerical sequence by Customer ID ascending
        query = query.OrderBy(c => c.ClientId);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Client?> GetClientByIdAsync(long id)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ClientId == id);
    }

    public async Task<IReadOnlyList<Client>> GetCandidatesForDuplicateCheckAsync(long? excludeClientId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(c => !excludeClientId.HasValue || c.ClientId != excludeClientId.Value)
            .ToListAsync();
    }

    public async Task<bool> SoftDeleteAsync(long id)
    {
        var client = await _dbSet.FirstOrDefaultAsync(c => c.ClientId == id);
        if (client == null)
            return false;

        client.DeletedAt = DateTime.UtcNow;
        client.UpdatedAt = DateTime.UtcNow;
        return true;
    }

    public async Task<bool> RestoreAsync(long id)
    {
        var client = await _dbSet.FirstOrDefaultAsync(c => c.ClientId == id);
        if (client == null)
            return false;

        client.DeletedAt = null;
        client.UpdatedAt = DateTime.UtcNow;
        return true;
    }

    public async Task<bool> DeletePermanentlyAsync(long id)
    {
        var client = await _dbSet.FirstOrDefaultAsync(c => c.ClientId == id);
        if (client == null)
            return false;

        _dbSet.Remove(client);
        return true;
    }
}

