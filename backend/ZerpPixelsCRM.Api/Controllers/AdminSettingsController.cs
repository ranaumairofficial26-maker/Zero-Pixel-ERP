using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly IAuthService _authService;

    public AdminSettingsController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("profile")]
    [ProducesResponseType(typeof(AdminProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile()
    {
        var (userId, email) = ResolveAuthenticatedAdminIdentity();
        if (userId == null && string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Unable to resolve authenticated Admin identity."
            });
        }

        var profile = await _authService.GetAdminProfileAsync(userId, email);
        if (profile == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Not Found",
                Detail = "Authenticated Admin account was not found."
            });
        }

        return Ok(profile);
    }

    [HttpPut("profile")]
    [ProducesResponseType(typeof(AdminProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateAdminProfileRequest request)
    {
        var (userId, email) = ResolveAuthenticatedAdminIdentity();
        if (userId == null && string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Unable to resolve authenticated Admin identity."
            });
        }

        var (success, errorMessage, statusCode, profile) =
            await _authService.UpdateAdminProfileAsync(userId, email, request);

        if (!success)
        {
            return StatusCode(statusCode, new ProblemDetails
            {
                Status = statusCode,
                Title = statusCode == StatusCodes.Status409Conflict ? "Email Already In Use" : "Validation Error",
                Detail = errorMessage
            });
        }

        return Ok(profile);
    }

    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ChangePasswordResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangeAdminPasswordRequest request)
    {
        var (userId, email) = ResolveAuthenticatedAdminIdentity();
        if (userId == null && string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Unable to resolve authenticated Admin identity."
            });
        }

        var (success, errorMessage, statusCode, newToken) =
            await _authService.ChangeAdminPasswordAsync(userId, email, request);

        if (!success)
        {
            return StatusCode(statusCode, new ProblemDetails
            {
                Status = statusCode,
                Title = statusCode == StatusCodes.Status429TooManyRequests ? "Too Many Requests" : "Password Update Failed",
                Detail = errorMessage
            });
        }

        return Ok(new ChangePasswordResponse
        {
            Success = true,
            Message = "Password updated successfully.",
            Token = newToken
        });
    }

    private (long? UserId, string? Email) ResolveAuthenticatedAdminIdentity()
    {
        var subClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        long? userId = null;
        if (long.TryParse(subClaim, out var parsedId) && parsedId > 0)
        {
            userId = parsedId;
        }

        var email = User.FindFirstValue(ClaimTypes.Email)
                    ?? User.FindFirstValue(JwtRegisteredClaimNames.Email);

        return (userId, email);
    }
}

