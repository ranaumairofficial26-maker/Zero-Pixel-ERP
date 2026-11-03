using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Route("api/production-jobs")]
public class ProductionJobsController : ControllerBase
{
    private readonly IProductionService _productionService;

    public ProductionJobsController(IProductionService productionService)
    {
        _productionService = productionService;
    }

    /// <summary>
    /// Gets production jobs, optionally filtered by production type (IN_HOUSE or OUTSOURCED) and status.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductionJobDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductionJobDto>>> GetJobs(
        [FromQuery] string? productionType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var jobs = await _productionService.GetProductionJobsAsync(productionType, status, search);
        return Ok(jobs);
    }

    /// <summary>
    /// Gets a single production job by ID.
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ProductionJobDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductionJobDto>> GetJobById(long id)
    {
        var job = await _productionService.GetProductionJobByIdAsync(id);
        if (job == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Job Not Found",
                Detail = $"Production job with ID {id} was not found."
            });
        }
        return Ok(job);
    }

    /// <summary>
    /// Updates production job details (status, operator/machine, vendor details, outsourced cost, delivery date).
    /// </summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(ProductionJobDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductionJobDto>> UpdateJob(
        long id,
        [FromBody] UpdateProductionJobRequest request)
    {
        var updated = await _productionService.UpdateProductionJobAsync(id, request);
        if (updated == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Job Not Found",
                Detail = $"Production job with ID {id} was not found."
            });
        }
        return Ok(updated);
    }

    /// <summary>
    /// Updates only the status of a production job.
    /// </summary>
    [HttpPatch("{id:long}/status")]
    [ProducesResponseType(typeof(ProductionJobDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductionJobDto>> UpdateStatus(
        long id,
        [FromQuery] string status,
        [FromQuery] string? notes = null)
    {
        var updated = await _productionService.UpdateJobStatusAsync(id, status, notes);
        if (updated == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Job Not Found",
                Detail = $"Production job with ID {id} was not found."
            });
        }
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a production job by ID.
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteJob(long id)
    {
        var deleted = await _productionService.DeleteJobAsync(id);
        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Job Not Found",
                Detail = $"Production job with ID {id} was not found."
            });
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes all In-House production jobs.
    /// </summary>
    [HttpDelete("clear-in-house")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearInHouseJobs()
    {
        var count = await _productionService.ClearInHouseJobsAsync();
        return Ok(new { deletedCount = count, message = $"Deleted {count} In-House production jobs." });
    }
}

