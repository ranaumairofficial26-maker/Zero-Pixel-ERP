using System.Text.Json.Serialization;

namespace ZerpPixelsCRM.Api.DTOs;

public class PrintingCategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? SourceCategoryName { get; set; }
    public int ItemCount { get; set; }
    public string? ItemNumberRange { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class PrintingItemDto
{
    public int ItemId { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? SourceItemNumber { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal? DefaultWidthMm { get; set; }
    public decimal? DefaultHeightMm { get; set; }
    public string? InchesStr { get; set; }
    public string? CmStr { get; set; }
    public string? MmStr { get; set; }
    public string? SizingBasis { get; set; }
    public string? SourceNotes { get; set; }
    public bool IsCustom { get; set; }
}

public class CreateCustomItemRequest
{
    public int CategoryId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal? DefaultWidthMm { get; set; }
    public decimal? DefaultHeightMm { get; set; }
    public string? InchesStr { get; set; }
    public string? CmStr { get; set; }
    public string? MmStr { get; set; }
    public string? SizingBasis { get; set; }
    public string? SourceNotes { get; set; }
}

public class PaperSizeDto
{
    public int PaperSizeId { get; set; }
    public string SizeName { get; set; } = string.Empty;
    public decimal? LengthInches { get; set; }
    public decimal? WidthInches { get; set; }
    public decimal? WidthMm { get; set; }
    public decimal? HeightMm { get; set; }
    public string SizeType { get; set; } = "StockPaper";
    public bool IsActive { get; set; }
}

public class PrintingSizeDto
{
    public int SizeId { get; set; }
    public string SizeName { get; set; } = string.Empty;
    public decimal? WidthMm { get; set; }
    public decimal? HeightMm { get; set; }
    public decimal? WidthCm => WidthMm.HasValue ? Math.Round(WidthMm.Value / 10m, 2) : null;
    public decimal? HeightCm => HeightMm.HasValue ? Math.Round(HeightMm.Value / 10m, 2) : null;
    public decimal? WidthInches => WidthMm.HasValue ? Math.Round(WidthMm.Value / 25.4m, 2) : null;
    public decimal? HeightInches => HeightMm.HasValue ? Math.Round(HeightMm.Value / 25.4m, 2) : null;
    public bool IsApplicableToCurrentItem { get; set; }
    public bool IsDefault { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePaperSizeRequest
{
    public string SizeName { get; set; } = string.Empty;
    public decimal? LengthInches { get; set; }
    public decimal? WidthInches { get; set; }
    public decimal? WidthMm { get; set; }
    public decimal? HeightMm { get; set; }
    public string SizeType { get; set; } = "StockPaper";
}

public class PrintingMaterialDto
{
    public int MaterialId { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public decimal? DefaultLength { get; set; }
    public decimal? DefaultWidth { get; set; }
    public decimal? DefaultGsm { get; set; }
    public decimal? DefaultRatePerKg { get; set; }
    public int DefaultSheetsPerRim { get; set; }
    public decimal DefaultConversionFactor { get; set; }
    public string PricingMethod { get; set; } = "RatePerKg";
    public decimal? PacketPrice { get; set; }
    public int? SheetsPerPacket { get; set; }
    public decimal? DirectRimPrice { get; set; }
    public decimal? DirectSheetPrice { get; set; }
    public bool IsCustom { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCustomMaterialRequest
{
    public string MaterialName { get; set; } = string.Empty;
    public decimal? DefaultLength { get; set; }
    public decimal? DefaultWidth { get; set; }
    public decimal? DefaultGsm { get; set; }
    public decimal? DefaultRatePerKg { get; set; }
    public int DefaultSheetsPerRim { get; set; } = 500;
    public decimal DefaultConversionFactor { get; set; } = 3100m;
    public string PricingMethod { get; set; } = "RatePerKg";
    public decimal? PacketPrice { get; set; }
    public int? SheetsPerPacket { get; set; }
    public decimal? DirectRimPrice { get; set; }
    public decimal? DirectSheetPrice { get; set; }
}

public class MaterialPriceProfileDto
{
    public int ProfileId { get; set; }
    public int MaterialId { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public int? PaperSizeId { get; set; }
    public string? PaperSizeName { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal? Gsm { get; set; }
    public string PricingMethod { get; set; } = "RatePerKg";
    public decimal? RatePerKg { get; set; }
    public decimal? PacketPrice { get; set; }
    public int? SheetsPerPacket { get; set; }
    public decimal? RimPrice { get; set; }
    public int SheetsPerRim { get; set; } = 500;
    public decimal ConversionFactor { get; set; } = 3100m;
    public decimal? DirectSheetPrice { get; set; }
    public decimal ComputedPerSheetPrice { get; set; }
    public bool IsActive { get; set; }
}

public class CostCategoryDto
{
    public int CostCategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public string DefaultCalculationMethod { get; set; } = "FixedAmount";
    public decimal? DefaultRate { get; set; }
    public bool IsActive { get; set; }
}

// Estimate calculation models
public class EstimateQuantityInputDto
{
    public long? QuantityId { get; set; }
    public int Quantity { get; set; }
    public decimal SheetsRequired { get; set; }
    public decimal WastagePercent { get; set; } = 0;
    public decimal WastageSheets { get; set; } = 0;
    public decimal TotalSheets { get; set; }
    public string? Notes { get; set; }
}

public class EstimateCostItemInputDto
{
    public long? CostItemId { get; set; }
    public int? CostCategoryId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string CalculationMethod { get; set; } = "FixedAmount"; // FixedAmount, ManualAmount, RatePerUnit, PerPiece, PerSheet
    public decimal UnitRate { get; set; } = 0;
    public string? Notes { get; set; }
    // Key: Quantity integer (e.g. 100, 250, 500), Value: Cost amount for that quantity
    public Dictionary<int, decimal> QuantityAmounts { get; set; } = new();
}

public class CalculateEstimateRequest
{
    // Pricing Method: RatePerKg, PacketPrice, DirectRimPrice, DirectSheetPrice, ManualMaterialCost
    public string PricingMethod { get; set; } = "RatePerKg";
    public decimal? LengthInches { get; set; }
    public decimal? WidthInches { get; set; }
    public decimal? Gsm { get; set; }
    public decimal? RatePerKg { get; set; }
    public decimal ConversionFactor { get; set; } = 3100m;
    public decimal? PacketPrice { get; set; }
    public int? SheetsPerPacket { get; set; }
    public decimal? RimPrice { get; set; }
    public int SheetsPerRim { get; set; } = 500;
    public decimal? DirectSheetPrice { get; set; }
    public decimal? ManualMaterialCost { get; set; }

    public decimal ProfitPercentage { get; set; } = 20m;
    public decimal TaxPercentage { get; set; } = 0m;

    public List<EstimateQuantityInputDto> Quantities { get; set; } = new();
    public List<EstimateCostItemInputDto> CostItems { get; set; } = new();
}

public class QuantityCalculationResultDto
{
    public int Quantity { get; set; }
    public decimal SheetsRequired { get; set; }
    public decimal WastageSheets { get; set; }
    public decimal TotalSheets { get; set; }
    public decimal MaterialCost { get; set; }
    public Dictionary<string, decimal> CostItemBreakdown { get; set; } = new();
    public decimal AdditionalExpenses { get; set; }
    public decimal ProductionCost { get; set; }
    public decimal ProfitAmount { get; set; }
    public decimal SubtotalBeforeTax { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal PerPiecePrice { get; set; }
}

public class CalculateEstimateResponse
{
    public decimal ComputedPerSheetPrice { get; set; }
    public List<QuantityCalculationResultDto> Results { get; set; } = new();
}

// Save Estimate Request
public class SaveEstimateRequest
{
    public long? EstimateId { get; set; }
    public string? EstimateNumber { get; set; }
    public string EstimateTitle { get; set; } = "New Estimate";
    public int? CategoryId { get; set; }
    public int? ItemId { get; set; }
    public string? CustomItemName { get; set; }
    public string? ProductType { get; set; }
    public string? JobTitle { get; set; }
    public string? JobDescription { get; set; }
    public string? PrintingSide { get; set; } = "Single";
    public string? ColorMode { get; set; } = "4 Color";
    public short? PrintingColorCount { get; set; }
    public decimal? RatePerColor { get; set; }
    public string? FinishingRequirements { get; set; }
    public string? AdminNotes { get; set; }

    // Dimensions & Printing Sizes (Step 2)
    public int? PrintingSizeId { get; set; }
    public string? PrintingSizeName { get; set; }
    public decimal? WidthMm { get; set; }
    public decimal? HeightMm { get; set; }
    public string MeasurementUnit { get; set; } = "MM";
    public decimal? FinishedWidth { get; set; }
    public decimal? FinishedHeight { get; set; }
    public string FinishedUnit { get; set; } = "in";
    public int? StockPaperSizeId { get; set; }
    public decimal? StockPaperLength { get; set; }
    public decimal? StockPaperWidth { get; set; }
    public string StockPaperUnit { get; set; } = "in";

    // Material
    public int? MaterialId { get; set; }
    public string? CustomMaterialName { get; set; }
    public string? MaterialVariantName { get; set; }
    public decimal? Gsm { get; set; }
    public string PricingMethod { get; set; } = "RatePerKg";
    public decimal? RatePerKg { get; set; }
    public decimal ConversionFactor { get; set; } = 3100m;
    public decimal? PacketPrice { get; set; }
    public int? SheetsPerPacket { get; set; }
    public decimal? RimPrice { get; set; }
    public int SheetsPerRim { get; set; } = 500;
    public decimal? DirectSheetPrice { get; set; }
    public decimal? ManualMaterialCost { get; set; }
    public decimal ComputedPerSheetPrice { get; set; }

    public decimal ProfitPercentage { get; set; } = 20m;
    public decimal TaxPercentage { get; set; } = 0m;

    public List<EstimateQuantityInputDto> Quantities { get; set; } = new();
    public List<EstimateCostItemInputDto> CostItems { get; set; } = new();
}

public class EstimateSummaryDto
{
    public long EstimateId { get; set; }
    public string EstimateNumber { get; set; } = string.Empty;
    public string EstimateTitle { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public string? ItemName { get; set; }
    public string? MaterialName { get; set; }
    public string Status { get; set; } = "Draft";
    public string QuantitiesSummary { get; set; } = string.Empty;
    public decimal MinGrandTotal { get; set; }
    public decimal MaxGrandTotal { get; set; }
    public decimal BestPerPiecePrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class EstimateDetailDto : SaveEstimateRequest
{
    public new long EstimateId { get; set; }
    public string? CategoryName { get; set; }
    public string? ItemName { get; set; }
    public string? MaterialName { get; set; }
    public string Status { get; set; } = "Draft";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<QuantityCalculationResultDto> Results { get; set; } = new();
}

public class LinkEstimateToQuotationRequest
{
    public long EstimateId { get; set; }
    public int SelectedQuantity { get; set; }
    public long? ExistingQuotationId { get; set; }
    public long? ClientId { get; set; }
    public string? ItemTitleOverride { get; set; }
    public string? DescriptionOverride { get; set; }
    public decimal? UnitPriceOverride { get; set; }
}

