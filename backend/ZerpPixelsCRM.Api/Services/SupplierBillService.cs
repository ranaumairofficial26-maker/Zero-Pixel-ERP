using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class SupplierBillService : ISupplierBillService
{
    private readonly ISupplierBillRepository _billRepo;
    private readonly ISupplierRepository _supplierRepo;
    private readonly IPurchaseOrderRepository _poRepo;
    private readonly ISupplierPaymentRepository _paymentRepo;
    private readonly IValidator<CreateSupplierBillRequest> _createValidator;
    private readonly IValidator<UpdateSupplierBillRequest> _updateValidator;

    public SupplierBillService(
        ISupplierBillRepository billRepo,
        ISupplierRepository supplierRepo,
        IPurchaseOrderRepository poRepo,
        ISupplierPaymentRepository paymentRepo,
        IValidator<CreateSupplierBillRequest> createValidator,
        IValidator<UpdateSupplierBillRequest> updateValidator)
    {
        _billRepo = billRepo;
        _supplierRepo = supplierRepo;
        _poRepo = poRepo;
        _paymentRepo = paymentRepo;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<PaginatedSupplierBillsResponse> GetSupplierBillsAsync(string? search = null, string? status = null, int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var (items, totalCount) = await _billRepo.GetSupplierBillsAsync(search, status, page, pageSize);

        var list = items.Select(b => MapToListItemDto(b)).ToList();

        return new PaginatedSupplierBillsResponse
        {
            Items = list,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<SupplierBillListItemDto>> GetBillsBySupplierIdAsync(long supplierId)
    {
        var bills = await _billRepo.GetBySupplierIdAsync(supplierId);
        return bills.Select(b => MapToListItemDto(b)).ToList();
    }

    public async Task<SupplierBillDto?> GetSupplierBillByIdAsync(long id)
    {
        var bill = await _billRepo.GetByIdAsync(id);
        return bill == null ? null : MapToDto(bill);
    }

    public async Task<string> GetNextInternalBillNumberAsync()
    {
        return await _billRepo.GetNextInternalBillNumberAsync();
    }

    public async Task<SupplierBillSummaryDto> GetSummaryAsync()
    {
        var activeBills = await _billRepo.GetAllActiveBillsAsync();
        var today = DateTime.UtcNow.Date;

        decimal totalOutstanding = 0m;
        int overdueCount = 0;

        foreach (var bill in activeBills)
        {
            var balance = bill.TotalAmount - bill.PaidAmount;
            if (balance > 0)
            {
                totalOutstanding += balance;
                if (bill.DueDate.Date < today)
                {
                    overdueCount++;
                }
            }
        }

        var paidThisMonth = await _paymentRepo.GetValidPaidThisMonthAsync();

        return new SupplierBillSummaryDto
        {
            OutstandingPayables = totalOutstanding,
            OverdueBillsCount = overdueCount,
            PaidThisMonth = $"PKR {paidThisMonth:N2}"
        };
    }

    public async Task<SupplierBillAgingReportDto> GetAgingReportAsync()
    {
        var activeBills = await _billRepo.GetAllActiveBillsAsync();
        var today = DateTime.UtcNow.Date;

        var report = new SupplierBillAgingReportDto();
        var items = new List<SupplierBillAgingItemDto>();

        foreach (var bill in activeBills)
        {
            var balance = bill.TotalAmount - bill.PaidAmount;
            if (balance <= 0) continue;

            var daysOverdue = (today - bill.DueDate.Date).Days;
            string category;

            if (daysOverdue <= 0)
            {
                category = "Not Yet Due";
                report.TotalNotYetDue += balance;
            }
            else if (daysOverdue <= 30)
            {
                category = "1–30 Days Overdue";
                report.Total1To30Days += balance;
            }
            else if (daysOverdue <= 60)
            {
                category = "31–60 Days Overdue";
                report.Total31To60Days += balance;
            }
            else if (daysOverdue <= 90)
            {
                category = "61–90 Days Overdue";
                report.Total61To90Days += balance;
            }
            else
            {
                category = "Over 90 Days Overdue";
                report.TotalOver90Days += balance;
            }

            report.TotalOutstanding += balance;

            items.Add(new SupplierBillAgingItemDto
            {
                BillId = bill.Id,
                InternalBillNumber = bill.InternalBillNumber,
                SupplierInvoiceNumber = bill.SupplierInvoiceNumber,
                SupplierId = bill.SupplierId,
                SupplierName = bill.Supplier?.SupplierName ?? "Unknown Supplier",
                BillDate = bill.BillDate,
                DueDate = bill.DueDate,
                TotalAmount = bill.TotalAmount,
                PaidAmount = bill.PaidAmount,
                Balance = balance,
                DaysOverdue = daysOverdue > 0 ? daysOverdue : 0,
                AgingCategory = category
            });
        }

        report.Items = items.OrderByDescending(i => i.DaysOverdue).ThenBy(i => i.DueDate).ToList();
        return report;
    }

    public async Task<SupplierBillDto> CreateSupplierBillAsync(CreateSupplierBillRequest request)
    {
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var firstError = validation.Errors.FirstOrDefault()?.ErrorMessage ?? "Invalid supplier bill data.";
            throw new ArgumentException(firstError);
        }

        var supplier = await _supplierRepo.GetByIdAsync(request.SupplierId);
        if (supplier == null)
        {
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");
        }

        if (request.PurchaseOrderId.HasValue)
        {
            var po = await _poRepo.GetByIdAsync(request.PurchaseOrderId.Value);
            if (po == null)
            {
                throw new ArgumentException($"Referenced Purchase Order with ID {request.PurchaseOrderId.Value} does not exist.");
            }
            if (po.SupplierId != request.SupplierId)
            {
                throw new ArgumentException("The selected Purchase Order does not belong to the selected supplier.");
            }
            if (po.Status == "Cancelled")
            {
                throw new ArgumentException("Cannot reference a cancelled Purchase Order.");
            }
        }

        var invoiceDuplicate = await _billRepo.SupplierInvoiceNumberExistsAsync(request.SupplierId, request.SupplierInvoiceNumber);
        if (invoiceDuplicate)
        {
            throw new InvalidOperationException($"Supplier Invoice Number '{request.SupplierInvoiceNumber}' is already recorded for this supplier.");
        }

        string internalNumber;
        if (!string.IsNullOrWhiteSpace(request.InternalBillNumber))
        {
            internalNumber = request.InternalBillNumber.Trim();
            if (await _billRepo.InternalBillNumberExistsAsync(internalNumber))
            {
                throw new InvalidOperationException($"Internal Bill Number '{internalNumber}' already exists.");
            }
        }
        else
        {
            internalNumber = await _billRepo.GetNextInternalBillNumberAsync();
        }

        var items = new List<SupplierBillItem>();
        decimal calculatedTotal = 0m;
        int sr = 1;

        foreach (var itm in request.Items)
        {
            var qty = Math.Round(itm.Quantity, 2);
            var rate = Math.Round(itm.Rate, 2);
            var amt = Math.Round(qty * rate, 2);
            calculatedTotal += amt;

            items.Add(new SupplierBillItem
            {
                SerialNumber = sr++,
                Description = itm.Description.Trim(),
                Quantity = qty,
                Rate = rate,
                Amount = amt
            });
        }

        var status = DeriveStatus(calculatedTotal, 0m, request.DueDate, false);

        var bill = new SupplierBill
        {
            InternalBillNumber = internalNumber,
            SupplierInvoiceNumber = request.SupplierInvoiceNumber.Trim(),
            SupplierId = request.SupplierId,
            PurchaseOrderId = request.PurchaseOrderId,
            BillDate = request.BillDate.Kind == DateTimeKind.Utc ? request.BillDate : request.BillDate.ToUniversalTime(),
            DueDate = request.DueDate.Kind == DateTimeKind.Utc ? request.DueDate : request.DueDate.ToUniversalTime(),
            Description = request.Description?.Trim(),
            TotalAmount = calculatedTotal,
            PaidAmount = 0m,
            Status = status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items = items
        };

        var saved = await _billRepo.AddAsync(bill);
        var reloaded = await _billRepo.GetByIdAsync(saved.Id);
        return MapToDto(reloaded ?? saved);
    }

    public async Task<SupplierBillDto?> UpdateSupplierBillAsync(long id, UpdateSupplierBillRequest request)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var firstError = validation.Errors.FirstOrDefault()?.ErrorMessage ?? "Invalid supplier bill data.";
            throw new ArgumentException(firstError);
        }

        var bill = await _billRepo.GetByIdAsync(id);
        if (bill == null) return null;

        if (bill.Status == "Cancelled")
        {
            throw new InvalidOperationException("Cancelled supplier bills cannot be edited.");
        }

        if (bill.PaidAmount > 0)
        {
            throw new InvalidOperationException("Bills with recorded payments cannot be edited directly without a payment adjustment process.");
        }

        var supplier = await _supplierRepo.GetByIdAsync(request.SupplierId);
        if (supplier == null)
        {
            throw new ArgumentException($"Supplier with ID {request.SupplierId} does not exist.");
        }

        if (request.PurchaseOrderId.HasValue)
        {
            var po = await _poRepo.GetByIdAsync(request.PurchaseOrderId.Value);
            if (po == null)
            {
                throw new ArgumentException($"Referenced Purchase Order with ID {request.PurchaseOrderId.Value} does not exist.");
            }
            if (po.SupplierId != request.SupplierId)
            {
                throw new ArgumentException("The selected Purchase Order does not belong to the selected supplier.");
            }
            if (po.Status == "Cancelled")
            {
                throw new ArgumentException("Cannot reference a cancelled Purchase Order.");
            }
        }

        var duplicateInvoice = await _billRepo.SupplierInvoiceNumberExistsAsync(request.SupplierId, request.SupplierInvoiceNumber, id);
        if (duplicateInvoice)
        {
            throw new InvalidOperationException($"Supplier Invoice Number '{request.SupplierInvoiceNumber}' is already recorded for this supplier on another bill.");
        }

        var items = new List<SupplierBillItem>();
        decimal calculatedTotal = 0m;
        int sr = 1;

        foreach (var itm in request.Items)
        {
            var qty = Math.Round(itm.Quantity, 2);
            var rate = Math.Round(itm.Rate, 2);
            var amt = Math.Round(qty * rate, 2);
            calculatedTotal += amt;

            items.Add(new SupplierBillItem
            {
                SerialNumber = sr++,
                Description = itm.Description.Trim(),
                Quantity = qty,
                Rate = rate,
                Amount = amt
            });
        }

        bill.SupplierInvoiceNumber = request.SupplierInvoiceNumber.Trim();
        bill.SupplierId = request.SupplierId;
        bill.PurchaseOrderId = request.PurchaseOrderId;
        bill.BillDate = request.BillDate.Kind == DateTimeKind.Utc ? request.BillDate : request.BillDate.ToUniversalTime();
        bill.DueDate = request.DueDate.Kind == DateTimeKind.Utc ? request.DueDate : request.DueDate.ToUniversalTime();
        bill.Description = request.Description?.Trim();
        bill.TotalAmount = calculatedTotal;
        bill.Status = DeriveStatus(calculatedTotal, bill.PaidAmount, bill.DueDate, false);

        await _billRepo.UpdateAsync(bill, items);
        var reloaded = await _billRepo.GetByIdAsync(id);
        return MapToDto(reloaded ?? bill);
    }

    public async Task<bool> CancelSupplierBillAsync(long id)
    {
        var bill = await _billRepo.GetByIdAsync(id);
        if (bill == null) return false;

        if (bill.Status == "Cancelled")
        {
            return true;
        }

        if (bill.PaidAmount > 0)
        {
            throw new InvalidOperationException("Bills with recorded payments cannot be cancelled without an appropriate payment reversal process.");
        }

        return await _billRepo.CancelAsync(id);
    }

    private static string DeriveStatus(decimal totalAmount, decimal paidAmount, DateTime dueDate, bool isCancelled)
    {
        if (isCancelled) return "Cancelled";
        var balance = totalAmount - paidAmount;
        if (balance <= 0) return "Paid";
        if (paidAmount > 0) return "Partially Paid";
        if (DateTime.UtcNow.Date > dueDate.Date) return "Overdue";
        return "Unpaid";
    }

    private static SupplierBillListItemDto MapToListItemDto(SupplierBill b)
    {
        var balance = b.TotalAmount - b.PaidAmount;
        var status = b.Status == "Cancelled" ? "Cancelled" : DeriveStatus(b.TotalAmount, b.PaidAmount, b.DueDate, false);

        return new SupplierBillListItemDto
        {
            Id = b.Id,
            InternalBillNumber = b.InternalBillNumber,
            SupplierInvoiceNumber = b.SupplierInvoiceNumber,
            SupplierId = b.SupplierId,
            SupplierName = b.Supplier?.SupplierName ?? "Unknown Supplier",
            PurchaseOrderId = b.PurchaseOrderId,
            PurchaseOrderNumber = b.PurchaseOrder?.PoNumber,
            BillDate = b.BillDate,
            DueDate = b.DueDate,
            TotalAmount = b.TotalAmount,
            PaidAmount = b.PaidAmount,
            Balance = balance,
            Status = status,
            ItemCount = b.Items?.Count ?? 0,
            CreatedAt = b.CreatedAt
        };
    }

    private static SupplierBillDto MapToDto(SupplierBill b)
    {
        var balance = b.TotalAmount - b.PaidAmount;
        var status = b.Status == "Cancelled" ? "Cancelled" : DeriveStatus(b.TotalAmount, b.PaidAmount, b.DueDate, false);

        return new SupplierBillDto
        {
            Id = b.Id,
            InternalBillNumber = b.InternalBillNumber,
            SupplierInvoiceNumber = b.SupplierInvoiceNumber,
            SupplierId = b.SupplierId,
            SupplierName = b.Supplier?.SupplierName ?? "Unknown Supplier",
            SupplierContactPerson = b.Supplier?.ContactPerson,
            SupplierPhone = b.Supplier?.PhoneNumber,
            SupplierEmail = b.Supplier?.Email,
            SupplierAddress = b.Supplier?.Address,
            PurchaseOrderId = b.PurchaseOrderId,
            PurchaseOrderNumber = b.PurchaseOrder?.PoNumber,
            BillDate = b.BillDate,
            DueDate = b.DueDate,
            Description = b.Description,
            TotalAmount = b.TotalAmount,
            PaidAmount = b.PaidAmount,
            Balance = balance,
            Status = status,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            CancelledAt = b.CancelledAt,
            Items = b.Items?.OrderBy(i => i.SerialNumber).Select(i => new SupplierBillItemDto
            {
                Id = i.Id,
                SerialNumber = i.SerialNumber,
                Description = i.Description,
                Quantity = i.Quantity,
                Rate = i.Rate,
                Amount = i.Amount
            }).ToList() ?? new()
        };
    }
}

