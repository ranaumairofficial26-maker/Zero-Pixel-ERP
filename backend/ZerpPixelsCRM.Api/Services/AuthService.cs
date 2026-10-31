using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AdminUsers.AddAsync(defaultAdmin);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Seeded default Admin user: admin@zeropixel.com");
        }
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
