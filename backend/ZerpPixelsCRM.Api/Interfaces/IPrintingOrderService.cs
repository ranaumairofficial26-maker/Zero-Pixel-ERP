using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Interfaces;

public interface IPrintingOrderService
{
    Task<PrintingOrderDto?> CreateOrderFromApprovedRevisionAsync(long revisionId, string? notes = null);
    Task<PrintingOrderDto?> CreateOrSyncOrderFromRevisionAsync(long revisionId, string? notes = null);
    Task<PrintingOrderDto?> ConfirmOrderAsync(long orderId, ConfirmPrintingOrderRequest request);
}

