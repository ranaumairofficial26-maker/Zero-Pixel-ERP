using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class PrintingCalculatorService : IPrintingCalculatorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PrintingCalculatorService> _logger;

    public PrintingCalculatorService(IUnitOfWork unitOfWork, ILogger<PrintingCalculatorService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<object> GetImportStatusAsync()
    {
        var categoryCount = await _unitOfWork.PrintingCalculator.GetCategoryCountAsync();
        var itemCount = await _unitOfWork.PrintingCalculator.GetItemCountAsync();
        var paperSizeCount = await _unitOfWork.PrintingCalculator.GetPaperSizeCountAsync();
        var materialCount = await _unitOfWork.PrintingCalculator.GetMaterialCountAsync();

        return new
        {
            success = true,
            categoriesCount = categoryCount,
            itemsCount = itemCount,
            paperSizesCount = paperSizeCount,
            materialsCount = materialCount,
            status = categoryCount >= 12 && itemCount >= 195 ? "Ready" : "PendingSeed"
        };
    }

    public async Task<List<PrintingCategoryDto>> GetCategoriesAsync()
    {
        var categories = await _unitOfWork.PrintingCalculator.GetActiveCategoriesAsync();
        return categories.Select(c => new PrintingCategoryDto
        {
            CategoryId = c.CategoryId,
            CategoryName = c.CategoryName,
            SourceCategoryName = c.SourceCategoryName,
            ItemCount = c.ItemCount,
            ItemNumberRange = c.ItemNumberRange,
            DisplayOrder = c.DisplayOrder,
            IsActive = c.IsActive
        }).ToList();
    }

    public async Task<List<PrintingItemDto>> GetItemsAsync(int? categoryId)
    {
        var items = await _unitOfWork.PrintingCalculator.GetItemsAsync(categoryId);
        return items.Select(i => new PrintingItemDto
        {
            ItemId = i.ItemId,
            CategoryId = i.CategoryId,
            CategoryName = i.Category != null ? i.Category.CategoryName : "",
            SourceItemNumber = i.SourceItemNumber,
            ItemName = i.ItemName,
            DefaultWidthMm = i.DefaultWidthMm,
            DefaultHeightMm = i.DefaultHeightMm,
            InchesStr = i.InchesStr,
            CmStr = i.CmStr,
            MmStr = i.MmStr,
            SizingBasis = i.SizingBasis,
            SourceNotes = i.SourceNotes,
            IsCustom = i.IsCustom
        }).ToList();
    }

    public async Task<PrintingItemDto> CreateCustomItemAsync(CreateCustomItemRequest req)
    {
        var category = await _unitOfWork.PrintingCalculator.GetCategoryByIdAsync(req.CategoryId);
        if (category == null)
        {
            throw new ArgumentException("Invalid category.");
        }

        var item = new PrintingItem
        {
            CategoryId = req.CategoryId,
            ItemName = req.ItemName.Trim(),
            DefaultWidthMm = req.DefaultWidthMm,
            DefaultHeightMm = req.DefaultHeightMm,
            InchesStr = req.InchesStr?.Trim(),
            CmStr = req.CmStr?.Trim(),
            MmStr = req.MmStr?.Trim(),
            SizingBasis = string.IsNullOrWhiteSpace(req.SizingBasis) ? "Custom size" : req.SizingBasis.Trim(),
            SourceNotes = req.SourceNotes?.Trim(),
            IsCustom = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _unitOfWork.PrintingCalculator.AddCustomItemAsync(item);

        return new PrintingItemDto
        {
            ItemId = created.ItemId,
            CategoryId = created.CategoryId,
            CategoryName = category.CategoryName,
            ItemName = created.ItemName,
            DefaultWidthMm = created.DefaultWidthMm,
            DefaultHeightMm = created.DefaultHeightMm,
            InchesStr = created.InchesStr,
            CmStr = created.CmStr,
            MmStr = created.MmStr,
            SizingBasis = created.SizingBasis,
            SourceNotes = created.SourceNotes,
            IsCustom = created.IsCustom
        };
    }

    public async Task<List<PaperSizeDto>> GetPaperSizesAsync(string? type)
    {
        var sizes = await _unitOfWork.PrintingCalculator.GetPaperSizesAsync(type);
        return sizes.Select(p => new PaperSizeDto
        {
            PaperSizeId = p.PaperSizeId,
            SizeName = p.SizeName,
            LengthInches = p.LengthInches,
            WidthInches = p.WidthInches,
            WidthMm = p.WidthMm,
            HeightMm = p.HeightMm,
            SizeType = p.SizeType,
            IsActive = p.IsActive
        }).ToList();
    }

    public async Task<PaperSizeDto> CreatePaperSizeAsync(CreatePaperSizeRequest req)
    {
        var paperSize = new PaperSize
        {
            SizeName = req.SizeName.Trim(),
            LengthInches = req.LengthInches,
            WidthInches = req.WidthInches,
            WidthMm = req.WidthMm,
            HeightMm = req.HeightMm,
            SizeType = string.IsNullOrWhiteSpace(req.SizeType) ? "StockPaper" : req.SizeType.Trim(),
            IsActive = true
        };

        var created = await _unitOfWork.PrintingCalculator.AddPaperSizeAsync(paperSize);

        return new PaperSizeDto
        {
            PaperSizeId = created.PaperSizeId,
            SizeName = created.SizeName,
            LengthInches = created.LengthInches,
            WidthInches = created.WidthInches,
            WidthMm = created.WidthMm,
            HeightMm = created.HeightMm,
            SizeType = created.SizeType,
            IsActive = created.IsActive
        };
    }

    public async Task<List<PrintingSizeDto>> GetPrintingSizesAsync(int? itemId)
    {
        var allSizes = await _unitOfWork.PrintingCalculator.GetAllActivePrintingSizesAsync();

        var itemLinks = new Dictionary<int, bool>();
        if (itemId.HasValue && itemId.Value > 0)
        {
            var links = await _unitOfWork.PrintingCalculator.GetPrintingItemSizesByItemIdAsync(itemId.Value);
            foreach (var link in links)
            {
                itemLinks[link.SizeId] = link.IsDefault;
            }

            var item = await _unitOfWork.PrintingCalculator.GetItemByIdAsync(itemId.Value);
            if (item != null && item.DefaultWidthMm.HasValue && item.DefaultHeightMm.HasValue)
            {
                var w = Math.Round(item.DefaultWidthMm.Value, 0);
                var h = Math.Round(item.DefaultHeightMm.Value, 0);

                foreach (var s in allSizes)
                {
                    if (s.WidthMm.HasValue && s.HeightMm.HasValue)
                    {
                        var sw = Math.Round(s.WidthMm.Value, 0);
                        var sh = Math.Round(s.HeightMm.Value, 0);
                        if ((w == sw && h == sh) || (w == sh && h == sw))
                        {
                            if (!itemLinks.ContainsKey(s.SizeId))
                            {
                                itemLinks[s.SizeId] = true;
                            }
                        }
                    }
                }
            }
        }

        var filteredSizes = allSizes.Where(s =>
            itemLinks.ContainsKey(s.SizeId) ||
            s.DisplayOrder < 20 ||
            s.SizeName == "Custom Size"
        );

        return filteredSizes
            .Select(s => new PrintingSizeDto
            {
                SizeId = s.SizeId,
                SizeName = s.SizeName,
                WidthMm = s.WidthMm,
                HeightMm = s.HeightMm,
                IsApplicableToCurrentItem = itemLinks.ContainsKey(s.SizeId),
                IsDefault = itemLinks.GetValueOrDefault(s.SizeId, false),
                DisplayOrder = s.DisplayOrder,
                IsActive = s.IsActive
            })
            .OrderBy(s => s.SizeName == "Custom Size" ? 2 : (s.IsApplicableToCurrentItem ? 0 : 1))
            .ThenBy(s => s.DisplayOrder)
            .ThenBy(s => s.SizeId)
            .ToList();
    }

    public async Task<PrintingSizeDto?> GetPrintingSizeByIdAsync(int id)
    {
        var s = await _unitOfWork.PrintingCalculator.GetPrintingSizeByIdAsync(id);
        if (s == null || !s.IsActive) return null;

        return new PrintingSizeDto
        {
            SizeId = s.SizeId,
            SizeName = s.SizeName,
            WidthMm = s.WidthMm,
            HeightMm = s.HeightMm,
            DisplayOrder = s.DisplayOrder,
            IsActive = s.IsActive
        };
    }

    public async Task<List<PrintingMaterialDto>> GetMaterialsAsync()
    {
        var materials = await _unitOfWork.PrintingCalculator.GetMaterialsAsync();
        return materials.Select(m => new PrintingMaterialDto
        {
            MaterialId = m.MaterialId,
            MaterialName = m.MaterialName,
            DefaultLength = m.DefaultLength,
            DefaultWidth = m.DefaultWidth,
            DefaultGsm = m.DefaultGsm,
            DefaultRatePerKg = m.DefaultRatePerKg,
            DefaultSheetsPerRim = m.DefaultSheetsPerRim ?? 500,
            DefaultConversionFactor = m.DefaultConversionFactor ?? 3100m,
            PricingMethod = m.PricingMethod ?? "RatePerKg",
            PacketPrice = m.PacketPrice,
            SheetsPerPacket = m.SheetsPerPacket,
            IsActive = m.IsActive
        }).ToList();
    }

    public async Task<PrintingMaterialDto> CreateCustomMaterialAsync(CreateCustomMaterialRequest req)
    {
        var mat = new PrintingMaterial
        {
            MaterialName = req.MaterialName.Trim(),
            DefaultLength = req.DefaultLength,
            DefaultWidth = req.DefaultWidth,
            DefaultGsm = req.DefaultGsm,
            DefaultRatePerKg = req.DefaultRatePerKg,
            DefaultSheetsPerRim = req.DefaultSheetsPerRim > 0 ? req.DefaultSheetsPerRim : 500,
            DefaultConversionFactor = req.DefaultConversionFactor > 0 ? req.DefaultConversionFactor : 3100m,
            PricingMethod = string.IsNullOrWhiteSpace(req.PricingMethod) ? "RatePerKg" : req.PricingMethod.Trim(),
            PacketPrice = req.PacketPrice,
            SheetsPerPacket = req.SheetsPerPacket,
            IsActive = true
        };

        var created = await _unitOfWork.PrintingCalculator.AddCustomMaterialAsync(mat);

        return new PrintingMaterialDto
        {
            MaterialId = created.MaterialId,
            MaterialName = created.MaterialName,
            DefaultLength = created.DefaultLength,
            DefaultWidth = created.DefaultWidth,
            DefaultGsm = created.DefaultGsm,
            DefaultRatePerKg = created.DefaultRatePerKg,
            DefaultSheetsPerRim = created.DefaultSheetsPerRim ?? 500,
            DefaultConversionFactor = created.DefaultConversionFactor ?? 3100m,
            PricingMethod = created.PricingMethod ?? "RatePerKg",
            PacketPrice = created.PacketPrice,
            SheetsPerPacket = created.SheetsPerPacket,
            IsActive = created.IsActive
        };
    }

    public async Task<List<CostCategoryDto>> GetCostCategoriesAsync()
    {
        var cats = await _unitOfWork.PrintingCalculator.GetCostCategoriesAsync();
        return cats.Select(c => new CostCategoryDto
        {
            CostCategoryId = c.CategoryId,
            CategoryName = c.CategoryName,
            DisplayOrder = c.DisplayOrder,
            DefaultCalculationMethod = c.DefaultCalculationMethod ?? "FixedAmount",
            DefaultRate = c.DefaultRate,
            IsActive = c.IsActive
        }).ToList();
    }

    public CalculateEstimateResponse CalculateEstimate(CalculateEstimateRequest req)
    {
        return ComputeEstimateResults(req);
    }

    public async Task<List<EstimateSummaryDto>> GetEstimatesSummaryListAsync(int? categoryId, int? itemId, string? search, int limit)
    {
        var estimates = await _unitOfWork.PrintingCalculator.GetEstimatesSummaryListAsync(categoryId, itemId, search, limit);

        return estimates.Select(e => new EstimateSummaryDto
        {
            EstimateId = e.EstimateId,
            EstimateNumber = e.EstimateNumber,
            EstimateTitle = e.JobTitle,
            CategoryName = e.PrintingCategory != null ? e.PrintingCategory.CategoryName : null,
            ItemName = e.PrintingItem != null ? e.PrintingItem.ItemName : null,
            MaterialName = e.Material != null ? e.Material.MaterialName : null,
            Status = e.Status,
            QuantitiesSummary = string.Join(", ", e.Quantities.OrderBy(q => q.Quantity).Select(q => q.Quantity)),
            MinGrandTotal = e.Quantities.Where(q => q.Result != null).Any() ? e.Quantities.Where(q => q.Result != null).Min(q => q.Result!.GrandTotal) : 0,
            MaxGrandTotal = e.Quantities.Where(q => q.Result != null).Any() ? e.Quantities.Where(q => q.Result != null).Max(q => q.Result!.GrandTotal) : 0,
            BestPerPiecePrice = e.Quantities.Where(q => q.Result != null).Any() ? e.Quantities.Where(q => q.Result != null).Min(q => q.Result!.PerPieceCost) : 0,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt ?? e.CreatedAt
        }).ToList();
    }

    public async Task<EstimateDetailDto?> GetEstimateByIdAsync(long id)
    {
        var estimate = await _unitOfWork.PrintingCalculator.GetEstimateWithFullDetailsAsync(id);
        if (estimate == null) return null;

        return MapToEstimateDetailDto(estimate);
    }

    public async Task<EstimateDetailDto> SaveEstimateAsync(SaveEstimateRequest req, string? userEmail)
    {
        if (string.IsNullOrWhiteSpace(req.EstimateTitle))
        {
            req.EstimateTitle = !string.IsNullOrWhiteSpace(req.JobTitle) ? req.JobTitle : "Printing Cost Estimate";
        }

        if (req.PrintingColorCount.HasValue && (req.PrintingColorCount < 0 || req.PrintingColorCount > 10))
        {
            throw new ArgumentException("Printing color count must be between 0 (None) and 10.");
        }

        var calcReq = new CalculateEstimateRequest
        {
            PricingMethod = req.PricingMethod,
            LengthInches = req.StockPaperLength,
            WidthInches = req.StockPaperWidth,
            Gsm = req.Gsm,
            RatePerKg = req.RatePerKg,
            ConversionFactor = req.ConversionFactor > 0 ? req.ConversionFactor : 3100m,
            PacketPrice = req.PacketPrice,
            SheetsPerPacket = req.SheetsPerPacket,
            RimPrice = req.RimPrice,
            SheetsPerRim = req.SheetsPerRim > 0 ? req.SheetsPerRim : 500,
            DirectSheetPrice = req.DirectSheetPrice,
            ManualMaterialCost = req.ManualMaterialCost,
            ProfitPercentage = req.ProfitPercentage,
            TaxPercentage = req.TaxPercentage,
            Quantities = req.Quantities,
            CostItems = req.CostItems
        };

        var calcRes = ComputeEstimateResults(calcReq);
        req.ComputedPerSheetPrice = calcRes.ComputedPerSheetPrice;

        PrintingCostEstimate estimate;

        if (req.EstimateId.HasValue && req.EstimateId.Value > 0)
        {
            estimate = await _unitOfWork.PrintingCalculator.GetEstimateWithFullDetailsAsync(req.EstimateId.Value)
                       ?? throw new KeyNotFoundException("Estimate not found to update.");

            // Clear child items in context
            _unitOfWork.Context.EstimateQuantities.RemoveRange(estimate.Quantities);
        }
        else
        {
            estimate = new PrintingCostEstimate
            {
                EstimateNumber = GenerateEstimateNumber(),
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.PrintingCalculator.AddAsync(estimate);
        }

        estimate.JobTitle = req.EstimateTitle.Trim();
        estimate.ProductType = req.ProductType?.Trim();
        estimate.PrintingCategoryId = req.CategoryId;
        estimate.PrintingItemId = req.ItemId;
        estimate.MaterialId = req.MaterialId;
        estimate.PaperSizeId = req.StockPaperSizeId;
        estimate.PrintingSide = req.PrintingSide?.Trim() ?? "Single";
        estimate.ColorMode = req.ColorMode?.Trim() ?? (req.PrintingColorCount.HasValue
            ? (req.PrintingColorCount.Value == 0 ? "None" : $"{req.PrintingColorCount} Color{(req.PrintingColorCount > 1 ? "s" : "")}")
            : "4 Color");
        estimate.PrintingColorCount = req.PrintingColorCount;
        estimate.JobDescription = req.JobDescription?.Trim();
        estimate.Notes = req.AdminNotes?.Trim();
        estimate.ProfitPercentage = req.ProfitPercentage;
        estimate.TaxPercentage = req.TaxPercentage;
        estimate.ProfitCalculationMethod = "Percentage";
        estimate.TaxCalculationMethod = "OnSubtotal";
        estimate.Status = "Draft";
        estimate.UpdatedAt = DateTime.UtcNow;

        var specDict = new Dictionary<string, string>
        {
            ["printingColorCount"] = (req.PrintingColorCount ?? 0).ToString(),
            ["ratePerColor"] = (req.RatePerColor ?? 0).ToString(),
            ["printingSizeId"] = (req.PrintingSizeId ?? 0).ToString(),
            ["printingSizeName"] = req.PrintingSizeName ?? "",
            ["widthMm"] = (req.WidthMm ?? 0).ToString(),
            ["heightMm"] = (req.HeightMm ?? 0).ToString(),
            ["measurementUnit"] = req.MeasurementUnit ?? "MM",
            ["finishedWidth"] = (req.FinishedWidth ?? 0).ToString(),
            ["finishedHeight"] = (req.FinishedHeight ?? 0).ToString(),
            ["finishedUnit"] = req.FinishedUnit ?? "in",
            ["stockPaperLength"] = (req.StockPaperLength ?? 0).ToString(),
            ["stockPaperWidth"] = (req.StockPaperWidth ?? 0).ToString(),
            ["stockPaperUnit"] = req.StockPaperUnit ?? "in",
            ["customItemName"] = req.CustomItemName ?? "",
            ["customMaterialName"] = req.CustomMaterialName ?? "",
            ["materialVariantName"] = req.MaterialVariantName ?? "",
            ["finishingRequirements"] = req.FinishingRequirements ?? "",
            ["jobTitle"] = req.JobTitle ?? ""
        };
        estimate.SpecificationsSnapshot = JsonSerializer.Serialize(specDict);

        var matDict = new Dictionary<string, string>
        {
            ["pricingMethod"] = req.PricingMethod,
            ["ratePerKg"] = (req.RatePerKg ?? 0).ToString(),
            ["conversionFactor"] = req.ConversionFactor.ToString(),
            ["packetPrice"] = (req.PacketPrice ?? 0).ToString(),
            ["sheetsPerPacket"] = (req.SheetsPerPacket ?? 0).ToString(),
            ["rimPrice"] = (req.RimPrice ?? 0).ToString(),
            ["sheetsPerRim"] = req.SheetsPerRim.ToString(),
            ["directSheetPrice"] = (req.DirectSheetPrice ?? 0).ToString(),
            ["manualMaterialCost"] = (req.ManualMaterialCost ?? 0).ToString(),
            ["computedPerSheetPrice"] = calcRes.ComputedPerSheetPrice.ToString(),
            ["gsm"] = (req.Gsm ?? 0).ToString()
        };
        estimate.MaterialPricingSnapshot = JsonSerializer.Serialize(matDict);

        int qSort = 1;
        foreach (var q in req.Quantities.OrderBy(x => x.Quantity))
        {
            var resultMatch = calcRes.Results.FirstOrDefault(r => r.Quantity == q.Quantity);
            decimal paperCost = resultMatch?.MaterialCost ?? 0;

            var quantityEntity = new EstimateQuantity
            {
                Quantity = q.Quantity,
                SheetsRequired = q.SheetsRequired,
                WastagePercentage = q.WastagePercent,
                PaperCost = paperCost,
                SortOrder = qSort++
            };

            int cSort = 1;
            foreach (var ci in req.CostItems)
            {
                decimal amount = 0;
                if (resultMatch != null && resultMatch.CostItemBreakdown.TryGetValue(ci.ItemName, out var a))
                {
                    amount = a;
                }
                else if (ci.QuantityAmounts != null && ci.QuantityAmounts.TryGetValue(q.Quantity, out var explicitVal))
                {
                    amount = explicitVal;
                }

                quantityEntity.CostItems.Add(new EstimateCostItem
                {
                    CategoryId = ci.CostCategoryId,
                    ExpenseNameSnapshot = ci.ItemName.Trim(),
                    CalculationMethod = ci.CalculationMethod,
                    UnitRate = ci.UnitRate,
                    Units = 1,
                    Amount = amount,
                    Notes = ci.Notes,
                    SortOrder = cSort++
                });
            }

            if (resultMatch != null)
            {
                quantityEntity.Result = new EstimateResult
                {
                    PaperCost = resultMatch.MaterialCost,
                    AdditionalExpenses = resultMatch.AdditionalExpenses,
                    ProductionCost = resultMatch.ProductionCost,
                    ProfitAmount = resultMatch.ProfitAmount,
                    Subtotal = resultMatch.SubtotalBeforeTax,
                    TaxAmount = resultMatch.TaxAmount,
                    GrandTotal = resultMatch.GrandTotal,
                    PerPieceCost = resultMatch.PerPiecePrice,
                    CalculatedAt = DateTime.UtcNow
                };
            }

            estimate.Quantities.Add(quantityEntity);
        }

        await _unitOfWork.CompleteAsync();

        var refreshed = await _unitOfWork.PrintingCalculator.GetEstimateWithFullDetailsAsync(estimate.EstimateId);
        return MapToEstimateDetailDto(refreshed!);
    }

    public async Task<bool> DeleteEstimateAsync(long id)
    {
        return await _unitOfWork.PrintingCalculator.SoftDeleteEstimateAsync(id);
    }

    public async Task<EstimateDetailDto?> DuplicateEstimateAsync(long id, string? userEmail)
    {
        var detail = await GetEstimateByIdAsync(id);
        if (detail == null) return null;

        var saveReq = new SaveEstimateRequest
        {
            EstimateTitle = $"{detail.EstimateTitle} (Copy)",
            CategoryId = detail.CategoryId,
            ItemId = detail.ItemId,
            CustomItemName = detail.CustomItemName,
            ProductType = detail.ProductType,
            JobTitle = $"{detail.JobTitle} (Copy)",
            JobDescription = detail.JobDescription,
            PrintingSide = detail.PrintingSide,
            ColorMode = detail.ColorMode,
            PrintingColorCount = detail.PrintingColorCount,
            RatePerColor = detail.RatePerColor,
            FinishingRequirements = detail.FinishingRequirements,
            AdminNotes = detail.AdminNotes,

            FinishedWidth = detail.FinishedWidth,
            FinishedHeight = detail.FinishedHeight,
            FinishedUnit = detail.FinishedUnit,
            StockPaperSizeId = detail.StockPaperSizeId,
            StockPaperLength = detail.StockPaperLength,
            StockPaperWidth = detail.StockPaperWidth,
            StockPaperUnit = detail.StockPaperUnit,

            MaterialId = detail.MaterialId,
            CustomMaterialName = detail.CustomMaterialName,
            MaterialVariantName = detail.MaterialVariantName,
            Gsm = detail.Gsm,
            PricingMethod = detail.PricingMethod,
            RatePerKg = detail.RatePerKg,
            ConversionFactor = detail.ConversionFactor,
            PacketPrice = detail.PacketPrice,
            SheetsPerPacket = detail.SheetsPerPacket,
            RimPrice = detail.RimPrice,
            SheetsPerRim = detail.SheetsPerRim,
            DirectSheetPrice = detail.DirectSheetPrice,
            ManualMaterialCost = detail.ManualMaterialCost,
            ProfitPercentage = detail.ProfitPercentage,
            TaxPercentage = detail.TaxPercentage,

            Quantities = detail.Quantities,
            CostItems = detail.CostItems
        };

        return await SaveEstimateAsync(saveReq, userEmail);
    }

    public async Task<(bool Success, string? ErrorMessage, object? Data)> LinkToQuotationAsync(LinkEstimateToQuotationRequest req)
    {
        var estimate = await _unitOfWork.PrintingCalculator.GetEstimateWithFullDetailsAsync(req.EstimateId);
        if (estimate == null)
        {
            return (false, "Estimate not found.", null);
        }

        var qtyEntity = estimate.Quantities.FirstOrDefault(q => q.Quantity == req.SelectedQuantity);
        var result = qtyEntity?.Result;

        if (qtyEntity == null || result == null)
        {
            return (false, $"Calculated result for quantity {req.SelectedQuantity} not found.", null);
        }

        Quotation quotation;
        QuotationRevision revision;

        if (req.ExistingQuotationId.HasValue && req.ExistingQuotationId.Value > 0)
        {
            quotation = await _unitOfWork.PrintingCalculator.GetQuotationForLinkingAsync(req.ExistingQuotationId.Value)
                        ?? throw new KeyNotFoundException("Selected quotation not found.");

            revision = quotation.Revisions.OrderByDescending(r => r.RevisionNumber).FirstOrDefault(r => r.Status == "Draft")
                       ?? quotation.Revisions.OrderByDescending(r => r.RevisionNumber).First();
        }
        else
        {
            string customerName = "Walk-in Customer";
            string customerPhone = "0300-0000000";

            if (req.ClientId.HasValue && req.ClientId.Value > 0)
            {
                var client = await _unitOfWork.PrintingCalculator.GetClientByIdAsync(req.ClientId.Value);
                if (client != null)
                {
                    customerName = client.CompanyName;
                    customerPhone = client.Phone;
                }
            }

            quotation = new Quotation
            {
                QuotationNumber = GenerateQuotationNumber(),
                ClientId = req.ClientId,
                CustomerName = customerName,
                CustomerPhone = customerPhone,
                QuotationType = "Printing",
                Currency = "PKR",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            revision = new QuotationRevision
            {
                RevisionNumber = 1,
                Status = "Draft",
                ProductionType = "IN_HOUSE",
                QuotationDate = DateTime.UtcNow,
                ValidUntil = DateTime.UtcNow.AddDays(14),
                DiscountType = "None",
                DiscountValue = 0,
                DiscountAmount = 0,
                TaxRate = estimate.TaxPercentage,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        string productName = !string.IsNullOrWhiteSpace(req.ItemTitleOverride)
            ? req.ItemTitleOverride.Trim()
            : (!string.IsNullOrWhiteSpace(estimate.JobTitle)
                ? estimate.JobTitle
                : (!string.IsNullOrWhiteSpace(estimate.ProductType)
                    ? estimate.ProductType
                    : (estimate.PrintingItem != null ? estimate.PrintingItem.ItemName : "Printing Job")));

        string sizeStr = estimate.PaperSize != null ? estimate.PaperSize.SizeName : "Custom Size";
        string matStr = estimate.Material != null ? estimate.Material.MaterialName : "Paper";

        string description = !string.IsNullOrWhiteSpace(req.DescriptionOverride)
            ? req.DescriptionOverride.Trim()
            : $"Specs: {estimate.PrintingSide} side, {estimate.ColorMode}. Stock Size: {sizeStr}. Material: {matStr}. Sheets Required: {qtyEntity.SheetsRequired} (Wastage: {qtyEntity.WastagePercentage}%).";

        var breakdownObj = new
        {
            estimateId = estimate.EstimateId,
            estimateNumber = estimate.EstimateNumber,
            quantity = qtyEntity.Quantity,
            materialCost = result.PaperCost,
            additionalExpenses = result.AdditionalExpenses,
            productionCost = result.ProductionCost,
            profitAmount = result.ProfitAmount,
            taxAmount = result.TaxAmount,
            grandTotal = result.GrandTotal,
            perPiecePrice = result.PerPieceCost,
            items = qtyEntity.CostItems.Select(ci => new { name = ci.ExpenseNameSnapshot, amount = ci.Amount })
        };

        decimal unitPrice = req.UnitPriceOverride.HasValue && req.UnitPriceOverride.Value > 0
            ? req.UnitPriceOverride.Value
            : result.PerPieceCost;

        decimal lineTotal = Math.Round(unitPrice * qtyEntity.Quantity, 2);

        if (req.ExistingQuotationId.HasValue && req.ExistingQuotationId.Value > 0)
        {
            var nextSortOrder = (revision.Items.Max(i => (int?)i.SortOrder) ?? 0) + 1;
            var qItem = new QuotationItem
            {
                RevisionId = revision.RevisionId,
                SortOrder = nextSortOrder,
                ItemType = "Printing",
                ProductionType = "IN_HOUSE",
                ProductName = productName,
                Description = description,
                SizeDimensions = sizeStr,
                Material = matStr,
                Gsm = estimate.Material?.DefaultGsm?.ToString("0"),
                PrintingColor = estimate.ColorMode,
                Finishing = null,
                Quantity = qtyEntity.Quantity,
                Unit = "pcs",
                UnitPrice = unitPrice,
                LineTotal = lineTotal,
                ServiceCategory = "PRINTING",
                ServiceDetails = JsonSerializer.Serialize(breakdownObj),
                Notes = $"Generated from Printing Intelligence Estimate {estimate.EstimateNumber}"
            };

            await _unitOfWork.PrintingCalculator.AddItemToRevisionAsync(qItem);

            revision.Subtotal = revision.Items.Sum(i => i.LineTotal) + lineTotal;
            revision.TaxAmount = Math.Round(revision.Subtotal * (revision.TaxRate / 100m), 2);
            revision.GrandTotal = Math.Round(revision.Subtotal - revision.DiscountAmount + revision.TaxAmount, 2);
            revision.UpdatedAt = DateTime.UtcNow;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            return (true, null, new
            {
                success = true,
                quotationId = quotation.QuotationId,
                quotationNumber = quotation.QuotationNumber,
                revisionId = revision.RevisionId,
                itemId = qItem.ItemId,
                message = $"Successfully linked estimate to Quotation {quotation.QuotationNumber}."
            });
        }
        else
        {
            var qItem = new QuotationItem
            {
                SortOrder = 1,
                ItemType = "Printing",
                ProductionType = "IN_HOUSE",
                ProductName = productName,
                Description = description,
                SizeDimensions = sizeStr,
                Material = matStr,
                Gsm = estimate.Material?.DefaultGsm?.ToString("0"),
                PrintingColor = estimate.ColorMode,
                Finishing = null,
                Quantity = qtyEntity.Quantity,
                Unit = "pcs",
                UnitPrice = unitPrice,
                LineTotal = lineTotal,
                ServiceCategory = "PRINTING",
                ServiceDetails = JsonSerializer.Serialize(breakdownObj),
                Notes = $"Generated from Printing Intelligence Estimate {estimate.EstimateNumber}"
            };

            revision.Subtotal = lineTotal;
            revision.TaxAmount = Math.Round(revision.Subtotal * (revision.TaxRate / 100m), 2);
            revision.GrandTotal = Math.Round(revision.Subtotal - revision.DiscountAmount + revision.TaxAmount, 2);

            await _unitOfWork.PrintingCalculator.CreateQuotationWithRevisionAsync(quotation, revision, qItem);

            return (true, null, new
            {
                success = true,
                quotationId = quotation.QuotationId,
                quotationNumber = quotation.QuotationNumber,
                revisionId = revision.RevisionId,
                itemId = qItem.ItemId,
                message = $"Successfully linked estimate to Quotation {quotation.QuotationNumber}."
            });
        }
    }

    private static CalculateEstimateResponse ComputeEstimateResults(CalculateEstimateRequest req)
    {
        var response = new CalculateEstimateResponse();

        decimal perSheetPrice = 0;
        string method = req.PricingMethod?.Trim() ?? "RatePerKg";

        if (string.Equals(method, "PacketPrice", StringComparison.OrdinalIgnoreCase))
        {
            if (req.PacketPrice.HasValue && req.SheetsPerPacket.HasValue && req.SheetsPerPacket.Value > 0)
            {
                perSheetPrice = Math.Round(req.PacketPrice.Value / req.SheetsPerPacket.Value, 4);
            }
        }
        else if (string.Equals(method, "DirectRimPrice", StringComparison.OrdinalIgnoreCase))
        {
            int sheetsPerRim = req.SheetsPerRim > 0 ? req.SheetsPerRim : 500;
            if (req.RimPrice.HasValue && sheetsPerRim > 0)
            {
                perSheetPrice = Math.Round(req.RimPrice.Value / sheetsPerRim, 4);
            }
        }
        else if (string.Equals(method, "DirectSheetPrice", StringComparison.OrdinalIgnoreCase))
        {
            perSheetPrice = Math.Round(req.DirectSheetPrice ?? 0, 4);
        }
        else if (string.Equals(method, "ManualMaterialCost", StringComparison.OrdinalIgnoreCase))
        {
            perSheetPrice = 0;
        }
        else // RatePerKg
        {
            decimal l = req.LengthInches ?? 0;
            decimal w = req.WidthInches ?? 0;
            decimal gsm = req.Gsm ?? 0;
            decimal rateKg = req.RatePerKg ?? 0;
            decimal factor = req.ConversionFactor > 0 ? req.ConversionFactor : 3100m;
            int sheetsPerRim = req.SheetsPerRim > 0 ? req.SheetsPerRim : 500;

            if (l > 0 && w > 0 && gsm > 0 && rateKg > 0 && factor > 0 && sheetsPerRim > 0)
            {
                decimal rimWeightKg = (l * w * gsm) / factor;
                decimal rimPrice = rimWeightKg * rateKg;
                perSheetPrice = Math.Round(rimPrice / sheetsPerRim, 4);
            }
        }

        response.ComputedPerSheetPrice = perSheetPrice;

        foreach (var q in req.Quantities.OrderBy(x => x.Quantity))
        {
            if (q.Quantity <= 0) continue;

            decimal wastageSheets = q.WastageSheets;
            if (wastageSheets <= 0 && q.WastagePercent > 0)
            {
                wastageSheets = Math.Round((q.SheetsRequired * q.WastagePercent) / 100m, 2);
            }
            decimal totalSheets = q.SheetsRequired + wastageSheets;

            decimal materialCost;
            if (string.Equals(method, "ManualMaterialCost", StringComparison.OrdinalIgnoreCase))
            {
                materialCost = req.ManualMaterialCost ?? 0;
            }
            else
            {
                materialCost = Math.Round(totalSheets * perSheetPrice, 2);
            }

            var expenseBreakdown = new Dictionary<string, decimal>();
            decimal additionalExpenses = 0;

            foreach (var costItem in req.CostItems)
            {
                decimal itemAmount = 0;

                if (costItem.QuantityAmounts != null && costItem.QuantityAmounts.TryGetValue(q.Quantity, out var explicitVal))
                {
                    itemAmount = explicitVal;
                }
                else
                {
                    string calcMethod = costItem.CalculationMethod?.Trim() ?? "FixedAmount";

                    if (string.Equals(calcMethod, "FixedAmount", StringComparison.OrdinalIgnoreCase))
                    {
                        itemAmount = costItem.UnitRate;
                    }
                    else if (string.Equals(calcMethod, "PerPiece", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(calcMethod, "RatePerUnit", StringComparison.OrdinalIgnoreCase))
                    {
                        itemAmount = Math.Round(costItem.UnitRate * q.Quantity, 2);
                    }
                    else if (string.Equals(calcMethod, "PerSheet", StringComparison.OrdinalIgnoreCase))
                    {
                        itemAmount = Math.Round(costItem.UnitRate * totalSheets, 2);
                    }
                    else
                    {
                        itemAmount = 0;
                    }
                }

                expenseBreakdown[costItem.ItemName] = itemAmount;
                additionalExpenses += itemAmount;
            }

            decimal productionCost = Math.Round(materialCost + additionalExpenses, 2);
            decimal profitAmount = Math.Round(productionCost * (req.ProfitPercentage / 100m), 2);
            decimal subtotal = Math.Round(productionCost + profitAmount, 2);
            decimal taxAmount = Math.Round(subtotal * (req.TaxPercentage / 100m), 2);
            decimal grandTotal = Math.Round(subtotal + taxAmount, 2);
            decimal perPiece = q.Quantity > 0 ? Math.Round(grandTotal / q.Quantity, 2) : 0;

            response.Results.Add(new QuantityCalculationResultDto
            {
                Quantity = q.Quantity,
                SheetsRequired = q.SheetsRequired,
                WastageSheets = wastageSheets,
                TotalSheets = totalSheets,
                MaterialCost = materialCost,
                CostItemBreakdown = expenseBreakdown,
                AdditionalExpenses = additionalExpenses,
                ProductionCost = productionCost,
                ProfitAmount = profitAmount,
                SubtotalBeforeTax = subtotal,
                TaxAmount = taxAmount,
                GrandTotal = grandTotal,
                PerPiecePrice = perPiece
            });
        }

        return response;
    }

    private static EstimateDetailDto MapToEstimateDetailDto(PrintingCostEstimate estimate)
    {
        var specDict = new Dictionary<string, string>();
        if (!string.IsNullOrWhiteSpace(estimate.SpecificationsSnapshot))
        {
            try { specDict = JsonSerializer.Deserialize<Dictionary<string, string>>(estimate.SpecificationsSnapshot) ?? new(); } catch { }
        }

        var matDict = new Dictionary<string, string>();
        if (!string.IsNullOrWhiteSpace(estimate.MaterialPricingSnapshot))
        {
            try { matDict = JsonSerializer.Deserialize<Dictionary<string, string>>(estimate.MaterialPricingSnapshot) ?? new(); } catch { }
        }

        var costItemsMap = new Dictionary<string, EstimateCostItemInputDto>();
        foreach (var q in estimate.Quantities)
        {
            foreach (var ci in q.CostItems)
            {
                if (!costItemsMap.TryGetValue(ci.ExpenseNameSnapshot, out var itemDto))
                {
                    itemDto = new EstimateCostItemInputDto
                    {
                        CostItemId = ci.CostItemId,
                        CostCategoryId = ci.CategoryId,
                        ItemName = ci.ExpenseNameSnapshot,
                        CalculationMethod = ci.CalculationMethod,
                        UnitRate = ci.UnitRate,
                        Notes = ci.Notes,
                        QuantityAmounts = new Dictionary<int, decimal>()
                    };
                    costItemsMap[ci.ExpenseNameSnapshot] = itemDto;
                }
                itemDto.QuantityAmounts[q.Quantity] = ci.Amount;
            }
        }

        var quantitiesDto = estimate.Quantities
            .OrderBy(q => q.Quantity)
            .Select(q => new EstimateQuantityInputDto
            {
                QuantityId = q.EstimateQuantityId,
                Quantity = q.Quantity,
                SheetsRequired = q.SheetsRequired,
                WastagePercent = q.WastagePercentage,
                WastageSheets = Math.Round((q.SheetsRequired * q.WastagePercentage) / 100m, 2),
                TotalSheets = q.SheetsRequired + Math.Round((q.SheetsRequired * q.WastagePercentage) / 100m, 2),
                Notes = null
            }).ToList();

        var resultsDto = estimate.Quantities
            .Where(q => q.Result != null)
            .OrderBy(q => q.Quantity)
            .Select(q =>
            {
                var r = q.Result!;
                var breakdown = new Dictionary<string, decimal>();
                foreach (var ci in q.CostItems)
                {
                    breakdown[ci.ExpenseNameSnapshot] = ci.Amount;
                }

                return new QuantityCalculationResultDto
                {
                    Quantity = q.Quantity,
                    SheetsRequired = q.SheetsRequired,
                    WastageSheets = Math.Round((q.SheetsRequired * q.WastagePercentage) / 100m, 2),
                    TotalSheets = q.SheetsRequired + Math.Round((q.SheetsRequired * q.WastagePercentage) / 100m, 2),
                    MaterialCost = r.PaperCost,
                    CostItemBreakdown = breakdown,
                    AdditionalExpenses = r.AdditionalExpenses,
                    ProductionCost = r.ProductionCost,
                    ProfitAmount = r.ProfitAmount,
                    SubtotalBeforeTax = r.Subtotal,
                    TaxAmount = r.TaxAmount,
                    GrandTotal = r.GrandTotal,
                    PerPiecePrice = r.PerPieceCost
                };
            }).ToList();

        decimal.TryParse(specDict.GetValueOrDefault("finishedWidth"), out var fWidth);
        decimal.TryParse(specDict.GetValueOrDefault("finishedHeight"), out var fHeight);
        int.TryParse(specDict.GetValueOrDefault("printingSizeId"), out var pSizeId);
        decimal.TryParse(specDict.GetValueOrDefault("widthMm"), out var wMmVal);
        decimal.TryParse(specDict.GetValueOrDefault("heightMm"), out var hMmVal);
        decimal.TryParse(specDict.GetValueOrDefault("stockPaperLength"), out var sLength);
        decimal.TryParse(specDict.GetValueOrDefault("stockPaperWidth"), out var sWidth);
        decimal.TryParse(matDict.GetValueOrDefault("gsm"), out var gsmVal);
        decimal.TryParse(matDict.GetValueOrDefault("ratePerKg"), out var rateKgVal);
        decimal.TryParse(matDict.GetValueOrDefault("conversionFactor"), out var convFactor);
        decimal.TryParse(matDict.GetValueOrDefault("packetPrice"), out var packetPriceVal);
        int.TryParse(matDict.GetValueOrDefault("sheetsPerPacket"), out var sheetsPacketVal);
        decimal.TryParse(matDict.GetValueOrDefault("rimPrice"), out var rimPriceVal);
        int.TryParse(matDict.GetValueOrDefault("sheetsPerRim"), out var sheetsRimVal);
        decimal.TryParse(matDict.GetValueOrDefault("directSheetPrice"), out var dirSheetVal);
        decimal.TryParse(matDict.GetValueOrDefault("manualMaterialCost"), out var manualMatVal);
        decimal.TryParse(matDict.GetValueOrDefault("computedPerSheetPrice"), out var compSheetVal);

        decimal.TryParse(specDict.GetValueOrDefault("ratePerColor"), out var rPerColorVal);
        short.TryParse(specDict.GetValueOrDefault("printingColorCount"), out var pColorCountVal);

        return new EstimateDetailDto
        {
            EstimateId = estimate.EstimateId,
            EstimateNumber = estimate.EstimateNumber,
            EstimateTitle = estimate.JobTitle,
            CategoryId = estimate.PrintingCategoryId,
            CategoryName = estimate.PrintingCategory?.CategoryName,
            ItemId = estimate.PrintingItemId,
            ItemName = estimate.PrintingItem?.ItemName,
            CustomItemName = specDict.GetValueOrDefault("customItemName"),
            ProductType = estimate.ProductType,
            JobTitle = estimate.JobTitle,
            JobDescription = estimate.JobDescription,
            PrintingSide = estimate.PrintingSide ?? "Single",
            ColorMode = estimate.ColorMode ?? "4 Color",
            PrintingColorCount = estimate.PrintingColorCount ?? (pColorCountVal > 0 ? pColorCountVal : null),
            RatePerColor = rPerColorVal > 0 ? rPerColorVal : null,
            FinishingRequirements = specDict.GetValueOrDefault("finishingRequirements"),
            AdminNotes = estimate.Notes,

            FinishedWidth = fWidth > 0 ? fWidth : null,
            FinishedHeight = fHeight > 0 ? fHeight : null,
            FinishedUnit = specDict.GetValueOrDefault("finishedUnit", "in"),
            PrintingSizeId = pSizeId > 0 ? pSizeId : null,
            PrintingSizeName = specDict.GetValueOrDefault("printingSizeName"),
            WidthMm = wMmVal > 0 ? wMmVal : null,
            HeightMm = hMmVal > 0 ? hMmVal : null,
            MeasurementUnit = specDict.GetValueOrDefault("measurementUnit", "MM"),
            StockPaperSizeId = estimate.PaperSizeId,
            StockPaperLength = sLength > 0 ? sLength : estimate.PaperSize?.LengthInches,
            StockPaperWidth = sWidth > 0 ? sWidth : estimate.PaperSize?.WidthInches,
            StockPaperUnit = specDict.GetValueOrDefault("stockPaperUnit", "in"),

            MaterialId = estimate.MaterialId,
            MaterialName = estimate.Material?.MaterialName,
            CustomMaterialName = specDict.GetValueOrDefault("customMaterialName"),
            MaterialVariantName = specDict.GetValueOrDefault("materialVariantName"),
            Gsm = gsmVal > 0 ? gsmVal : estimate.Material?.DefaultGsm,
            PricingMethod = matDict.GetValueOrDefault("pricingMethod", estimate.Material?.PricingMethod ?? "RatePerKg"),
            RatePerKg = rateKgVal > 0 ? rateKgVal : estimate.Material?.DefaultRatePerKg,
            ConversionFactor = convFactor > 0 ? convFactor : (estimate.Material?.DefaultConversionFactor ?? 3100m),
            PacketPrice = packetPriceVal > 0 ? packetPriceVal : estimate.Material?.PacketPrice,
            SheetsPerPacket = sheetsPacketVal > 0 ? sheetsPacketVal : estimate.Material?.SheetsPerPacket,
            RimPrice = rimPriceVal > 0 ? rimPriceVal : null,
            SheetsPerRim = sheetsRimVal > 0 ? sheetsRimVal : (estimate.Material?.DefaultSheetsPerRim ?? 500),
            DirectSheetPrice = dirSheetVal > 0 ? dirSheetVal : null,
            ManualMaterialCost = manualMatVal > 0 ? manualMatVal : null,
            ComputedPerSheetPrice = compSheetVal,

            ProfitPercentage = estimate.ProfitPercentage,
            TaxPercentage = estimate.TaxPercentage,
            Status = estimate.Status,
            CreatedAt = estimate.CreatedAt,
            UpdatedAt = estimate.UpdatedAt ?? estimate.CreatedAt,

            Quantities = quantitiesDto,
            CostItems = costItemsMap.Values.OrderBy(c => c.CostItemId).ToList(),
            Results = resultsDto
        };
    }

    private static string GenerateEstimateNumber()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randPart = Random.Shared.Next(1000, 9999);
        return $"EST-{datePart}-{randPart}";
    }

    private static string GenerateQuotationNumber()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randPart = Random.Shared.Next(1000, 9999);
        return $"QTE-{datePart}-{randPart}";
    }
}

