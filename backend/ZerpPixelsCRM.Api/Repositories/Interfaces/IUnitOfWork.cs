using ZerpPixelsCRM.Api.Data;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    AppDbContext Context { get; }
    IClientRepository Clients { get; }
    IAdminUserRepository AdminUsers { get; }
    IQuotationRepository Quotations { get; }
    IPrintingOrderRepository PrintingOrders { get; }
    IProductionJobRepository ProductionJobs { get; }
    IPrintingCalculatorRepository PrintingCalculator { get; }
    Task<int> CompleteAsync();
}
