using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/supplier-bills")]
public class SupplierBillsController : ControllerBase
{
    private readonly ISupplierBillService _billService;
    private readonly ILogger<SupplierBillsController> _logger;

    public SupplierBillsController(ISupplierBillService billService, ILogger<SupplierBillsController> logger)
    {
        _billService = billService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedSupplierBillsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedSupplierBillsResponse>> GetSupplierBills(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _billService.GetSupplierBillsAsync(search, status, page, pageSize);
        return Ok(response);
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(SupplierBillSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SupplierBillSummaryDto>> GetSummary()
    {
        var summary = await _billService.GetSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("aging-report")]
    [ProducesResponseType(typeof(SupplierBillAgingReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SupplierBillAgingReportDto>> GetAgingReport()
    {
        var report = await _billService.GetAgingReportAsync();
        return Ok(report);
    }

    [HttpGet("next-number")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextNumber()
    {
        var internalBillNumber = await _billService.GetNextInternalBillNumberAsync();
        return Ok(new { internalBillNumber });
    }

    [HttpGet("by-supplier/{supplierId:long}")]
    [ProducesResponseType(typeof(List<SupplierBillListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SupplierBillListItemDto>>> GetBySupplier(long supplierId)
    {
        var list = await _billService.GetBillsBySupplierIdAsync(supplierId);
        return Ok(list);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(SupplierBillDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierBillDto>> GetSupplierBill(long id)
    {
        var bill = await _billService.GetSupplierBillByIdAsync(id);
        if (bill == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Bill Not Found",
                Detail = $"Supplier Bill with ID {id} was not found."
            });
        }
        return Ok(bill);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SupplierBillDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierBillDto>> CreateSupplierBill([FromBody] CreateSupplierBillRequest request)
    {
        try
        {
            var created = await _billService.CreateSupplierBillAsync(request);
            return CreatedAtAction(nameof(GetSupplierBill), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Error",
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Business Rule Conflict",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating supplier bill");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while creating the supplier bill."
            });
        }
    }

    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(SupplierBillDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierBillDto>> UpdateSupplierBill(long id, [FromBody] UpdateSupplierBillRequest request)
    {
        try
        {
            var updated = await _billService.UpdateSupplierBillAsync(id, request);
            if (updated == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Supplier Bill Not Found",
                    Detail = $"Supplier Bill with ID {id} was not found."
                });
            }
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Error",
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Business Rule Conflict",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating supplier bill ID {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while updating the supplier bill."
            });
        }
    }

    [HttpPost("{id:long}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult> CancelSupplierBill(long id)
    {
        try
        {
            var success = await _billService.CancelSupplierBillAsync(id);
            if (!success)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Supplier Bill Not Found",
                    Detail = $"Supplier Bill with ID {id} was not found."
                });
            }
            return Ok(new { message = $"Supplier bill ID {id} has been cancelled successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Action Not Allowed",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error cancelling supplier bill ID {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while cancelling the supplier bill."
            });
        }
    }
}

