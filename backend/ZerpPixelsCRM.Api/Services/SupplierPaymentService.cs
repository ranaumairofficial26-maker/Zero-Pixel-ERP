using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class SupplierPaymentService : ISupplierPaymentService
{
    private readonly ISupplierPaymentRepository _paymentRepo;
    private readonly ISupplierRepository _supplierRepo;
    private readonly IValidator<CreateSupplierPaymentRequest> _createValidator;
    private readonly IValidator<UpdateSupplierPaymentRequest> _updateValidator;
    private readonly IValidator<ReverseSupplierPaymentRequest> _reverseValidator;

    public SupplierPaymentService(
        ISupplierPaymentRepository paymentRepo,
        ISupplierRepository supplierRepo,
        IValidator<CreateSupplierPaymentRequest> createValidator,
        IValidator<UpdateSupplierPaymentRequest> updateValidator,
        IValidator<ReverseSupplierPaymentRequest> reverseValidator)
    {
        _paymentRepo = paymentRepo;
        _supplierRepo = supplierRepo;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _reverseValidator = reverseValidator;
    }

    public async Task<PaginatedSupplierPaymentsResponse> GetSupplierPaymentsAsync(string? search = null, int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var (items, totalCount) = await _paymentRepo.GetSupplierPaymentsAsync(search, page, pageSize);

        return new PaginatedSupplierPaymentsResponse
        {
            Items = items.Select(MapToListItemDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<SupplierPaymentDto?> GetSupplierPaymentByIdAsync(long id)
    {
        var payment = await _paymentRepo.GetByIdAsync(id);
        return payment == null ? null : MapToDto(payment);
    }

    public async Task<List<SupplierPaymentListItemDto>> GetPaymentsBySupplierIdAsync(long supplierId)
    {
        var items = await _paymentRepo.GetBySupplierIdAsync(supplierId);
        return items.Select(MapToListItemDto).ToList();
    }

    public async Task<List<SupplierPaymentListItemDto>> GetPaymentsByBillIdAsync(long billId)
    {
        var items = await _paymentRepo.GetByBillIdAsync(billId);
        return items.Select(MapToListItemDto).ToList();
    }

    public async Task<string> GetNextPaymentNumberAsync()
    {
        return await _paymentRepo.GetNextPaymentNumberAsync();
    }

    public async Task<SupplierPaymentDto> CreateSupplierPaymentAsync(CreateSupplierPaymentRequest request, string? createdBy)
    {
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var firstError = validation.Errors.FirstOrDefault()?.ErrorMessage ?? "Invalid supplier payment data.";
            throw new ArgumentException(firstError);
        }

        var supplier = await _supplierRepo.GetByIdAsync(request.SupplierId);
        if (supplier == null)
        {
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");
        }

        if (!string.Equals(supplier.Status, "Active", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Payments can only be recorded for active suppliers.");
        }

        var normalizedMethod = NormalizeMethod(request.PaymentMethod);
        var paymentDateUtc = request.PaymentDate.Kind == DateTimeKind.Utc
            ? request.PaymentDate
            : DateTime.SpecifyKind(request.PaymentDate, DateTimeKind.Utc);

        var entity = new SupplierPayment
        {
            SupplierId = request.SupplierId,
            SupplierBillId = request.SupplierBillId,
            PaymentDate = paymentDateUtc,
            Amount = Math.Round(request.Amount, 2),
            PaymentMethod = normalizedMethod,
            PaymentAccountReference = string.IsNullOrWhiteSpace(request.PaymentAccountReference) ? null : request.PaymentAccountReference.Trim(),
            TransactionReference = string.IsNullOrWhiteSpace(request.TransactionReference) ? null : request.TransactionReference.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Status = "Posted",
            CreatedBy = createdBy,
            IdempotencyKey = string.IsNullOrWhiteSpace(request.IdempotencyKey) ? null : request.IdempotencyKey.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var saved = await _paymentRepo.AddPaymentAtomicAsync(entity);
        return MapToDto(saved);
    }

    public async Task<SupplierPaymentDto?> UpdateSupplierPaymentAsync(long id, UpdateSupplierPaymentRequest request)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var firstError = validation.Errors.FirstOrDefault()?.ErrorMessage ?? "Invalid supplier payment data.";
            throw new ArgumentException(firstError);
        }

        var normalizedMethod = NormalizeMethod(request.PaymentMethod);
        var paymentDateUtc = request.PaymentDate.Kind == DateTimeKind.Utc
            ? request.PaymentDate
            : DateTime.SpecifyKind(request.PaymentDate, DateTimeKind.Utc);

        var updated = await _paymentRepo.UpdatePaymentAtomicAsync(
            id,
            paymentDateUtc,
            request.Amount,
            normalizedMethod,
            string.IsNullOrWhiteSpace(request.PaymentAccountReference) ? null : request.PaymentAccountReference.Trim(),
            string.IsNullOrWhiteSpace(request.TransactionReference) ? null : request.TransactionReference.Trim(),
            string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim());

        return updated == null ? null : MapToDto(updated);
    }

    public async Task<SupplierPaymentDto?> ReverseSupplierPaymentAsync(long id, ReverseSupplierPaymentRequest request, string? reversedBy)
    {
        var validation = await _reverseValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var firstError = validation.Errors.FirstOrDefault()?.ErrorMessage ?? "Reversal reason is required.";
            throw new ArgumentException(firstError);
        }

        var reversed = await _paymentRepo.ReversePaymentAtomicAsync(id, request.ReversalReason, reversedBy);
        return reversed == null ? null : MapToDto(reversed);
    }

    private static string NormalizeMethod(string method)
    {
        if (string.Equals(method, "Cash", StringComparison.OrdinalIgnoreCase)) return "Cash";
        if (string.Equals(method, "Cheque", StringComparison.OrdinalIgnoreCase)) return "Cheque";
        return "Bank Transfer";
    }

    private static SupplierPaymentListItemDto MapToListItemDto(SupplierPayment p)
    {
        var billTotal = p.SupplierBill?.TotalAmount ?? 0m;
        var billPaid = p.SupplierBill?.PaidAmount ?? 0m;
        var billBalance = Math.Round(billTotal - billPaid, 2);

        return new SupplierPaymentListItemDto
        {
            Id = p.Id,
            PaymentNumber = p.PaymentNumber,
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.SupplierName ?? "Unknown Supplier",
            SupplierBillId = p.SupplierBillId,
            InternalBillNumber = p.SupplierBill?.InternalBillNumber ?? string.Empty,
            SupplierInvoiceNumber = p.SupplierBill?.SupplierInvoiceNumber ?? string.Empty,
            BillTotalAmount = billTotal,
            BillPaidAmount = billPaid,
            BillOutstandingBalance = billBalance,
            BillStatus = p.SupplierBill?.Status ?? string.Empty,
            PaymentDate = p.PaymentDate,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentAccountReference = MaskAccountReference(p.PaymentAccountReference),
            TransactionReference = p.TransactionReference,
            Status = p.Status,
            CreatedAt = p.CreatedAt
        };
    }

    private static SupplierPaymentDto MapToDto(SupplierPayment p)
    {
        var billTotal = p.SupplierBill?.TotalAmount ?? 0m;
        var billPaid = p.SupplierBill?.PaidAmount ?? 0m;
        var billBalance = Math.Round(billTotal - billPaid, 2);

        return new SupplierPaymentDto
        {
            Id = p.Id,
            PaymentNumber = p.PaymentNumber,
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.SupplierName ?? "Unknown Supplier",
            SupplierContactPerson = p.Supplier?.ContactPerson,
            SupplierBillId = p.SupplierBillId,
            InternalBillNumber = p.SupplierBill?.InternalBillNumber ?? string.Empty,
            SupplierInvoiceNumber = p.SupplierBill?.SupplierInvoiceNumber ?? string.Empty,
            BillTotalAmount = billTotal,
            BillPaidAmount = billPaid,
            BillOutstandingBalance = billBalance,
            BillStatus = p.SupplierBill?.Status ?? string.Empty,
            PaymentDate = p.PaymentDate,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentAccountReference = p.PaymentAccountReference,
            TransactionReference = p.TransactionReference,
            Notes = p.Notes,
            Status = p.Status,
            ReversalReason = p.ReversalReason,
            ReversedAt = p.ReversedAt,
            ReversedBy = p.ReversedBy,
            CreatedBy = p.CreatedBy,
            RecordIntegrityHash = p.RecordIntegrityHash,
            IsIntegrityVerified = ZerpPixelsCRM.Api.Utils.SecurityHashHelper.VerifySupplierPaymentIntegrity(p),
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }

    // Avoid exposing full sensitive account numbers in listings.
    private static string? MaskAccountReference(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        if (trimmed.Length <= 8) return trimmed;

        var digitsCount = trimmed.Count(char.IsDigit);
        if (digitsCount >= 8)
        {
            return $"•••• {trimmed.Substring(trimmed.Length - 4)}";
        }
        return trimmed;
    }
}
