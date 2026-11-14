using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/supplier-payments")]
public class SupplierPaymentsController : ControllerBase
{
    private readonly ISupplierPaymentService _paymentService;
    private readonly ILogger<SupplierPaymentsController> _logger;

    public SupplierPaymentsController(ISupplierPaymentService paymentService, ILogger<SupplierPaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedSupplierPaymentsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedSupplierPaymentsResponse>> GetSupplierPayments(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _paymentService.GetSupplierPaymentsAsync(search, page, pageSize);
        return Ok(response);
    }

    [HttpGet("next-number")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextNumber()
    {
        var paymentNumber = await _paymentService.GetNextPaymentNumberAsync();
        return Ok(new { paymentNumber });
    }

    [HttpGet("by-supplier/{supplierId:long}")]
    [ProducesResponseType(typeof(List<SupplierPaymentListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SupplierPaymentListItemDto>>> GetBySupplier(long supplierId)
    {
        var list = await _paymentService.GetPaymentsBySupplierIdAsync(supplierId);
        return Ok(list);
    }

    [HttpGet("by-bill/{billId:long}")]
    [ProducesResponseType(typeof(List<SupplierPaymentListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SupplierPaymentListItemDto>>> GetByBill(long billId)
    {
        var list = await _paymentService.GetPaymentsByBillIdAsync(billId);
        return Ok(list);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(SupplierPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierPaymentDto>> GetSupplierPayment(long id)
    {
        var payment = await _paymentService.GetSupplierPaymentByIdAsync(id);
        if (payment == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Payment Not Found",
                Detail = $"Supplier Payment with ID {id} was not found."
            });
        }
        return Ok(payment);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SupplierPaymentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierPaymentDto>> CreateSupplierPayment([FromBody] CreateSupplierPaymentRequest request)
    {
        try
        {
            var actor = GetCurrentActor();
            var created = await _paymentService.CreateSupplierPaymentAsync(request, actor);
            return CreatedAtAction(nameof(GetSupplierPayment), new { id = created.Id }, created);
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
            _logger.LogError(ex, "Unexpected error recording supplier payment");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while recording the supplier payment."
            });
        }
    }

    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(SupplierPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierPaymentDto>> UpdateSupplierPayment(long id, [FromBody] UpdateSupplierPaymentRequest request)
    {
        try
        {
            var updated = await _paymentService.UpdateSupplierPaymentAsync(id, request);
            if (updated == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Supplier Payment Not Found",
                    Detail = $"Supplier Payment with ID {id} was not found."
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
                Title = "Update Not Allowed",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating supplier payment ID {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while updating the supplier payment."
            });
        }
    }

    [HttpPost("{id:long}/reverse")]
    [ProducesResponseType(typeof(SupplierPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierPaymentDto>> ReverseSupplierPayment(long id, [FromBody] ReverseSupplierPaymentRequest request)
    {
        try
        {
            var actor = GetCurrentActor();
            var reversed = await _paymentService.ReverseSupplierPaymentAsync(id, request, actor);
            if (reversed == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Supplier Payment Not Found",
                    Detail = $"Supplier Payment with ID {id} was not found."
                });
            }
            return Ok(reversed);
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
                Title = "Reversal Not Allowed",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error reversing supplier payment ID {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while reversing the supplier payment."
            });
        }
    }

    private string? GetCurrentActor()
    {
        var name = User.FindFirstValue(ClaimTypes.Name);
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(email))
        {
            return $"{name} ({email})";
        }
        return name ?? email ?? "Admin";
    }
}
