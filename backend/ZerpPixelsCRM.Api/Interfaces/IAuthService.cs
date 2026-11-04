using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task SeedAdminUserAsync();
    Task<AdminProfileResponse?> GetAdminProfileAsync(long? userId, string? email);
    Task<(bool Success, string? ErrorMessage, int StatusCode, AdminProfileResponse? Profile)> UpdateAdminProfileAsync(
        long? userId,
        string? currentEmail,
        UpdateAdminProfileRequest request);
    Task<(bool Success, string? ErrorMessage, int StatusCode, string? NewToken)> ChangeAdminPasswordAsync(
        long? userId,
        string? currentEmail,
        ChangeAdminPasswordRequest request);
}
