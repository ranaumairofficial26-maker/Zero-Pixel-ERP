namespace ZerpPixelsCRM.Api.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class AdminProfileResponse
{
    public string AdminName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public string? Token { get; set; }
}

public class UpdateAdminProfileRequest
{
    public string? AdminName { get; set; }
    public string? FullName { get; set; }
    public string Email { get; set; } = string.Empty;
}

public class ChangeAdminPasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string? ConfirmNewPassword { get; set; }
    public string? ConfirmPassword { get; set; }
}

public class ChangePasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
}
