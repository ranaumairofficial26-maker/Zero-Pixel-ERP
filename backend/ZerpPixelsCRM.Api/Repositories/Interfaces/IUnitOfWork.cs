namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IClientRepository Clients { get; }
    IAdminUserRepository AdminUsers { get; }
    IQuotationRepository Quotations { get; }
    Task<int> CompleteAsync();
}

