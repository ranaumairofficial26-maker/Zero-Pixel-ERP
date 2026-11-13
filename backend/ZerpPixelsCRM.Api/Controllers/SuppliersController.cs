using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    private readonly ILogger<SuppliersController> _logger;

    public SuppliersController(ISupplierService supplierService, ILogger<SuppliersController> logger)
    {
        _supplierService = supplierService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedSuppliersResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedSuppliersResponse>> GetSuppliers(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _supplierService.GetSuppliersAsync(search, page, pageSize);
        return Ok(response);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(SupplierDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierDto>> GetSupplier(long id)
    {
        var supplier = await _supplierService.GetSupplierByIdAsync(id);
        if (supplier == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Not Found",
                Detail = $"Supplier with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(supplier);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SupplierDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] CreateSupplierRequest request)
    {
        var created = await _supplierService.CreateSupplierAsync(request);
        return CreatedAtAction(nameof(GetSupplier), new { id = created.Id }, created);
    }

    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(SupplierDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SupplierDto>> UpdateSupplier(long id, [FromBody] UpdateSupplierRequest request)
    {
        var updated = await _supplierService.UpdateSupplierAsync(id, request);
        if (updated == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Not Found",
                Detail = $"Supplier with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(updated);
    }

    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateSupplier(long id)
    {
        var success = await _supplierService.DeactivateSupplierAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Not Found",
                Detail = $"Supplier with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { message = $"Supplier #{id} has been deactivated." });
    }
}

