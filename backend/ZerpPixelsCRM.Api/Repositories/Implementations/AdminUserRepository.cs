using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class AdminUserRepository : Repository<AdminUser>, IAdminUserRepository
{
    public AdminUserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<AdminUser?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
    }

    public async Task<AdminUser?> GetTrackedByIdAsync(long id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<AdminUser?> GetTrackedByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
    }

    public async Task<bool> EmailExistsAsync(string email, long excludeUserId)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _dbSet
            .AsNoTracking()
            .AnyAsync(u => u.Id != excludeUserId && u.Email.ToLower() == normalizedEmail);
    }
}
