using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;
    private readonly ILogger<ClientsController> _logger;

    public ClientsController(IClientService clientService, ILogger<ClientsController> logger)
    {
        _clientService = clientService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of clients with search and status filtering.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<ClientDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<ClientDto>>> GetClients(
        [FromQuery] string? search = null,
        [FromQuery] string? status = "active",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _clientService.GetClientsAsync(search, status, page, pageSize);
        return Ok(response);
    }

    /// <summary>
    /// Gets details of a specific client by ID.
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientDto>> GetClient(long id)
    {
        var client = await _clientService.GetClientByIdAsync(id);
        if (client == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Customer Not Found",
                Detail = $"Customer with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(client);
    }

    /// <summary>
    /// Creates a new customer with server-side duplicate phone validation.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(DuplicateWarningResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateClient([FromBody] CreateClientRequest request, [FromQuery] bool force = false)
    {
        var (client, duplicateWarning) = await _clientService.CreateClientAsync(request, force);

        if (duplicateWarning != null)
        {
            return StatusCode(StatusCodes.Status409Conflict, duplicateWarning);
        }

        return CreatedAtAction(nameof(GetClient), new { id = client!.ClientId }, client);
    }

    /// <summary>
    /// Updates an existing customer by ID.
    /// </summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateClient(long id, [FromBody] UpdateClientRequest request)
    {
        var updated = await _clientService.UpdateClientAsync(id, request);
        if (updated == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Customer Not Found",
                Detail = $"Customer with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(updated);
    }

    /// <summary>
    /// Activates or deactivates an existing customer.
    /// </summary>
    [HttpPatch("{id:long}/status")]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientStatus(long id, [FromBody] ClientStatusUpdateRequest request)
    {
        var updated = await _clientService.UpdateClientStatusAsync(id, request.IsActive);
        if (updated == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Customer Not Found",
                Detail = $"Customer with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(updated);
    }

    /// <summary>
    /// Soft-deletes (archives) a customer.
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ArchiveClient(long id)
    {
        var success = await _clientService.ArchiveClientAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Customer Not Found",
                Detail = $"Customer with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { message = $"Customer #{id} has been archived successfully." });
    }

    /// <summary>
    /// Restores an archived (soft-deleted) customer.
    /// </summary>
    [HttpPost("{id:long}/restore")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RestoreClient(long id)
    {
        var success = await _clientService.RestoreClientAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Customer Not Found",
                Detail = $"Customer with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { message = $"Customer #{id} has been restored successfully." });
    }

    /// <summary>
    /// Permanently deletes a customer.
    /// </summary>
    [HttpDelete("{id:long}/permanent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PermanentDeleteClient(long id)
    {
        var success = await _clientService.DeleteClientPermanentlyAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Customer Not Found",
                Detail = $"Customer with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { message = $"Customer #{id} has been deleted permanently." });
    }
}

