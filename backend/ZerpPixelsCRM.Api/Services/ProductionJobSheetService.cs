using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class ProductionJobSheetService : IProductionJobSheetService
{
    private readonly IProductionJobSheetRepository _repo;

    public ProductionJobSheetService(IProductionJobSheetRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<ProductionJobSheetDto>> GetAllAsync(string? search = null)
    {
        var list = await _repo.GetAllAsync(search);
        return list.Select(MapToDto);
    }

    public async Task<ProductionJobSheetDto?> GetByIdAsync(long id)
    {
        var sheet = await _repo.GetByIdAsync(id);
        return sheet != null ? MapToDto(sheet) : null;
    }

    public async Task<ProductionJobSheetDto> SaveAsync(SaveProductionJobSheetDto dto, long? id = null)
    {
        ProductionJobSheet sheet;

        if (id.HasValue && id.Value > 0)
        {
            sheet = await _repo.GetByIdAsync(id.Value)
                ?? throw new KeyNotFoundException($"Production Job Sheet with ID {id.Value} not found.");
            
            ApplyDtoToEntity(dto, sheet);
            sheet = await _repo.UpdateAsync(sheet);
        }
        else
        {
            // If ID was not given, check if a sheet with the exact same job card number already exists
            var existing = await _repo.GetByJobCardNumberAsync(dto.JobCardNumber);
            if (existing != null)
            {
                ApplyDtoToEntity(dto, existing);
                sheet = await _repo.UpdateAsync(existing);
            }
            else
            {
                sheet = new ProductionJobSheet();
                ApplyDtoToEntity(dto, sheet);
                sheet = await _repo.AddAsync(sheet);
            }
        }

        return MapToDto(sheet);
    }

    public async Task<bool> DeleteAsync(long id)
    {
        return await _repo.DeleteAsync(id);
    }

    private static void ApplyDtoToEntity(SaveProductionJobSheetDto dto, ProductionJobSheet s)
    {
        s.JobCardNumber = dto.JobCardNumber.Trim();
        s.JobDate = dto.JobDate.HasValue 
            ? DateTime.SpecifyKind(dto.JobDate.Value, DateTimeKind.Utc) 
            : DateTime.UtcNow;
        s.CustomerName = dto.CustomerName.Trim();
        s.JobName = dto.JobName.Trim();
        s.Quantity = dto.Quantity;
        s.PaperSize = dto.PaperSize;
        s.PaperType = dto.PaperType;
        s.Gsm = dto.Gsm;

        s.PrintingSheetSize = dto.PrintingSheetSize;
        s.PrintingColors = dto.PrintingColors;
        s.PrintingSide = dto.PrintingSide;
        s.PrintingMethod = dto.PrintingMethod;
        s.PrintingMethodOther = dto.PrintingMethodOther;
        s.PrintingMachine = dto.PrintingMachine;
        s.PrintingOperator = dto.PrintingOperator;
        s.PrintingStartDate = dto.PrintingStartDate.HasValue 
            ? DateTime.SpecifyKind(dto.PrintingStartDate.Value, DateTimeKind.Utc) 
            : null;
        s.PrintingCompletionDate = dto.PrintingCompletionDate.HasValue 
            ? DateTime.SpecifyKind(dto.PrintingCompletionDate.Value, DateTimeKind.Utc) 
            : null;

        s.Lamination = dto.Lamination;
        s.LaminationOther = dto.LaminationOther;
        s.DieCutting = dto.DieCutting;
        s.Binding = dto.Binding;
        s.BindingOther = dto.BindingOther;
        s.UvCoating = dto.UvCoating;
        s.Packing = dto.Packing;
        s.PackingInstructions = dto.PackingInstructions;

        s.SpecialInstructions = dto.SpecialInstructions;
        s.ProductionSupervisor = dto.ProductionSupervisor;
        s.AuthorizedBy = dto.AuthorizedBy;
    }

    private static ProductionJobSheetDto MapToDto(ProductionJobSheet s) => new()
    {
        Id = s.Id,
        JobCardNumber = s.JobCardNumber,
        JobDate = s.JobDate,
        CustomerName = s.CustomerName,
        JobName = s.JobName,
        Quantity = s.Quantity,
        PaperSize = s.PaperSize,
        PaperType = s.PaperType,
        Gsm = s.Gsm,

        PrintingSheetSize = s.PrintingSheetSize,
        PrintingColors = s.PrintingColors,
        PrintingSide = s.PrintingSide,
        PrintingMethod = s.PrintingMethod,
        PrintingMethodOther = s.PrintingMethodOther,
        PrintingMachine = s.PrintingMachine,
        PrintingOperator = s.PrintingOperator,
        PrintingStartDate = s.PrintingStartDate,
        PrintingCompletionDate = s.PrintingCompletionDate,

        Lamination = s.Lamination,
        LaminationOther = s.LaminationOther,
        DieCutting = s.DieCutting,
        Binding = s.Binding,
        BindingOther = s.BindingOther,
        UvCoating = s.UvCoating,
        Packing = s.Packing,
        PackingInstructions = s.PackingInstructions,

        SpecialInstructions = s.SpecialInstructions,
        ProductionSupervisor = s.ProductionSupervisor,
        AuthorizedBy = s.AuthorizedBy,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt
    };
}

