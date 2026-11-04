using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class PrintingCalculatorRepository : Repository<PrintingCostEstimate>, IPrintingCalculatorRepository
{
    public PrintingCalculatorRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<int> GetCategoryCountAsync() => await _context.PrintingCategories.CountAsync();
    public async Task<int> GetItemCountAsync() => await _context.PrintingItems.CountAsync();
    public async Task<int> GetPaperSizeCountAsync() => await _context.PaperSizes.CountAsync();
    public async Task<int> GetMaterialCountAsync() => await _context.PrintingMaterials.CountAsync();

    public async Task<List<PrintingCategory>> GetActiveCategoriesAsync()
    {
        return await _context.PrintingCategories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
    }

    public async Task<PrintingCategory?> GetCategoryByIdAsync(int categoryId)
    {
        return await _context.PrintingCategories.FindAsync(categoryId);
    }

    public async Task<List<PrintingItem>> GetItemsAsync(int? categoryId)
    {
        var query = _context.PrintingItems
            .AsNoTracking()
            .Include(i => i.Category)
            .Where(i => i.IsActive);

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(i => i.CategoryId == categoryId.Value);
        }

        return await query
            .OrderBy(i => i.SourceItemNumber ?? 9999)
            .ThenBy(i => i.ItemName)
            .ToListAsync();
    }

    public async Task<PrintingItem?> GetItemByIdAsync(int itemId)
    {
        return await _context.PrintingItems.FindAsync(itemId);
    }

    public async Task<PrintingItem?> GetItemWithCategoryAsync(int itemId)
    {
        return await _context.PrintingItems
            .AsNoTracking()
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.ItemId == itemId);
    }

    public async Task<PrintingItem> AddCustomItemAsync(PrintingItem item)
    {
        _context.PrintingItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<List<PaperSize>> GetPaperSizesAsync(string? type)
    {
        var query = _context.PaperSizes
            .AsNoTracking()
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(p => p.SizeType.ToLower() == type.Trim().ToLower());
        }

        return await query
            .OrderBy(p => p.PaperSizeId)
            .ThenBy(p => p.SizeName)
            .ToListAsync();
    }

    public async Task<PaperSize?> GetPaperSizeByIdAsync(int paperSizeId)
    {
        return await _context.PaperSizes.FindAsync(paperSizeId);
    }

    public async Task<PaperSize> AddPaperSizeAsync(PaperSize paperSize)
    {
        _context.PaperSizes.Add(paperSize);
        await _context.SaveChangesAsync();
        return paperSize;
    }

    public async Task<List<PrintingSize>> GetAllActivePrintingSizesAsync()
    {
        return await _context.PrintingSizes
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.SizeName)
            .ToListAsync();
    }

    public async Task<List<PrintingItemSize>> GetPrintingItemSizesByItemIdAsync(int itemId)
    {
        return await _context.PrintingItemSizes
            .AsNoTracking()
            .Where(pis => pis.PrintingItemId == itemId)
            .ToListAsync();
    }

    public async Task<PrintingSize?> GetPrintingSizeByIdAsync(int sizeId)
    {
        return await _context.PrintingSizes.FindAsync(sizeId);
    }

    public async Task<List<PrintingMaterial>> GetMaterialsAsync()
    {
        return await _context.PrintingMaterials
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.MaterialId)
            .ThenBy(m => m.MaterialName)
            .ToListAsync();
    }

    public async Task<PrintingMaterial?> GetMaterialByIdAsync(int materialId)
    {
        return await _context.PrintingMaterials.FindAsync(materialId);
    }

    public async Task<PrintingMaterial> AddCustomMaterialAsync(PrintingMaterial material)
    {
        _context.PrintingMaterials.Add(material);
        await _context.SaveChangesAsync();
        return material;
    }

    public async Task<List<CostCategory>> GetCostCategoriesAsync()
    {
        return await _context.CostCategories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
    }

    public async Task<List<PrintingCostEstimate>> GetEstimatesSummaryListAsync(int? categoryId, int? itemId, string? search, int limit)
    {
        var query = _context.PrintingCostEstimates
            .AsNoTracking()
            .Include(e => e.PrintingCategory)
            .Include(e => e.PrintingItem)
            .Include(e => e.Material)
            .Include(e => e.Quantities)
                .ThenInclude(q => q.Result)
            .Where(e => e.DeletedAt == null);

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(e => e.PrintingCategoryId == categoryId.Value);
        }

        if (itemId.HasValue && itemId.Value > 0)
        {
            query = query.Where(e => e.PrintingItemId == itemId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(e =>
                e.EstimateNumber.ToLower().Contains(term) ||
                (e.JobTitle != null && e.JobTitle.ToLower().Contains(term)) ||
                (e.ProductType != null && e.ProductType.ToLower().Contains(term)) ||
                (e.PrintingItem != null && e.PrintingItem.ItemName.ToLower().Contains(term))
            );
        }

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<PrintingCostEstimate?> GetEstimateWithFullDetailsAsync(long estimateId)
    {
        return await _context.PrintingCostEstimates
            .Include(e => e.PrintingCategory)
            .Include(e => e.PrintingItem)
            .Include(e => e.Material)
            .Include(e => e.PaperSize)
            .Include(e => e.Quantities)
                .ThenInclude(q => q.Result)
            .Include(e => e.Quantities)
                .ThenInclude(q => q.CostItems)
            .FirstOrDefaultAsync(e => e.EstimateId == estimateId && e.DeletedAt == null);
    }

    public async Task<PrintingCostEstimate> CreateEstimateWithDetailsAsync(PrintingCostEstimate estimate)
    {
        _context.PrintingCostEstimates.Add(estimate);
        await _context.SaveChangesAsync();
        return estimate;
    }

    public async Task<bool> SoftDeleteEstimateAsync(long estimateId)
    {
        var estimate = await _context.PrintingCostEstimates.FindAsync(estimateId);
        if (estimate == null || estimate.DeletedAt != null) return false;

        estimate.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string> GenerateNextEstimateNumberAsync()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"EST-{today}-";
        var countToday = await _context.PrintingCostEstimates
            .CountAsync(e => e.EstimateNumber.StartsWith(prefix));
        return $"{prefix}{(countToday + 1):D3}";
    }

    public async Task<Quotation?> GetQuotationForLinkingAsync(long quotationId)
    {
        return await _context.Quotations
            .Include(q => q.Revisions)
                .ThenInclude(r => r.Items)
            .FirstOrDefaultAsync(q => q.QuotationId == quotationId && q.DeletedAt == null);
    }

    public async Task<Client?> GetClientByIdAsync(long clientId)
    {
        return await _context.Clients.FindAsync(clientId);
    }

    public async Task<Quotation> CreateQuotationWithRevisionAsync(Quotation quotation, QuotationRevision revision, QuotationItem item)
    {
        _context.Quotations.Add(quotation);
        await _context.SaveChangesAsync();

        revision.QuotationId = quotation.QuotationId;
        _context.QuotationRevisions.Add(revision);
        await _context.SaveChangesAsync();

        item.RevisionId = revision.RevisionId;
        _context.QuotationItems.Add(item);
        await _context.SaveChangesAsync();

        return quotation;
    }

    public async Task<QuotationItem> AddItemToRevisionAsync(QuotationItem item)
    {
        _context.QuotationItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }
}
