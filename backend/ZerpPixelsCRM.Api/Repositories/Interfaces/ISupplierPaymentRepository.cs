using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Repositories.Interfaces;

public interface ISupplierPaymentRepository
{
    Task<(IEnumerable<SupplierPayment> Items, int TotalCount)> GetSupplierPaymentsAsync(string? search = null, int page = 1, int pageSize = 10);
    Task<SupplierPayment?> GetByIdAsync(long id);
    Task<List<SupplierPayment>> GetBySupplierIdAsync(long supplierId);
    Task<List<SupplierPayment>> GetByBillIdAsync(long billId);
    Task<string> GetNextPaymentNumberAsync();
    Task<decimal> GetValidPaidThisMonthAsync();
    Task<SupplierPayment> AddPaymentAtomicAsync(SupplierPayment payment);
    Task<SupplierPayment?> UpdatePaymentAtomicAsync(
        long id,
        DateTime paymentDate,
        decimal amount,
        string paymentMethod,
        string? paymentAccountReference,
        string? transactionReference,
        string? notes);
    Task<SupplierPayment?> ReversePaymentAtomicAsync(long id, string reversalReason, string? reversedBy);
}
