using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IClientRepository? _clients;
    private IAdminUserRepository? _adminUsers;
    private IQuotationRepository? _quotations;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IClientRepository Clients => _clients ??= new ClientRepository(_context);
    public IAdminUserRepository AdminUsers => _adminUsers ??= new AdminUserRepository(_context);
    public IQuotationRepository Quotations => _quotations ??= new QuotationRepository(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}

