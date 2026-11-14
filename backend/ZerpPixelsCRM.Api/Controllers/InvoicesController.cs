using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(IInvoiceService invoiceService, ILogger<InvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of invoices with search filtering.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedInvoicesResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedInvoicesResponse>> GetInvoices(
        [FromQuery] string? search = null,
        [FromQuery] string? period = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _invoiceService.GetInvoicesAsync(search, period, fromDate, toDate, page, pageSize);
        return Ok(response);
    }

    /// <summary>
    /// Generates and downloads a Daily, Weekly, Monthly, Yearly, Custom Date Range, or All Invoices summary PDF report.
    /// </summary>
    [HttpGet("report/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvoicesReportPdf(
        [FromQuery] string? period = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _invoiceService.GenerateReportPdfAsync(period, search, fromDate, toDate);
        return File(result.FileBytes, "application/pdf", result.FileName);
    }

    /// <summary>
    /// Gets details of a specific invoice by ID or Invoice Number.
    /// </summary>
    [HttpGet("{idOrNumber}")]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(string idOrNumber)
    {
        var invoice = await _invoiceService.GetInvoiceByIdOrNumberAsync(idOrNumber);
        if (invoice == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Invoice Not Found",
                Detail = $"Invoice '{idOrNumber}' does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(invoice);
    }

    /// <summary>
    /// Generates and renders or downloads the professional A4 PDF for an invoice.
    /// </summary>
    [HttpGet("{idOrNumber}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvoicePdf(string idOrNumber, [FromQuery] bool download = false)
    {
        var result = await _invoiceService.GeneratePdfAsync(idOrNumber);
        if (result == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Invoice Not Found",
                Detail = $"Invoice '{idOrNumber}' does not exist or could not generate PDF.",
                Instance = HttpContext.Request.Path
            });
        }

        if (download)
        {
            return File(result.Value.FileBytes, "application/pdf", result.Value.FileName);
        }

        Response.Headers.Append("Content-Disposition", $"inline; filename=\"{result.Value.FileName}\"");
        return File(result.Value.FileBytes, "application/pdf");
    }

    /// <summary>
    /// Generates next sequential invoice number preview.
    /// </summary>
    [HttpGet("next-number")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> GetNextNumber()
    {
        var nextNumber = await _invoiceService.GetNextInvoiceNumberAsync();
        return Ok(new { invoiceNumber = nextNumber });
    }

    /// <summary>
    /// Creates a new printing invoice.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice([FromBody] CreateInvoiceDto dto)
    {
        try
        {
            var created = await _invoiceService.CreateInvoiceAsync(dto);
            return CreatedAtAction(nameof(GetInvoice), new { idOrNumber = created.Id.ToString() }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Error",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Updates an existing printing invoice.
    /// </summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvoiceDto>> UpdateInvoice(long id, [FromBody] UpdateInvoiceDto dto)
    {
        try
        {
            var updated = await _invoiceService.UpdateInvoiceAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Invoice Not Found",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Error",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Deletes an invoice by ID.
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteInvoice(long id)
    {
        var deleted = await _invoiceService.DeleteInvoiceAsync(id);
        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Invoice Not Found",
                Detail = $"Invoice with ID {id} does not exist.",
                Instance = HttpContext.Request.Path
            });
        }

        return NoContent();
    }
}

