namespace ZerpPixelsCRM.Api.DTOs;

public class ProductionJobSheetDto
{
    public long Id { get; set; }
    public string JobCardNumber { get; set; } = string.Empty;
    public DateTime JobDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string JobName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? PaperSize { get; set; }
    public string? PaperType { get; set; }
    public int? Gsm { get; set; }

    // Printing Details
    public string? PrintingSheetSize { get; set; }
    public string? PrintingColors { get; set; }
    public string? PrintingSide { get; set; }
    public string? PrintingMethod { get; set; }
    public string? PrintingMethodOther { get; set; }
    public string? PrintingMachine { get; set; }
    public string? PrintingOperator { get; set; }
    public DateTime? PrintingStartDate { get; set; }
    public DateTime? PrintingCompletionDate { get; set; }

    // Finishing Details
    public string? Lamination { get; set; }
    public string? LaminationOther { get; set; }
    public string? DieCutting { get; set; }
    public string? Binding { get; set; }
    public string? BindingOther { get; set; }
    public string? UvCoating { get; set; }
    public string? Packing { get; set; }
    public string? PackingInstructions { get; set; }

    // Special Instructions
    public string? SpecialInstructions { get; set; }

    // Approval
    public string? ProductionSupervisor { get; set; }
    public string? AuthorizedBy { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveProductionJobSheetDto
{
    public string JobCardNumber { get; set; } = string.Empty;
    public DateTime? JobDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string JobName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? PaperSize { get; set; }
    public string? PaperType { get; set; }
    public int? Gsm { get; set; }

    // Printing Details
    public string? PrintingSheetSize { get; set; }
    public string? PrintingColors { get; set; }
    public string? PrintingSide { get; set; }
    public string? PrintingMethod { get; set; }
    public string? PrintingMethodOther { get; set; }
    public string? PrintingMachine { get; set; }
    public string? PrintingOperator { get; set; }
    public DateTime? PrintingStartDate { get; set; }
    public DateTime? PrintingCompletionDate { get; set; }

    // Finishing Details
    public string? Lamination { get; set; }
    public string? LaminationOther { get; set; }
    public string? DieCutting { get; set; }
    public string? Binding { get; set; }
    public string? BindingOther { get; set; }
    public string? UvCoating { get; set; }
    public string? Packing { get; set; }
    public string? PackingInstructions { get; set; }

    // Special Instructions
    public string? SpecialInstructions { get; set; }

    // Approval
    public string? ProductionSupervisor { get; set; }
    public string? AuthorizedBy { get; set; }
}

