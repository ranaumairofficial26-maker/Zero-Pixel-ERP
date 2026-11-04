using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IAdminUserRepository : IRepository<AdminUser>
{
    Task<AdminUser?> GetByEmailAsync(string email);
    Task<AdminUser?> GetTrackedByIdAsync(long id);
    Task<AdminUser?> GetTrackedByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email, long excludeUserId);
}
