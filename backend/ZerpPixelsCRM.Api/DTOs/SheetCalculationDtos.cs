using System.ComponentModel.DataAnnotations;

namespace ZerpPixelsCRM.Api.DTOs;

public class PaperSizeDto
{
    public int PaperSizeId { get; set; }
    public string SizeName { get; set; } = string.Empty;
    public decimal LengthInches { get; set; }
    public decimal WidthInches { get; set; }
    public bool IsActive { get; set; }
}

public class PrintingMaterialDto
{
    public int MaterialId { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class AddCustomMaterialRequest
{
    [Required]
    [MaxLength(150)]
    public string MaterialName { get; set; } = string.Empty;
}

public class CalculateSheetCostRequest
{
    [Range(0.01, 10000, ErrorMessage = "Length must be greater than zero")]
    public decimal Length { get; set; }

    [Range(0.01, 10000, ErrorMessage = "Width must be greater than zero")]
    public decimal Width { get; set; }

    [Range(0.01, 10000, ErrorMessage = "GSM must be greater than zero")]
    public decimal Gsm { get; set; }

    [Range(0, 10000000, ErrorMessage = "Rate per KG must be non-negative")]
    public decimal RatePerKg { get; set; }

    [Range(1, 1000000, ErrorMessage = "Sheets per Rim must be greater than zero")]
    public int SheetsPerRim { get; set; } = 500;

    [Range(1, 100000000, ErrorMessage = "Required Sheets must be greater than zero")]
    public int RequiredSheets { get; set; } = 500;

    [Range(0.0001, 1000000, ErrorMessage = "Conversion factor must be greater than zero")]
    public decimal ConversionFactor { get; set; } = 3100m;

    public string? MaterialName { get; set; }
    public string? PaperSizeName { get; set; }
}

public class CalculateSheetCostResponse
{
    public decimal Length { get; set; }
    public decimal Width { get; set; }
    public decimal Gsm { get; set; }
    public decimal RatePerKg { get; set; }
    public int SheetsPerRim { get; set; }
    public int RequiredSheets { get; set; }
    public decimal ConversionFactor { get; set; }
    public string? MaterialName { get; set; }
    public string? PaperSizeName { get; set; }

    public decimal ReferenceRimWeightKg { get; set; }
    public decimal EquivalentRims { get; set; }
    public decimal RimPrice { get; set; }
    public decimal PerSheetPrice { get; set; }
    public decimal TotalPaperCost { get; set; }
}

public class SaveSheetCalculationRequest
{
    [Range(0.01, 10000, ErrorMessage = "Length must be greater than zero")]
    public decimal Length { get; set; }

    [Range(0.01, 10000, ErrorMessage = "Width must be greater than zero")]
    public decimal Width { get; set; }

    [Range(0.01, 10000, ErrorMessage = "GSM must be greater than zero")]
    public decimal Gsm { get; set; }

    [Range(0, 10000000, ErrorMessage = "Rate per KG must be non-negative")]
    public decimal RatePerKg { get; set; }

    [Range(1, 1000000, ErrorMessage = "Sheets per Rim must be greater than zero")]
    public int SheetsPerRim { get; set; } = 500;

    [Range(1, 100000000, ErrorMessage = "Required Sheets must be greater than zero")]
    public int RequiredSheets { get; set; } = 500;

    [Range(0.0001, 1000000, ErrorMessage = "Conversion factor must be greater than zero")]
    public decimal ConversionFactor { get; set; } = 3100m;

    public string? MaterialName { get; set; }
    public string? PaperSizeName { get; set; }

    public string? Notes { get; set; }
}

public class SheetCalculationDto
{
    public long CalculationId { get; set; }
    public decimal Length { get; set; }
    public decimal Width { get; set; }
    public decimal Gsm { get; set; }
    public decimal RatePerKg { get; set; }
    public int SheetsPerRim { get; set; }
    public int RequiredSheets { get; set; }
    public decimal ConversionFactor { get; set; }
    public string? MaterialName { get; set; }
    public string? PaperSizeName { get; set; }
    public decimal ReferenceRimWeightKg { get; set; }
    public decimal EquivalentRims { get; set; }
    public decimal RimPrice { get; set; }
    public decimal PerSheetPrice { get; set; }
    public decimal TotalPaperCost { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
