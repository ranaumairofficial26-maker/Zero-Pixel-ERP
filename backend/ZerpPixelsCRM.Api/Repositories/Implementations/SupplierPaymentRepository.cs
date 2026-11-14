using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Repositories.Implementations;

public class SupplierPaymentRepository : ISupplierPaymentRepository
{
    private readonly AppDbContext _context;

    public SupplierPaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<SupplierPayment> Items, int TotalCount)> GetSupplierPaymentsAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        var query = _context.SupplierPayments
            .Include(p => p.Supplier)
            .Include(p => p.SupplierBill)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(p =>
                EF.Functions.ILike(p.PaymentNumber, term) ||
                (p.TransactionReference != null && EF.Functions.ILike(p.TransactionReference, term)) ||
                (p.Supplier != null && EF.Functions.ILike(p.Supplier.SupplierName, term)) ||
                (p.SupplierBill != null && (
                    EF.Functions.ILike(p.SupplierBill.InternalBillNumber, term) ||
                    EF.Functions.ILike(p.SupplierBill.SupplierInvoiceNumber, term)
                )));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<SupplierPayment?> GetByIdAsync(long id)
    {
        return await _context.SupplierPayments
            .Include(p => p.Supplier)
            .Include(p => p.SupplierBill)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<SupplierPayment>> GetBySupplierIdAsync(long supplierId)
    {
        return await _context.SupplierPayments
            .Include(p => p.Supplier)
            .Include(p => p.SupplierBill)
            .AsNoTracking()
            .Where(p => p.SupplierId == supplierId)
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.Id)
            .ToListAsync();
    }

    public async Task<List<SupplierPayment>> GetByBillIdAsync(long billId)
    {
        return await _context.SupplierPayments
            .Include(p => p.Supplier)
            .Include(p => p.SupplierBill)
            .AsNoTracking()
            .Where(p => p.SupplierBillId == billId)
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.Id)
            .ToListAsync();
    }

    public async Task<string> GetNextPaymentNumberAsync()
    {
        var currentYearMonth = DateTime.UtcNow.ToString("yyyyMM");
        var prefix = $"PAY-{currentYearMonth}-";

        var latest = await _context.SupplierPayments
            .Where(p => p.PaymentNumber.StartsWith(prefix))
            .OrderByDescending(p => p.PaymentNumber)
            .Select(p => p.PaymentNumber)
            .FirstOrDefaultAsync();

        var nextSequence = 1;
        if (!string.IsNullOrEmpty(latest) && latest.Length >= prefix.Length + 4)
        {
            var seqStr = latest.Substring(prefix.Length);
            if (int.TryParse(seqStr, out var seq))
            {
                nextSequence = seq + 1;
            }
        }

        return $"{prefix}{nextSequence:D4}";
    }

    public async Task<decimal> GetValidPaidThisMonthAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonthStart = monthStart.AddMonths(1);

        return await _context.SupplierPayments
            .Where(p => p.Status == "Posted" && p.PaymentDate >= monthStart && p.PaymentDate < nextMonthStart)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;
    }

    public async Task<SupplierPayment> AddPaymentAtomicAsync(SupplierPayment payment)
    {
        if (!string.IsNullOrWhiteSpace(payment.IdempotencyKey))
        {
            var existing = await _context.SupplierPayments
                .Include(p => p.Supplier)
                .Include(p => p.SupplierBill)
                .FirstOrDefaultAsync(p => p.IdempotencyKey == payment.IdempotencyKey);

            if (existing != null)
            {
                return existing;
            }
        }

        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // Lock the target supplier_bills row for concurrency protection
            var bill = await _context.SupplierBills
                .FromSqlInterpolated($"SELECT * FROM supplier_bills WHERE id = {payment.SupplierBillId} FOR UPDATE")
                .FirstOrDefaultAsync();

            if (bill == null)
            {
                throw new ArgumentException($"Supplier Bill with ID {payment.SupplierBillId} does not exist.");
            }

            if (bill.SupplierId != payment.SupplierId)
            {
                throw new ArgumentException("Selected Supplier Bill does not belong to the selected Supplier.");
            }

            if (bill.Status == "Cancelled")
            {
                throw new InvalidOperationException("Cannot record a payment against a cancelled supplier bill.");
            }

            var currentPaid = await _context.SupplierPayments
                .Where(p => p.SupplierBillId == bill.Id && p.Status == "Posted")
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            var outstanding = Math.Round(bill.TotalAmount - currentPaid, 2);
            if (outstanding <= 0)
            {
                throw new InvalidOperationException("This supplier bill is already fully paid.");
            }

            if (payment.Amount > outstanding)
            {
                throw new InvalidOperationException(
                    $"Payment amount (PKR {payment.Amount:N2}) cannot exceed the current outstanding balance (PKR {outstanding:N2}).");
            }

            payment.PaymentNumber = await GetNextPaymentNumberAsync();
            payment.PaymentAccountHash = string.IsNullOrWhiteSpace(payment.PaymentAccountReference)
                ? null
                : ZerpPixelsCRM.Api.Utils.SecurityHashHelper.ComputeSha256(payment.PaymentAccountReference);
            payment.RecordIntegrityHash = ZerpPixelsCRM.Api.Utils.SecurityHashHelper.ComputeSupplierPaymentIntegrityHash(payment);
            _context.SupplierPayments.Add(payment);

            var newPaid = Math.Round(currentPaid + payment.Amount, 2);
            var newBalance = Math.Round(bill.TotalAmount - newPaid, 2);

            bill.PaidAmount = newPaid;
            bill.Status = DeriveBillStatus(bill.TotalAmount, newPaid, bill.DueDate);
            bill.UpdatedAt = DateTime.UtcNow;
            _context.SupplierBills.Update(bill);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return (await GetByIdAsync(payment.Id)) ?? payment;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<SupplierPayment?> UpdatePaymentAtomicAsync(
        long id,
        DateTime paymentDate,
        decimal amount,
        string paymentMethod,
        string? paymentAccountReference,
        string? transactionReference,
        string? notes)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var payment = await _context.SupplierPayments
                .FromSqlInterpolated($"SELECT * FROM supplier_payments WHERE id = {id} FOR UPDATE")
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return null;
            }

            if (payment.Status == "Reversed")
            {
                throw new InvalidOperationException("Reversed payments cannot be edited.");
            }

            var bill = await _context.SupplierBills
                .FromSqlInterpolated($"SELECT * FROM supplier_bills WHERE id = {payment.SupplierBillId} FOR UPDATE")
                .FirstOrDefaultAsync();

            if (bill == null)
            {
                throw new InvalidOperationException("Linked supplier bill could not be found.");
            }

            if (bill.Status == "Cancelled")
            {
                throw new InvalidOperationException("Cannot edit a payment for a cancelled supplier bill.");
            }

            var otherPostedPaid = await _context.SupplierPayments
                .Where(p => p.SupplierBillId == bill.Id && p.Status == "Posted" && p.Id != payment.Id)
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            var roundedAmount = Math.Round(amount, 2);
            var maxAllowable = Math.Round(bill.TotalAmount - otherPostedPaid, 2);

            if (roundedAmount > maxAllowable)
            {
                throw new InvalidOperationException($"Payment amount cannot exceed the remaining allowable balance of PKR {maxAllowable:N2}.");
            }

            payment.PaymentDate = paymentDate;
            payment.Amount = roundedAmount;
            payment.PaymentMethod = paymentMethod;
            payment.PaymentAccountReference = paymentAccountReference;
            payment.PaymentAccountHash = string.IsNullOrWhiteSpace(paymentAccountReference)
                ? null
                : ZerpPixelsCRM.Api.Utils.SecurityHashHelper.ComputeSha256(paymentAccountReference);
            payment.TransactionReference = transactionReference;
            payment.Notes = notes;
            payment.RecordIntegrityHash = ZerpPixelsCRM.Api.Utils.SecurityHashHelper.ComputeSupplierPaymentIntegrityHash(payment);
            payment.UpdatedAt = DateTime.UtcNow;
            _context.SupplierPayments.Update(payment);

            bill.PaidAmount = Math.Round(otherPostedPaid + roundedAmount, 2);
            bill.Status = DeriveBillStatus(bill.TotalAmount, bill.PaidAmount, bill.DueDate);
            bill.UpdatedAt = DateTime.UtcNow;
            _context.SupplierBills.Update(bill);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return (await GetByIdAsync(payment.Id)) ?? payment;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<SupplierPayment?> ReversePaymentAtomicAsync(long id, string reversalReason, string? reversedBy)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var payment = await _context.SupplierPayments
                .FromSqlInterpolated($"SELECT * FROM supplier_payments WHERE id = {id} FOR UPDATE")
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return null;
            }

            if (payment.Status == "Reversed")
            {
                throw new InvalidOperationException("This payment has already been reversed.");
            }

            var bill = await _context.SupplierBills
                .FromSqlInterpolated($"SELECT * FROM supplier_bills WHERE id = {payment.SupplierBillId} FOR UPDATE")
                .FirstOrDefaultAsync();

            if (bill == null)
            {
                throw new InvalidOperationException("Linked supplier bill could not be found.");
            }

            payment.Status = "Reversed";
            payment.ReversalReason = reversalReason.Trim();
            payment.ReversedAt = DateTime.UtcNow;
            payment.ReversedBy = reversedBy;
            payment.RecordIntegrityHash = ZerpPixelsCRM.Api.Utils.SecurityHashHelper.ComputeSupplierPaymentIntegrityHash(payment);
            payment.UpdatedAt = DateTime.UtcNow;
            _context.SupplierPayments.Update(payment);

            await _context.SaveChangesAsync();

            var recalculatedPaid = await _context.SupplierPayments
                .Where(p => p.SupplierBillId == bill.Id && p.Status == "Posted")
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            bill.PaidAmount = Math.Round(recalculatedPaid, 2);
            if (bill.Status != "Cancelled")
            {
                bill.Status = DeriveBillStatus(bill.TotalAmount, bill.PaidAmount, bill.DueDate);
            }
            bill.UpdatedAt = DateTime.UtcNow;
            _context.SupplierBills.Update(bill);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return (await GetByIdAsync(payment.Id)) ?? payment;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    private static string DeriveBillStatus(decimal totalAmount, decimal paidAmount, DateTime dueDate)
    {
        var balance = totalAmount - paidAmount;
        if (balance <= 0) return "Paid";
        if (paidAmount > 0) return "Partially Paid";
        if (DateTime.UtcNow.Date > dueDate.Date) return "Overdue";
        return "Unpaid";
    }
}
