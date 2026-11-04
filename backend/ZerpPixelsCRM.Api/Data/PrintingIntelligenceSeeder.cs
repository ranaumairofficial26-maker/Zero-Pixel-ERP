using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Data;

public class PrintingIntelligenceSeeder
{
    private readonly AppDbContext _context;
    private readonly ILogger<PrintingIntelligenceSeeder> _logger;
    private readonly IWebHostEnvironment _env;

    public PrintingIntelligenceSeeder(
        AppDbContext context,
        ILogger<PrintingIntelligenceSeeder> logger,
        IWebHostEnvironment env)
    {
        _context = context;
        _logger = logger;
        _env = env;
    }

    public async Task SeedAllAsync()
    {
        try
        {
            await SeedCategoriesAsync();
            await SeedPrintingItemsAsync();
            await SeedPaperSizesAsync();
            await SeedPrintingSizesAsync();
            await SeedMaterialsAsync();
            await SeedMaterialProfilesAsync();
            await SeedCostCategoriesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while seeding Printing Intelligence data");
        }
    }

    private string? FindSeedFilePath(string fileName)
    {
        var candidatePaths = new[]
        {
            Path.Combine(_env.ContentRootPath, "backend", "ZerpPixelsCRM.Api", "Data", "Seed", fileName),
            Path.Combine(_env.ContentRootPath, "Data", "Seed", fileName),
            Path.Combine(AppContext.BaseDirectory, "Data", "Seed", fileName),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Data", "Seed", fileName),
            Path.Combine("d:\\Zerp pixels crm\\backend\\ZerpPixelsCRM.Api\\Data\\Seed", fileName)
        };

        foreach (var p in candidatePaths)
        {
            try
            {
                var full = Path.GetFullPath(p);
                if (File.Exists(full))
                {
                    return full;
                }
            }
            catch { }
        }
        return null;
    }

    private async Task SeedCategoriesAsync()
    {
        if (await _context.PrintingCategories.AnyAsync()) return;

        string? seedPath = FindSeedFilePath("printing_categories.json");
        if (seedPath == null)
        {
            _logger.LogWarning("Seed file for printing categories not found.");
            return;
        }

        var json = await File.ReadAllTextAsync(seedPath);
        using var doc = JsonDocument.Parse(json);
        int order = 1;

        foreach (var el in doc.RootElement.EnumerateArray())
        {
            string catName = el.GetProperty("categoryName").GetString() ?? string.Empty;
            int count = el.TryGetProperty("itemCount", out var c) ? c.GetInt32() : 0;
            string range = el.TryGetProperty("itemNumberRange", out var r) ? r.GetString() ?? "" : "";

            if (!string.IsNullOrWhiteSpace(catName))
            {
                _context.PrintingCategories.Add(new PrintingCategory
                {
                    CategoryName = catName.Trim(),
                    SourceCategoryName = catName.Trim(),
                    ItemCount = count,
                    ItemNumberRange = range,
                    DisplayOrder = order++,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded printing categories successfully");
    }

    private async Task SeedPrintingItemsAsync()
    {
        if (await _context.PrintingItems.AnyAsync()) return;

        string? seedPath = FindSeedFilePath("printing_items_195.json");
        if (seedPath == null)
        {
            _logger.LogWarning("Seed file for printing items not found.");
            return;
        }

        var categories = await _context.PrintingCategories.ToDictionaryAsync(c => c.CategoryName.ToLower().Trim(), c => c.CategoryId);
        var json = await File.ReadAllTextAsync(seedPath);
        using var doc = JsonDocument.Parse(json);

        foreach (var el in doc.RootElement.EnumerateArray())
        {
            string catName = el.GetProperty("categoryName").GetString() ?? "";
            string itemName = el.GetProperty("itemName").GetString() ?? "";
            int itemNo = el.GetProperty("itemNumber").GetInt32();

            decimal? widthMm = el.TryGetProperty("widthMm", out var w) && w.ValueKind == JsonValueKind.Number ? w.GetDecimal() : null;
            decimal? heightMm = el.TryGetProperty("heightMm", out var h) && h.ValueKind == JsonValueKind.Number ? h.GetDecimal() : null;

            string inchesStr = el.TryGetProperty("inchesStr", out var inc) ? inc.GetString() ?? "" : "";
            string cmStr = el.TryGetProperty("cmStr", out var cm) ? cm.GetString() ?? "" : "";
            string mmStr = el.TryGetProperty("mmStr", out var mm) ? mm.GetString() ?? "" : "";
            string sizingBasis = el.TryGetProperty("sizingBasis", out var sb) ? sb.GetString() ?? "" : "";
            string notes = el.TryGetProperty("importantNotes", out var n) ? n.GetString() ?? "" : "";

            if (categories.TryGetValue(catName.ToLower().Trim(), out int catId))
            {
                _context.PrintingItems.Add(new PrintingItem
                {
                    CategoryId = catId,
                    SourceItemNumber = itemNo,
                    ItemName = itemName.Trim(),
                    DefaultWidthMm = widthMm,
                    DefaultHeightMm = heightMm,
                    InchesStr = inchesStr.Trim(),
                    CmStr = cmStr.Trim(),
                    MmStr = mmStr.Trim(),
                    SizingBasis = string.IsNullOrWhiteSpace(sizingBasis) ? "Common size" : sizingBasis.Trim(),
                    SourceNotes = notes.Trim(),
                    IsCustom = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded all 195 printing items successfully");
    }

    private async Task SeedPaperSizesAsync()
    {
        if (await _context.PaperSizes.AnyAsync()) return;

        var defaultSizes = new List<PaperSize>
        {
            // Stock paper parent sheets
            new() { SizeName = "23 × 36", LengthInches = 23m, WidthInches = 36m, WidthMm = 584.2m, HeightMm = 914.4m, SizeType = "StockPaper", IsActive = true },
            new() { SizeName = "25 × 36", LengthInches = 25m, WidthInches = 36m, WidthMm = 635m, HeightMm = 914.4m, SizeType = "StockPaper", IsActive = true },

            // Standard office & cut sizes
            new() { SizeName = "A4", LengthInches = 8.27m, WidthInches = 11.679m, WidthMm = 210m, HeightMm = 297m, SizeType = "StockPaper", IsActive = true },
            new() { SizeName = "A5", LengthInches = 5.7m, WidthInches = 8.27m, WidthMm = 148m, HeightMm = 210m, SizeType = "StockPaper", IsActive = true },
            new() { SizeName = "Letter", LengthInches = 8.5m, WidthInches = 11m, WidthMm = 215.9m, HeightMm = 279.4m, SizeType = "StockPaper", IsActive = true },
            new() { SizeName = "Legal", LengthInches = 8.5m, WidthInches = 14m, WidthMm = 215.9m, HeightMm = 355.6m, SizeType = "StockPaper", IsActive = true },
            new() { SizeName = "7 × 9", LengthInches = 7m, WidthInches = 9m, WidthMm = 177.8m, HeightMm = 228.6m, SizeType = "StockPaper", IsActive = true },

            // Size Guide reference dimensions
            new() { SizeName = "A6", LengthInches = 4.13m, WidthInches = 5.83m, WidthMm = 105m, HeightMm = 148m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "A3", LengthInches = 11.69m, WidthInches = 16.54m, WidthMm = 297m, HeightMm = 420m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "A2", LengthInches = 16.54m, WidthInches = 23.39m, WidthMm = 420m, HeightMm = 594m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "A1", LengthInches = 23.39m, WidthInches = 33.11m, WidthMm = 594m, HeightMm = 841m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "DL finished", LengthInches = 3.90m, WidthInches = 8.27m, WidthMm = 99m, HeightMm = 210m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "C5 envelope", LengthInches = 9.02m, WidthInches = 6.38m, WidthMm = 229m, HeightMm = 162m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "C4 envelope", LengthInches = 12.76m, WidthInches = 9.02m, WidthMm = 324m, HeightMm = 229m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "CR80 ID card", LengthInches = 3.37m, WidthInches = 2.13m, WidthMm = 85.6m, HeightMm = 54m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "Common 3×6 ft banner", LengthInches = 36m, WidthInches = 72m, WidthMm = 914.4m, HeightMm = 1828.8m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "Common 8×4 ft board", LengthInches = 96m, WidthInches = 48m, WidthMm = 2438.4m, HeightMm = 1219.2m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "Common roll-up", LengthInches = 33.46m, WidthInches = 78.74m, WidthMm = 850m, HeightMm = 2000m, SizeType = "SizeGuide", IsActive = true },
            new() { SizeName = "Custom Size", LengthInches = null, WidthInches = null, WidthMm = null, HeightMm = null, SizeType = "StockPaper", IsActive = true }
        };

        _context.PaperSizes.AddRange(defaultSizes);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded paper sizes and size guide reference dimensions successfully");
    }

    private async Task SeedPrintingSizesAsync()
    {
        if (await _context.PrintingSizes.AnyAsync()) return;

        var globalPresets = new List<PrintingSize>
        {
            new() { SizeName = "A6", WidthMm = 105.00m, HeightMm = 148.00m, DisplayOrder = 1, IsActive = true },
            new() { SizeName = "A5", WidthMm = 148.00m, HeightMm = 210.00m, DisplayOrder = 2, IsActive = true },
            new() { SizeName = "A4", WidthMm = 210.00m, HeightMm = 297.00m, DisplayOrder = 3, IsActive = true },
            new() { SizeName = "A3", WidthMm = 297.00m, HeightMm = 420.00m, DisplayOrder = 4, IsActive = true },
            new() { SizeName = "A2", WidthMm = 420.00m, HeightMm = 594.00m, DisplayOrder = 5, IsActive = true },
            new() { SizeName = "A1", WidthMm = 594.00m, HeightMm = 841.00m, DisplayOrder = 6, IsActive = true },
            new() { SizeName = "DL finished", WidthMm = 99.00m, HeightMm = 210.00m, DisplayOrder = 7, IsActive = true },
            new() { SizeName = "C5 envelope", WidthMm = 229.00m, HeightMm = 162.00m, DisplayOrder = 8, IsActive = true },
            new() { SizeName = "C4 envelope", WidthMm = 324.00m, HeightMm = 229.00m, DisplayOrder = 9, IsActive = true },
            new() { SizeName = "CR80 ID card", WidthMm = 85.60m, HeightMm = 54.00m, DisplayOrder = 10, IsActive = true },
            new() { SizeName = "Common 3×6 ft banner", WidthMm = 914.40m, HeightMm = 1828.80m, DisplayOrder = 11, IsActive = true },
            new() { SizeName = "Common 8×4 ft board", WidthMm = 2438.40m, HeightMm = 1219.20m, DisplayOrder = 12, IsActive = true },
            new() { SizeName = "Common roll-up", WidthMm = 850.00m, HeightMm = 2000.00m, DisplayOrder = 13, IsActive = true },
            new() { SizeName = "Custom Size", WidthMm = null, HeightMm = null, DisplayOrder = 999, IsActive = true }
        };

        _context.PrintingSizes.AddRange(globalPresets);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded 14 global printing size presets successfully");
    }

    private async Task SeedMaterialsAsync()
    {
        if (await _context.PrintingMaterials.AnyAsync()) return;

        var materials = new List<PrintingMaterial>
        {
            new()
            {
                MaterialName = "ART CARD",
                DefaultLength = 25m,
                DefaultWidth = 36m,
                DefaultGsm = 300m,
                PricingMethod = "PacketPrice",
                PacketPrice = 8100m,
                SheetsPerPacket = 100,
                DefaultSheetsPerRim = 500,
                DefaultConversionFactor = 3100m,
                IsActive = true
            },
            new()
            {
                MaterialName = "OFFSET PAPER",
                DefaultLength = 23m,
                DefaultWidth = 36m,
                DefaultGsm = 100m,
                DefaultRatePerKg = 680m,
                DefaultSheetsPerRim = 500,
                DefaultConversionFactor = 3100m,
                PricingMethod = "RatePerKg",
                IsActive = true
            },
            new() { MaterialName = "ART/MATT PAPER", DefaultConversionFactor = 3100m, DefaultSheetsPerRim = 500, PricingMethod = "RatePerKg", IsActive = true },
            new() { MaterialName = "Carbonless Paper", DefaultConversionFactor = 3100m, DefaultSheetsPerRim = 500, PricingMethod = "RatePerKg", IsActive = true },
            new() { MaterialName = "FLYING PAPER", DefaultConversionFactor = 3100m, DefaultSheetsPerRim = 500, PricingMethod = "RatePerKg", IsActive = true },
            new() { MaterialName = "Bleach Card", DefaultConversionFactor = 3100m, DefaultSheetsPerRim = 500, PricingMethod = "RatePerKg", IsActive = true },
            new() { MaterialName = "Box Board", DefaultConversionFactor = 3100m, DefaultSheetsPerRim = 500, PricingMethod = "RatePerKg", IsActive = true },
            new() { MaterialName = "Sticker", DefaultConversionFactor = 3100m, DefaultSheetsPerRim = 500, PricingMethod = "DirectSheetPrice", IsActive = true }
        };

        _context.PrintingMaterials.AddRange(materials);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded 8 default printing materials successfully");
    }

    private async Task SeedMaterialProfilesAsync()
    {
        if (await _context.MaterialPriceProfiles.AnyAsync()) return;

        var artCard = await _context.PrintingMaterials.FirstOrDefaultAsync(m => m.MaterialName == "ART CARD");
        var offsetPaper = await _context.PrintingMaterials.FirstOrDefaultAsync(m => m.MaterialName == "OFFSET PAPER");
        var size25x36 = await _context.PaperSizes.FirstOrDefaultAsync(s => s.SizeName == "25 × 36");
        var size23x36 = await _context.PaperSizes.FirstOrDefaultAsync(s => s.SizeName == "23 × 36");

        var profiles = new List<MaterialPriceProfile>();

        if (artCard != null)
        {
            profiles.Add(new MaterialPriceProfile
            {
                MaterialId = artCard.MaterialId,
                PaperSizeId = size25x36?.PaperSizeId,
                VariantName = "Art Card 300 GSM (25×36)",
                Gsm = 300m,
                PricingMethod = "PacketPrice",
                PacketPrice = 8100m,
                SheetsPerPacket = 100,
                SheetsPerRim = 500,
                ConversionFactor = 3100m,
                ComputedPerSheetPrice = 81.0000m,
                IsActive = true
            });
        }

        if (offsetPaper != null)
        {
            // (23 * 36 * 100 * 680) / 3100 = 18162.5806; per sheet / 500 = 36.3252
            profiles.Add(new MaterialPriceProfile
            {
                MaterialId = offsetPaper.MaterialId,
                PaperSizeId = size23x36?.PaperSizeId,
                VariantName = "Offset Paper 100 GSM (23×36)",
                Gsm = 100m,
                PricingMethod = "RatePerKg",
                RatePerKg = 680m,
                ConversionFactor = 3100m,
                SheetsPerRim = 500,
                ComputedPerSheetPrice = 36.3252m,
                IsActive = true
            });
        }

        if (profiles.Count > 0)
        {
            _context.MaterialPriceProfiles.AddRange(profiles);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded initial material price profiles successfully");
        }
    }

    private async Task SeedCostCategoriesAsync()
    {
        if (await _context.CostCategories.AnyAsync()) return;

        var categories = new List<CostCategory>
        {
            new() { CategoryName = "Paper / Art Card", DisplayOrder = 1, DefaultCalculationMethod = "PerSheet", IsActive = true },
            new() { CategoryName = "Positive / Tracing", DisplayOrder = 2, DefaultCalculationMethod = "FixedAmount", IsActive = true },
            new() { CategoryName = "Plates", DisplayOrder = 3, DefaultCalculationMethod = "FixedAmount", DefaultRate = 900m, IsActive = true },
            new() { CategoryName = "Printing", DisplayOrder = 4, DefaultCalculationMethod = "FixedAmount", DefaultRate = 1000m, IsActive = true },
            new() { CategoryName = "Lamination", DisplayOrder = 5, DefaultCalculationMethod = "ManualAmount", IsActive = true },
            new() { CategoryName = "Die Making", DisplayOrder = 6, DefaultCalculationMethod = "FixedAmount", IsActive = true },
            new() { CategoryName = "Die Cutting", DisplayOrder = 7, DefaultCalculationMethod = "ManualAmount", IsActive = true },
            new() { CategoryName = "Binding", DisplayOrder = 8, DefaultCalculationMethod = "ManualAmount", IsActive = true },
            new() { CategoryName = "Packing", DisplayOrder = 9, DefaultCalculationMethod = "ManualAmount", IsActive = true },
            new() { CategoryName = "Petrol + Misc.", DisplayOrder = 10, DefaultCalculationMethod = "ManualAmount", IsActive = true }
        };

        _context.CostCategories.AddRange(categories);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded 10 default cost categories successfully");
    }
}
