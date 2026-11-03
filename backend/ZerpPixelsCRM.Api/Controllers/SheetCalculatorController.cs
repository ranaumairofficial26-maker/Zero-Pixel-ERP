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
    /// Gets active paper size presets from PostgreSQL database.
    /// </summary>
    /// <summary>
    /// Gets active printing materials from PostgreSQL database.
    /// </summary>
    [HttpGet("materials")]
    [ProducesResponseType(typeof(List<PrintingMaterialDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PrintingMaterialDto>>> GetMaterials()
    {
        var materials = await _context.PrintingMaterials
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.MaterialId)
            .Select(m => new PrintingMaterialDto
            {
                MaterialId = m.MaterialId,
                MaterialName = m.MaterialName,
                IsActive = m.IsActive,
                DefaultLength = m.DefaultLength,
                DefaultWidth = m.DefaultWidth,
                DefaultGsm = m.DefaultGsm,
                DefaultRatePerKg = m.DefaultRatePerKg,
                DefaultSheetsPerRim = m.DefaultSheetsPerRim,
                DefaultConversionFactor = m.DefaultConversionFactor
            })
            .ToListAsync();

        return Ok(materials);
    }

    /// <summary>
    /// Adds a custom material to PostgreSQL master without duplicates.
    /// </summary>
    [HttpPost("materials")]
    [ProducesResponseType(typeof(PrintingMaterialDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PrintingMaterialDto>> AddMaterial([FromBody] AddCustomMaterialRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.MaterialName))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Material Name",
                Detail = "Material name cannot be empty."
            });
        }

        var trimmed = req.MaterialName.Trim();
        var existing = await _context.PrintingMaterials
            .FirstOrDefaultAsync(m => m.MaterialName.ToLower() == trimmed.ToLower());

        if (existing != null)
        {
            return Ok(new PrintingMaterialDto
            {
                MaterialId = existing.MaterialId,
                MaterialName = existing.MaterialName,
                IsActive = existing.IsActive
            });
        }

        var newMat = new PrintingMaterial
        {
            MaterialName = trimmed,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PrintingMaterials.Add(newMat);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMaterials), new { id = newMat.MaterialId }, new PrintingMaterialDto
        {
            MaterialId = newMat.MaterialId,
            MaterialName = newMat.MaterialName,
            IsActive = newMat.IsActive
        });
    }

    [HttpGet("paper-sizes")]
    [ProducesResponseType(typeof(List<PaperSizeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PaperSizeDto>>> GetPaperSizes()
    {
        var sizes = await _context.PaperSizes
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.PaperSizeId)
            .Select(s => new PaperSizeDto
            {
                PaperSizeId = s.PaperSizeId,
                SizeName = s.SizeName,
                LengthInches = s.LengthInches,
                WidthInches = s.WidthInches,
                IsActive = s.IsActive
            })
            .ToListAsync();

        return Ok(sizes);
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

        var result = ComputeCosts(req.Length, req.Width, req.Gsm, req.RatePerKg, req.SheetsPerRim, req.RequiredSheets, req.ConversionFactor, req.PaperSizeName, req.MaterialName);
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
        var computed = ComputeCosts(req.Length, req.Width, req.Gsm, req.RatePerKg, req.SheetsPerRim, req.RequiredSheets, req.ConversionFactor, req.PaperSizeName, req.MaterialName);

        var record = new SheetCalculation
        {
            Length = req.Length,
            Width = req.Width,
            Gsm = req.Gsm,
            RatePerKg = req.RatePerKg,
            SheetsPerRim = req.SheetsPerRim,
            RequiredSheets = req.RequiredSheets,
            ConversionFactor = req.ConversionFactor,
            MaterialName = req.MaterialName?.Trim(),
            PaperSizeName = req.PaperSizeName?.Trim(),
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
            query = query.Where(c => (c.Notes != null && c.Notes.ToLower().Contains(trimmed)) || (c.MaterialName != null && c.MaterialName.ToLower().Contains(trimmed)) || (c.PaperSizeName != null && c.PaperSizeName.ToLower().Contains(trimmed)));
        }

        var records = await query
            .OrderByDescending(c => c.CreatedAt)
            .Take(Math.Clamp(limit, 1, 200))
            .ToListAsync();

        var dtos = records.Select(c =>
        {
            var computed = ComputeCosts(c.Length, c.Width, c.Gsm, c.RatePerKg, c.SheetsPerRim, c.RequiredSheets, c.ConversionFactor, c.PaperSizeName, c.MaterialName);
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
        decimal conversionFactor,
        string? paperSizeName = null, string? materialName = null)
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
            MaterialName = materialName,
            PaperSizeName = paperSizeName,
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
            MaterialName = c.MaterialName,
            PaperSizeName = c.PaperSizeName,
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
