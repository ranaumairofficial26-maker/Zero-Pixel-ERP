using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Interfaces;

namespace ZerpPixelsCRM.Api.Controllers;

[ApiController]
[Route("api/printing-calculator")]
[Authorize]
public class PrintingCalculatorController : ControllerBase
{
    private readonly IPrintingCalculatorService _printingCalculatorService;
    private readonly ILogger<PrintingCalculatorController> _logger;

    public PrintingCalculatorController(
        IPrintingCalculatorService printingCalculatorService,
        ILogger<PrintingCalculatorController> logger)
    {
        _printingCalculatorService = printingCalculatorService;
        _logger = logger;
    }

    [HttpGet("import-status")]
    public async Task<IActionResult> GetImportStatus()
    {
        var status = await _printingCalculatorService.GetImportStatusAsync();
        return Ok(status);
    }

    // 1. Categories
    [HttpGet("categories")]
    public async Task<ActionResult<List<PrintingCategoryDto>>> GetCategories()
    {
        var categories = await _printingCalculatorService.GetCategoriesAsync();
        return Ok(categories);
    }

    // 2. Printing Items
    [HttpGet("items")]
    public async Task<ActionResult<List<PrintingItemDto>>> GetItems([FromQuery] int? categoryId)
    {
        var items = await _printingCalculatorService.GetItemsAsync(categoryId);
        return Ok(items);
    }

    // 3. Create Custom Printing Item
    [HttpPost("items/custom")]
    public async Task<ActionResult<PrintingItemDto>> CreateCustomItem([FromBody] CreateCustomItemRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.ItemName))
        {
            return BadRequest(new { message = "Item name is required." });
        }

        try
        {
            var item = await _printingCalculatorService.CreateCustomItemAsync(req);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 4. Paper Sizes
    [HttpGet("paper-sizes")]
    public async Task<ActionResult<List<PaperSizeDto>>> GetPaperSizes([FromQuery] string? type)
    {
        var sizes = await _printingCalculatorService.GetPaperSizesAsync(type);
        return Ok(sizes);
    }

    // 5. Create Custom Paper Size
    [HttpPost("paper-sizes")]
    public async Task<ActionResult<PaperSizeDto>> CreatePaperSize([FromBody] CreatePaperSizeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.SizeName))
        {
            return BadRequest(new { message = "Size name is required." });
        }

        var paperSize = await _printingCalculatorService.CreatePaperSizeAsync(req);
        return Ok(paperSize);
    }

    // 5.1 Printing Sizes (Step 2 - Size Selection)
    [HttpGet("printing-sizes")]
    public async Task<ActionResult<List<PrintingSizeDto>>> GetPrintingSizes([FromQuery] int? itemId)
    {
        var sizes = await _printingCalculatorService.GetPrintingSizesAsync(itemId);
        return Ok(sizes);
    }

    [HttpGet("printing-sizes/{id:int}")]
    public async Task<ActionResult<PrintingSizeDto>> GetPrintingSize(int id)
    {
        var size = await _printingCalculatorService.GetPrintingSizeByIdAsync(id);
        if (size == null)
        {
            return NotFound(new { message = "Printing size not found." });
        }
        return Ok(size);
    }

    // 6. Materials
    [HttpGet("materials")]
    public async Task<ActionResult<List<PrintingMaterialDto>>> GetMaterials()
    {
        var materials = await _printingCalculatorService.GetMaterialsAsync();
        return Ok(materials);
    }

    // 7. Create Custom Material
    [HttpPost("materials/custom")]
    public async Task<ActionResult<PrintingMaterialDto>> CreateCustomMaterial([FromBody] CreateCustomMaterialRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.MaterialName))
        {
            return BadRequest(new { message = "Material name is required." });
        }

        var material = await _printingCalculatorService.CreateCustomMaterialAsync(req);
        return Ok(material);
    }

    // 8. Cost Categories
    [HttpGet("cost-categories")]
    public async Task<ActionResult<List<CostCategoryDto>>> GetCostCategories()
    {
        var categories = await _printingCalculatorService.GetCostCategoriesAsync();
        return Ok(categories);
    }

    // 9. Calculation Engine
    [HttpPost("calculate")]
    public ActionResult<CalculateEstimateResponse> Calculate([FromBody] CalculateEstimateRequest req)
    {
        var response = _printingCalculatorService.CalculateEstimate(req);
        return Ok(response);
    }

    // 10. List Saved Estimates
    [HttpGet("estimates")]
    public async Task<ActionResult<List<EstimateSummaryDto>>> GetEstimates(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var estimates = await _printingCalculatorService.GetEstimatesSummaryListAsync(null, null, search, pageSize);
        return Ok(estimates);
    }

    // 11. Get Estimate Details
    [HttpGet("estimates/{id:long}")]
    public async Task<ActionResult<EstimateDetailDto>> GetEstimate(long id)
    {
        var detail = await _printingCalculatorService.GetEstimateByIdAsync(id);
        if (detail == null)
        {
            return NotFound(new { message = "Estimate not found." });
        }
        return Ok(detail);
    }

    // 12. Save / Update Estimate
    [HttpPost("estimates")]
    public async Task<ActionResult<EstimateDetailDto>> SaveEstimate([FromBody] SaveEstimateRequest req)
    {
        try
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var result = await _printingCalculatorService.SaveEstimateAsync(req, userEmail);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving printing cost estimate");
            return StatusCode(500, new { message = "Failed to save estimate: " + ex.Message });
        }
    }

    // 13. Delete Estimate (Soft Delete)
    [HttpDelete("estimates/{id:long}")]
    public async Task<IActionResult> DeleteEstimate(long id)
    {
        var deleted = await _printingCalculatorService.DeleteEstimateAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Estimate not found." });
        }
        return Ok(new { success = true, message = "Estimate deleted successfully." });
    }

    // 14. Duplicate Estimate
    [HttpPost("estimates/{id:long}/duplicate")]
    public async Task<ActionResult<EstimateDetailDto>> DuplicateEstimate(long id)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var duplicated = await _printingCalculatorService.DuplicateEstimateAsync(id, userEmail);
        if (duplicated == null)
        {
            return NotFound(new { message = "Source estimate not found." });
        }
        return Ok(duplicated);
    }

    // 15. Link Estimate Quantity to Smart Quotations
    [HttpPost("estimates/link-to-quotation")]
    public async Task<IActionResult> LinkToQuotation([FromBody] LinkEstimateToQuotationRequest req)
    {
        try
        {
            var (success, error, data) = await _printingCalculatorService.LinkToQuotationAsync(req);
            if (!success)
            {
                return BadRequest(new { message = error });
            }
            return Ok(data);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error linking estimate to quotation");
            return StatusCode(500, new { message = "Failed to link estimate: " + ex.Message });
        }
    }
}
