using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Route("api/production-job-sheets")]
public class ProductionJobSheetsController : ControllerBase
{
    private readonly IProductionJobSheetService _service;

    public ProductionJobSheetsController(IProductionJobSheetService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductionJobSheetDto>>> GetAll([FromQuery] string? search)
    {
        var list = await _service.GetAllAsync(search);
        return Ok(list);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProductionJobSheetDto>> GetById(long id)
    {
        var sheet = await _service.GetByIdAsync(id);
        if (sheet == null)
            return NotFound(new { message = $"Production Job Sheet with ID {id} not found." });

        return Ok(sheet);
    }

    [HttpPost]
    public async Task<ActionResult<ProductionJobSheetDto>> Create([FromBody] SaveProductionJobSheetDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.JobCardNumber))
            return BadRequest(new { message = "Job Card Number is required." });

        if (string.IsNullOrWhiteSpace(dto.CustomerName))
            return BadRequest(new { message = "Customer Name is required." });

        if (string.IsNullOrWhiteSpace(dto.JobName))
            return BadRequest(new { message = "Job Name is required." });

        if (dto.Quantity <= 0)
            return BadRequest(new { message = "Quantity must be greater than zero." });

        var created = await _service.SaveAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ProductionJobSheetDto>> Update(long id, [FromBody] SaveProductionJobSheetDto dto)
    {
        try
        {
            var updated = await _service.SaveAsync(dto, id);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> Delete(long id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Production Job Sheet with ID {id} not found." });

        return NoContent();
    }
}

