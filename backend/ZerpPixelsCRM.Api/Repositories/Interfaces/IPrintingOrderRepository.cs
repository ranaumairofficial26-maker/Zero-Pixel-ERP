using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IPrintingOrderRepository : IRepository<PrintingOrder>
{
    Task<PrintingOrder?> GetOrderWithDetailsAsync(long orderId);
    Task<PrintingOrder?> GetOrderByRevisionIdAsync(long revisionId);
    Task<string> GenerateNextOrderNumberAsync();
}

