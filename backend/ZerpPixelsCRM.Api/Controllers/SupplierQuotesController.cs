using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/supplier-quotes")]
public class SupplierQuotesController : ControllerBase
{
    private readonly ISupplierQuoteService _quoteService;
    private readonly ILogger<SupplierQuotesController> _logger;

    public SupplierQuotesController(ISupplierQuoteService quoteService, ILogger<SupplierQuotesController> logger)
    {
        _quoteService = quoteService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedSupplierQuotesResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedSupplierQuotesResponse>> GetQuotes(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _quoteService.GetQuotesAsync(search, page, pageSize);
        return Ok(response);
    }

    [HttpGet("next-number")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextQuoteNumber()
    {
        var quoteNumber = await _quoteService.GetNextQuoteNumberAsync();
        return Ok(new { quoteNumber });
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(SupplierQuoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierQuoteDto>> GetQuote(long id)
    {
        var quote = await _quoteService.GetQuoteByIdAsync(id);
        if (quote == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Quote Not Found",
                Detail = $"Supplier quote with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(quote);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SupplierQuoteDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierQuoteDto>> CreateQuote([FromBody] CreateSupplierQuoteRequest request)
    {
        try
        {
            var created = await _quoteService.CreateQuoteAsync(request);
            return CreatedAtAction(nameof(GetQuote), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Supplier Quote",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Supplier Quote Conflict",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(SupplierQuoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SupplierQuoteDto>> UpdateQuote(long id, [FromBody] UpdateSupplierQuoteRequest request)
    {
        try
        {
            var updated = await _quoteService.UpdateQuoteAsync(id, request);
            if (updated == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Supplier Quote Not Found",
                    Detail = $"Supplier quote with ID {id} does not exist.",
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
                Title = "Invalid Supplier Quote",
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

    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelQuote(long id)
    {
        var success = await _quoteService.CancelQuoteAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Supplier Quote Not Found",
                Detail = $"Supplier quote with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { message = $"Supplier quote #{id} has been cancelled." });
    }
}

