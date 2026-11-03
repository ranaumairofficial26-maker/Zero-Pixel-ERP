using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IPrintingOrderService
{
    Task<PrintingOrderDto?> CreateOrderFromApprovedRevisionAsync(long revisionId, string? notes = null);
    Task<PrintingOrderDto?> CreateOrSyncOrderFromRevisionAsync(long revisionId, string? notes = null);
    Task<PrintingOrderDto?> GetOrderByIdAsync(long orderId);
    Task<PrintingOrderDto?> GetOrderByRevisionIdAsync(long revisionId);
    Task<List<PrintingOrderDto>> GetAllOrdersAsync(string? status = null, string? search = null);
    Task<PrintingOrderDto?> UpdateOrderProductionTypesAsync(long orderId, UpdateOrderItemsProductionTypeRequest request);
    Task<PrintingOrderDto?> ConfirmOrderAsync(long orderId, ConfirmPrintingOrderRequest request);
}

