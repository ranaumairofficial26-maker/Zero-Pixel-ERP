using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IPrintingOrderRepository : IRepository<PrintingOrder>
{
    Task<PrintingOrder?> GetOrderWithDetailsAsync(long orderId);
    Task<PrintingOrder?> GetOrderByRevisionIdAsync(long revisionId);
    Task<List<PrintingOrder>> GetAllOrdersAsync(string? status, string? search);
    Task<string> GenerateNextOrderNumberAsync();
}

