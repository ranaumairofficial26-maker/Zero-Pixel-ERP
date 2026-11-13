using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/purchase-orders")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _poService;
    private readonly ILogger<PurchaseOrdersController> _logger;

    public PurchaseOrdersController(IPurchaseOrderService poService, ILogger<PurchaseOrdersController> logger)
    {
        _poService = poService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedPurchaseOrdersResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedPurchaseOrdersResponse>> GetPurchaseOrders(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _poService.GetPurchaseOrdersAsync(search, page, pageSize);
        return Ok(response);
    }

    [HttpGet("next-number")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextPoNumber()
    {
        var poNumber = await _poService.GetNextPoNumberAsync();
        return Ok(new { poNumber });
    }

    [HttpGet("by-supplier/{supplierId:long}")]
    [ProducesResponseType(typeof(List<PurchaseOrderListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PurchaseOrderListItemDto>>> GetBySupplier(long supplierId)
    {
        var list = await _poService.GetPurchaseOrdersBySupplierIdAsync(supplierId);
        return Ok(list);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(PurchaseOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseOrderDto>> GetPurchaseOrder(long id)
    {
        var po = await _poService.GetPurchaseOrderByIdAsync(id);
        if (po == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Purchase Order Not Found",
                Detail = $"Purchase Order with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(po);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PurchaseOrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PurchaseOrderDto>> CreatePurchaseOrder(
        [FromBody] CreatePurchaseOrderRequest request,
        [FromQuery] bool issue = false)
    {
        try
        {
            var created = await _poService.CreatePurchaseOrderAsync(request, issue);
            return CreatedAtAction(nameof(GetPurchaseOrder), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Purchase Order",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Purchase Order Conflict",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(PurchaseOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseOrderDto>> UpdateDraftPurchaseOrder(long id, [FromBody] UpdatePurchaseOrderRequest request)
    {
        try
        {
            var updated = await _poService.UpdateDraftPurchaseOrderAsync(id, request);
            if (updated == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Purchase Order Not Found",
                    Detail = $"Purchase Order with ID {id} does not exist.",
                    Instance = HttpContext.Request.Path
                });
            }

            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Purchase Order",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Operation",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpPatch("{id:long}/issue")]
    [ProducesResponseType(typeof(PurchaseOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseOrderDto>> IssuePurchaseOrder(long id)
    {
        try
        {
            var issued = await _poService.IssuePurchaseOrderAsync(id);
            if (issued == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Purchase Order Not Found",
                    Detail = $"Purchase Order with ID {id} does not exist.",
                    Instance = HttpContext.Request.Path
                });
            }

            return Ok(issued);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Status Transition",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelPurchaseOrder(long id)
    {
        var success = await _poService.CancelPurchaseOrderAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Purchase Order Not Found",
                Detail = $"Purchase Order with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { message = $"Purchase Order #{id} has been cancelled." });
    }
}

