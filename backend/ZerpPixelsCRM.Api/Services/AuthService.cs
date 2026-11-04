using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    private static readonly ConcurrentDictionary<long, (int FailedCount, DateTime WindowStart, DateTime? LockedUntil)> _passwordAttemptTracker = new();
    private const int MaxFailedPasswordAttempts = 5;
    private static readonly TimeSpan AttemptWindow = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var admin = await _unitOfWork.AdminUsers.GetByEmailAsync(email);

        if (admin == null)
        {
            _logger.LogWarning("Failed login attempt for unknown email {Email}", email);
            return null;
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Invalid password for admin {Email}", email);
            return null;
        }

        var expiresAt = DateTime.UtcNow.AddHours(12);
        var token = GenerateJwtToken(admin, expiresAt);

        _logger.LogInformation("Admin user {Email} logged in successfully", admin.Email);

        return new AuthResponse
        {
            Token = token,
            Email = admin.Email,
            FullName = admin.FullName,
            Role = admin.Role,
            ExpiresAt = expiresAt
        };
    }

    public async Task SeedAdminUserAsync()
    {
        var anyAdmin = await _unitOfWork.AdminUsers.AnyAsync();
        if (!anyAdmin)
        {
            var defaultAdmin = new AdminUser
            {
                Email = "admin@zeropixel.com",
                FullName = "Naveed Ahmad",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AdminUsers.AddAsync(defaultAdmin);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Seeded default Admin user: admin@zeropixel.com");
        }
    }

    public async Task<AdminProfileResponse?> GetAdminProfileAsync(long? userId, string? email)
    {
        var admin = await ResolveTrackedAdminAsync(userId, email);
        if (admin == null)
        {
            return null;
        }

        return new AdminProfileResponse
        {
            AdminName = admin.FullName,
            FullName = admin.FullName,
            Email = admin.Email,
            Role = admin.Role,
            UpdatedAt = admin.UpdatedAt
        };
    }

    public async Task<(bool Success, string? ErrorMessage, int StatusCode, AdminProfileResponse? Profile)> UpdateAdminProfileAsync(
        long? userId,
        string? currentEmail,
        UpdateAdminProfileRequest request)
    {
        var admin = await ResolveTrackedAdminAsync(userId, currentEmail);
        if (admin == null)
        {
            return (false, "Authenticated admin account was not found.", StatusCodes.Status404NotFound, null);
        }

        var rawName = !string.IsNullOrWhiteSpace(request.AdminName)
            ? request.AdminName.Trim()
            : (request.FullName?.Trim() ?? string.Empty);

        var rawEmail = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(rawName))
        {
            return (false, "Admin Name is required.", StatusCodes.Status400BadRequest, null);
        }

        if (rawName.Length < 2 || rawName.Length > 150)
        {
            return (false, "Admin Name must be between 2 and 150 characters.", StatusCodes.Status400BadRequest, null);
        }

        if (string.IsNullOrWhiteSpace(rawEmail))
        {
            return (false, "Email Address is required.", StatusCodes.Status400BadRequest, null);
        }

        var emailValidator = new EmailAddressAttribute();
        if (!emailValidator.IsValid(rawEmail) || !Regex.IsMatch(rawEmail, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return (false, "Please enter a valid Email Address.", StatusCodes.Status400BadRequest, null);
        }

        if (rawEmail.Length > 150)
        {
            return (false, "Email Address cannot exceed 150 characters.", StatusCodes.Status400BadRequest, null);
        }

        bool emailTaken = await _unitOfWork.AdminUsers.EmailExistsAsync(rawEmail, admin.Id);
        if (emailTaken)
        {
            return (false, "This email address is already in use by another account.", StatusCodes.Status409Conflict, null);
        }

        admin.FullName = rawName;
        admin.Email = rawEmail;
        admin.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.AdminUsers.Update(admin);
        await _unitOfWork.CompleteAsync();

        var expiresAt = DateTime.UtcNow.AddHours(12);
        var refreshedToken = GenerateJwtToken(admin, expiresAt);

        _logger.LogInformation("Admin user ID {AdminId} updated profile information", admin.Id);

        var profile = new AdminProfileResponse
        {
            AdminName = admin.FullName,
            FullName = admin.FullName,
            Email = admin.Email,
            Role = admin.Role,
            UpdatedAt = admin.UpdatedAt,
            Token = refreshedToken
        };

        return (true, null, StatusCodes.Status200OK, profile);
    }

    public async Task<(bool Success, string? ErrorMessage, int StatusCode, string? NewToken)> ChangeAdminPasswordAsync(
        long? userId,
        string? currentEmail,
        ChangeAdminPasswordRequest request)
    {
        var admin = await ResolveTrackedAdminAsync(userId, currentEmail);
        if (admin == null)
        {
            return (false, "Authenticated admin account was not found.", StatusCodes.Status404NotFound, null);
        }

        // Check rate limiting for password change attempts
        var now = DateTime.UtcNow;
        if (_passwordAttemptTracker.TryGetValue(admin.Id, out var attemptState))
        {
            if (attemptState.LockedUntil.HasValue && attemptState.LockedUntil.Value > now)
            {
                var remainingMinutes = Math.Max(1, (int)Math.Ceiling((attemptState.LockedUntil.Value - now).TotalMinutes));
                return (
                    false,
                    $"Too many failed password attempts. Please try again in {remainingMinutes} minute(s).",
                    StatusCodes.Status429TooManyRequests,
                    null);
            }
        }

        var confirmPassword = !string.IsNullOrEmpty(request.ConfirmNewPassword)
            ? request.ConfirmNewPassword
            : (request.ConfirmPassword ?? string.Empty);

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword) ||
            string.IsNullOrWhiteSpace(confirmPassword))
        {
            return (false, "Current password, new password, and confirmation password are all required.", StatusCodes.Status400BadRequest, null);
        }

        bool isCurrentValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, admin.PasswordHash);
        if (!isCurrentValid)
        {
            RecordFailedPasswordAttempt(admin.Id, now);
            _logger.LogWarning("Failed password change attempt (invalid current password) for Admin ID {AdminId}", admin.Id);
            return (false, "Current password is incorrect.", StatusCodes.Status400BadRequest, null);
        }

        if (request.NewPassword != confirmPassword)
        {
            return (false, "New password and confirmation password do not match.", StatusCodes.Status400BadRequest, null);
        }

        bool isSameAsCurrent = BCrypt.Net.BCrypt.Verify(request.NewPassword, admin.PasswordHash);
        if (isSameAsCurrent)
        {
            return (false, "New password cannot be the same as your current password.", StatusCodes.Status400BadRequest, null);
        }

        if (!IsStrongPassword(request.NewPassword, out var policyError))
        {
            return (false, policyError, StatusCodes.Status400BadRequest, null);
        }

        // Clear rate limit state after successful verification
        _passwordAttemptTracker.TryRemove(admin.Id, out _);

        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        admin.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.AdminUsers.Update(admin);
        await _unitOfWork.CompleteAsync();

        var expiresAt = DateTime.UtcNow.AddHours(12);
        var newToken = GenerateJwtToken(admin, expiresAt);

        _logger.LogInformation("Admin user ID {AdminId} changed password successfully", admin.Id);

        return (true, null, StatusCodes.Status200OK, newToken);
    }

    private async Task<AdminUser?> ResolveTrackedAdminAsync(long? userId, string? email)
    {
        if (userId.HasValue && userId.Value > 0)
        {
            var byId = await _unitOfWork.AdminUsers.GetTrackedByIdAsync(userId.Value);
            if (byId != null)
            {
                return byId;
            }
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            return await _unitOfWork.AdminUsers.GetTrackedByEmailAsync(email);
        }

        return null;
    }

    private static void RecordFailedPasswordAttempt(long adminId, DateTime now)
    {
        _passwordAttemptTracker.AddOrUpdate(
            adminId,
            _ => (1, now, null),
            (_, existing) =>
            {
                if (now - existing.WindowStart > AttemptWindow)
                {
                    return (1, now, null);
                }

                int nextCount = existing.FailedCount + 1;
                DateTime? lockedUntil = nextCount >= MaxFailedPasswordAttempts
                    ? now.Add(LockoutDuration)
                    : null;

                return (nextCount, existing.WindowStart, lockedUntil);
            });
    }

    private static bool IsStrongPassword(string password, out string errorMessage)
    {
        if (password.Length < 8)
        {
            errorMessage = "New password must be at least 8 characters long.";
            return false;
        }

        if (password.Length > 128)
        {
            errorMessage = "New password cannot exceed 128 characters.";
            return false;
        }

        if (!password.Any(char.IsUpper))
        {
            errorMessage = "New password must contain at least one uppercase letter (A-Z).";
            return false;
        }

        if (!password.Any(char.IsLower))
        {
            errorMessage = "New password must contain at least one lowercase letter (a-z).";
            return false;
        }

        if (!password.Any(char.IsDigit))
        {
            errorMessage = "New password must contain at least one number (0-9).";
            return false;
        }

        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
        {
            errorMessage = "New password must contain at least one special character (e.g., @, #, $, !, %).";
            return false;
        }

        errorMessage = string.Empty;
        return true;
    }

    private string GenerateJwtToken(AdminUser user, DateTime expiresAt)
    {
        var secretKey = _configuration["Jwt:Key"] ?? "ZeroPixel_SuperSecure_Secret_JWT_Key_2026_Development_Only!";
        var issuer = _configuration["Jwt:Issuer"] ?? "ZeroPixelApi";
        var audience = _configuration["Jwt:Audience"] ?? "ZeroPixelAdmin";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
