using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class QuotationsController : ControllerBase
{
    private readonly IQuotationService _quotationService;
    private readonly ILogger<QuotationsController> _logger;

    public QuotationsController(IQuotationService quotationService, ILogger<QuotationsController> logger)
    {
        _quotationService = quotationService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of quotations with search, filters, and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<QuotationListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<QuotationListItemDto>>> GetQuotations(
        [FromQuery] string? search = null,
        [FromQuery] string? quotationType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? approvalStatus = null,
        [FromQuery] string? sendingStatus = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = "date",
        [FromQuery] bool isAscending = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _quotationService.GetQuotationsAsync(
            search, quotationType, status, approvalStatus, sendingStatus, fromDate, toDate, page, pageSize, sortBy, isAscending, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets high-performance summary counts for quotation dashboard cards.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(QuotationSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<QuotationSummaryDto>> GetSummary(CancellationToken cancellationToken = default)
    {
        var summary = await _quotationService.GetSummaryAsync(cancellationToken);
        return Ok(summary);
    }

    /// <summary>
    /// Gets detailed information for a quotation, including its active revision and revision history.
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(QuotationDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuotationDetailsDto>> GetQuotation(long id, [FromQuery] long? revisionId = null)
    {
        var quote = await _quotationService.GetQuotationByIdAsync(id, revisionId);
        if (quote == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Quotation Not Found",
                Detail = $"Quotation with ID {id} was not found."
            });
        }
        return Ok(quote);
    }

    /// <summary>
    /// Creates a new quotation in Draft status with its first revision and line items.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(QuotationDetailsDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<QuotationDetailsDto>> CreateDraftQuotation([FromBody] CreateQuotationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
        {
            ModelState.AddModelError(nameof(request.CustomerName), "Customer name is required.");
        }
        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            ModelState.AddModelError(nameof(request.CustomerPhone), "Customer phone is required.");
        }
        if (request.Items == null || request.Items.Count == 0)
        {
            ModelState.AddModelError(nameof(request.Items), "At least one quotation item is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var created = await _quotationService.CreateDraftQuotationAsync(request);
            return CreatedAtAction(nameof(GetQuotation), new { id = created.QuotationId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create draft quotation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Quotation Creation Failed",
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Updates an existing draft quotation and its active draft revision.
    /// </summary>
    [HttpPut("{id:long}/draft")]
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(QuotationDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuotationDetailsDto>> UpdateDraftQuotation(long id, [FromBody] UpdateDraftQuotationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
        {
            ModelState.AddModelError(nameof(request.CustomerName), "Customer name is required.");
        }
        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            ModelState.AddModelError(nameof(request.CustomerPhone), "Customer phone is required.");
        }
        if (request.Items == null || request.Items.Count == 0)
        {
            ModelState.AddModelError(nameof(request.Items), "At least one quotation item is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var updated = await _quotationService.UpdateDraftQuotationAsync(id, request);
            if (updated == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Quotation Not Found",
                    Detail = $"Quotation with ID {id} was not found."
                });
            }
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Operation",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update draft quotation {QuotationId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Update Error",
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Finalizes the active draft revision, locking it from further direct modification.
    /// </summary>
    [HttpPost("{id:long}/finalize")]
    [ProducesResponseType(typeof(QuotationDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuotationDetailsDto>> FinalizeQuotation(long id)
    {
        try
        {
            var finalized = await _quotationService.FinalizeQuotationAsync(id);
            if (finalized == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Quotation Not Found",
                    Detail = $"Quotation with ID {id} was not found."
                });
            }
            return Ok(finalized);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Cannot Finalize Quotation",
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Creates a new draft revision based on the latest revision of a finalized quotation.
    /// </summary>
    [HttpPost("{id:long}/revisions")]
    [ProducesResponseType(typeof(QuotationDetailsDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuotationDetailsDto>> CreateRevision(long id)
    {
        try
        {
            var revised = await _quotationService.CreateRevisionAsync(id);
            if (revised == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Quotation Not Found",
                    Detail = $"Quotation with ID {id} was not found."
                });
            }
            return Ok(revised);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create revision for quotation {QuotationId}", id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Revision Creation Failed",
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Generates and renders/downloads the professional A4 PDF for a quotation revision.
    /// </summary>
    [HttpGet("{id:long}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPdf(long id, [FromQuery] long? revisionId = null, [FromQuery] bool download = false)
    {
        var result = await _quotationService.GeneratePdfAsync(id, revisionId);
        if (result == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Quotation Or Revision Not Found",
                Detail = $"Quotation with ID {id} was not found or has no valid revisions."
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
    /// Generates and renders/downloads the professional A4 PDF for a specific quotation revision.
    /// </summary>
    [HttpGet("{quotationId:long}/revisions/{revisionId:long}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public Task<IActionResult> GetRevisionPdf(long quotationId, long revisionId, [FromQuery] bool download = false)
    {
        return GetPdf(quotationId, revisionId, download);
    }

    /// <summary>
    /// Records a manual sharing event (WhatsApp, Email, Manual).
    /// </summary>
    [HttpPost("send-logs")]
    [ProducesResponseType(typeof(QuotationSendLogDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<QuotationSendLogDto>> RecordSendLog([FromBody] RecordSendLogRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Recipient))
        {
            ModelState.AddModelError(nameof(request.Recipient), "Recipient is required.");
        }
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var log = await _quotationService.RecordSendLogAsync(request);
        if (log == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Revision Not Found",
                Detail = $"Quotation revision with ID {request.RevisionId} was not found."
            });
        }

        return Created("", log);
    }

    /// <summary>
    /// Records a customer decision (Approved, Rejected, Revision Requested).
    /// </summary>
    [HttpPost("approval-logs")]
    [ProducesResponseType(typeof(QuotationApprovalLogDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<QuotationApprovalLogDto>> RecordApprovalLog([FromBody] RecordApprovalLogRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Decision))
        {
            ModelState.AddModelError(nameof(request.Decision), "Decision is required.");
        }
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var log = await _quotationService.RecordApprovalLogAsync(request);
        if (log == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Revision Not Found",
                Detail = $"Quotation revision with ID {request.RevisionId} was not found."
            });
        }

        return Created("", log);
    }

    /// <summary>
    /// Soft deletes a quotation.
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteQuotation(long id)
    {
        var success = await _quotationService.DeleteQuotationAsync(id);
        if (!success)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Quotation Not Found",
                Detail = $"Quotation with ID {id} was not found."
            });
        }

        return NoContent();
    }
}

