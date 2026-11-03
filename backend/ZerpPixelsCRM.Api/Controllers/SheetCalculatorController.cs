using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Route("api/sheet-calculator")]
public class SheetCalculatorController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SheetCalculatorController> _logger;

    public SheetCalculatorController(AppDbContext context, ILogger<SheetCalculatorController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Executes real-time calculation based on Excel reference formulas.
    /// </summary>
    [HttpPost("calculate")]
    [ProducesResponseType(typeof(CalculateSheetCostResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<CalculateSheetCostResponse> CalculateCost([FromBody] CalculateSheetCostRequest req)
    {
        if (req.Length <= 0 || req.Width <= 0 || req.Gsm <= 0 || req.SheetsPerRim <= 0 || req.RequiredSheets <= 0 || req.ConversionFactor <= 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Calculation Parameters",
                Detail = "Length, Width, GSM, Sheets per Rim, Required Sheets, and Conversion Factor must all be greater than zero."
            });
        }

        var result = ComputeCosts(req.Length, req.Width, req.Gsm, req.RatePerKg, req.SheetsPerRim, req.RequiredSheets, req.ConversionFactor);
        return Ok(result);
    }

    /// <summary>
    /// Saves a sheet calculation into database history.
    /// Server independently validates and recalculates figures before persistence.
    /// </summary>
    [HttpPost("calculations")]
    [ProducesResponseType(typeof(SheetCalculationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SheetCalculationDto>> SaveCalculation([FromBody] SaveSheetCalculationRequest req)
    {
        if (req.Length <= 0 || req.Width <= 0 || req.Gsm <= 0 || req.SheetsPerRim <= 0 || req.RequiredSheets <= 0 || req.ConversionFactor <= 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Error",
                Detail = "Dimensions, GSM, Rim Sheets, and Conversion Factor must be strictly positive."
            });
        }

        // Server-side recalculation
        var computed = ComputeCosts(req.Length, req.Width, req.Gsm, req.RatePerKg, req.SheetsPerRim, req.RequiredSheets, req.ConversionFactor);

        var record = new SheetCalculation
        {
            Length = req.Length,
            Width = req.Width,
            Gsm = req.Gsm,
            RatePerKg = req.RatePerKg,
            SheetsPerRim = req.SheetsPerRim,
            RequiredSheets = req.RequiredSheets,
            ConversionFactor = req.ConversionFactor,
            RimPrice = computed.RimPrice,
            PerSheetPrice = computed.PerSheetPrice,
            TotalPaperCost = computed.TotalPaperCost,
            Notes = req.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.SheetCalculations.Add(record);
        await _context.SaveChangesAsync();

        var dto = MapToDto(record, computed.ReferenceRimWeightKg, computed.EquivalentRims);
        return CreatedAtAction(nameof(GetSavedCalculations), new { id = record.CalculationId }, dto);
    }

    /// <summary>
    /// Gets recent saved calculations.
    /// </summary>
    [HttpGet("calculations")]
    [ProducesResponseType(typeof(List<SheetCalculationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SheetCalculationDto>>> GetSavedCalculations(
        [FromQuery] string? search = null,
        [FromQuery] int limit = 50)
    {
        var query = _context.SheetCalculations.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmed = search.Trim().ToLower();
            query = query.Where(c => c.Notes != null && c.Notes.ToLower().Contains(trimmed));
        }

        var records = await query
            .OrderByDescending(c => c.CreatedAt)
            .Take(Math.Clamp(limit, 1, 200))
            .ToListAsync();

        var dtos = records.Select(c =>
        {
            var computed = ComputeCosts(c.Length, c.Width, c.Gsm, c.RatePerKg, c.SheetsPerRim, c.RequiredSheets, c.ConversionFactor);
            return MapToDto(c, computed.ReferenceRimWeightKg, computed.EquivalentRims);
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Deletes a saved calculation from history.
    /// </summary>
    [HttpDelete("calculations/{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSavedCalculation(long id)
    {
        var record = await _context.SheetCalculations.FirstOrDefaultAsync(c => c.CalculationId == id);
        if (record == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Calculation Not Found",
                Detail = $"Saved calculation with ID {id} was not found."
            });
        }

        _context.SheetCalculations.Remove(record);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Excel Reference Calculation Formula:
    /// Rim Price = (Length × Width × GSM ÷ 3100) × Rate per KG × (Sheets per Rim ÷ 500)
    /// Per Sheet Price = Rim Price ÷ Sheets per Rim
    /// Required Sheets Total Cost = Per Sheet Price × Required Sheets
    /// </summary>
    private static CalculateSheetCostResponse ComputeCosts(
        decimal length,
        decimal width,
        decimal gsm,
        decimal ratePerKg,
        int sheetsPerRim,
        int requiredSheets,
        decimal conversionFactor)
    {
        decimal referenceRimWeightKg = (length * width * gsm) / conversionFactor;
        decimal rimMultiplier = (decimal)sheetsPerRim / 500m;
        decimal rimPrice = referenceRimWeightKg * ratePerKg * rimMultiplier;
        decimal perSheetPrice = sheetsPerRim > 0 ? rimPrice / sheetsPerRim : 0m;
        decimal totalPaperCost = perSheetPrice * requiredSheets;
        decimal equivalentRims = sheetsPerRim > 0 ? (decimal)requiredSheets / sheetsPerRim : 0m;

        return new CalculateSheetCostResponse
        {
            Length = length,
            Width = width,
            Gsm = gsm,
            RatePerKg = ratePerKg,
            SheetsPerRim = sheetsPerRim,
            RequiredSheets = requiredSheets,
            ConversionFactor = conversionFactor,
            ReferenceRimWeightKg = Math.Round(referenceRimWeightKg, 4, MidpointRounding.AwayFromZero),
            EquivalentRims = Math.Round(equivalentRims, 2, MidpointRounding.AwayFromZero),
            RimPrice = Math.Round(rimPrice, 2, MidpointRounding.AwayFromZero),
            PerSheetPrice = Math.Round(perSheetPrice, 4, MidpointRounding.AwayFromZero),
            TotalPaperCost = Math.Round(totalPaperCost, 2, MidpointRounding.AwayFromZero)
        };
    }

    private static SheetCalculationDto MapToDto(SheetCalculation c, decimal refWeight, decimal eqRims)
    {
        return new SheetCalculationDto
        {
            CalculationId = c.CalculationId,
            Length = c.Length,
            Width = c.Width,
            Gsm = c.Gsm,
            RatePerKg = c.RatePerKg,
            SheetsPerRim = c.SheetsPerRim,
            RequiredSheets = c.RequiredSheets,
            ConversionFactor = c.ConversionFactor,
            ReferenceRimWeightKg = refWeight,
            EquivalentRims = eqRims,
            RimPrice = Math.Round(c.RimPrice, 2, MidpointRounding.AwayFromZero),
            PerSheetPrice = Math.Round(c.PerSheetPrice, 4, MidpointRounding.AwayFromZero),
            TotalPaperCost = Math.Round(c.TotalPaperCost, 2, MidpointRounding.AwayFromZero),
            Notes = c.Notes,
            CreatedAt = c.CreatedAt
        };
    }
}
