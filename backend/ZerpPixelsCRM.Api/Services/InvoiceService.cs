using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IClientRepository _clientRepository;
    private readonly InvoicePdfService _invoicePdfService;
    private readonly ILogger<InvoiceService> _logger;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        IClientRepository clientRepository,
        InvoicePdfService invoicePdfService,
        ILogger<InvoiceService> logger)
    {
        _invoiceRepository = invoiceRepository;
        _clientRepository = clientRepository;
        _invoicePdfService = invoicePdfService;
        _logger = logger;
    }

    public async Task<PaginatedInvoicesResponse> GetInvoicesAsync(string? search = null, string? period = null, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, totalCount) = await _invoiceRepository.GetInvoicesAsync(search, period, fromDate, toDate, page, pageSize);

        var dtos = items.Select(i => new InvoiceListDto
        {
            Id = i.Id,
            InvoiceNumber = i.InvoiceNumber,
            InvoiceDate = i.InvoiceDate,
            CustomerId = i.CustomerId,
            CustomerName = i.CustomerName,
            CompanyName = i.CompanyName,
            ContactNumber = i.ContactNumber,
            Total = i.Total,
            Advance = i.Advance,
            AdjustmentType = string.IsNullOrWhiteSpace(i.AdjustmentType) ? "advance" : i.AdjustmentType,
            AdjustmentRate = i.AdjustmentRate,
            Balance = i.Balance,
            PreviousBalance = i.PreviousBalance,
            ItemCount = i.Items.Count,
            CreatedAt = i.CreatedAt
        }).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new PaginatedInvoicesResponse
        {
            Items = dtos,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(long id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null) return null;

        return MapToDto(invoice);
    }

    public async Task<InvoiceDto?> GetInvoiceByIdOrNumberAsync(string idOrNumber)
    {
        var invoice = await _invoiceRepository.GetByIdOrNumberAsync(idOrNumber);
        if (invoice == null) return null;

        return MapToDto(invoice);
    }

    public async Task<(byte[] FileBytes, string FileName)?> GeneratePdfAsync(string idOrNumber)
    {
        var invoice = await _invoiceRepository.GetByIdOrNumberAsync(idOrNumber);
        if (invoice == null) return null;

        var bytes = _invoicePdfService.GenerateInvoicePdf(invoice);
        var cleanInvNumber = string.IsNullOrWhiteSpace(invoice.InvoiceNumber) ? $"Invoice_{invoice.Id}" : invoice.InvoiceNumber.Trim();
        var fileName = $"{cleanInvNumber}.pdf";

        return (bytes, fileName);
    }

    public async Task<string> GetNextInvoiceNumberAsync()
    {
        return await _invoiceRepository.GetNextInvoiceNumberAsync();
    }

    public async Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto dto)
    {
        // 1. Fetch Customer from Customer Master
        var client = await _clientRepository.GetByIdAsync(dto.CustomerId);
        if (client == null)
        {
            throw new ArgumentException($"Customer with ID {dto.CustomerId} does not exist in Customer Master.");
        }

        // 2. Validate Items
        if (dto.Items == null || dto.Items.Count == 0)
        {
            throw new ArgumentException("An invoice must contain at least one item.");
        }

        var invoiceItems = new List<InvoiceItem>();
        decimal runningTotal = 0;
        int seq = 1;

        foreach (var itemDto in dto.Items)
        {
            if (string.IsNullOrWhiteSpace(itemDto.Description))
            {
                throw new ArgumentException($"Item {seq}: Description is required.");
            }
            if (itemDto.Quantity <= 0)
            {
                throw new ArgumentException($"Item {seq}: Quantity must be greater than zero.");
            }
            if (itemDto.Rate < 0)
            {
                throw new ArgumentException($"Item {seq}: Rate cannot be negative.");
            }

            var calculatedAmount = Math.Round(itemDto.Quantity * itemDto.Rate, 2);
            runningTotal += calculatedAmount;

            invoiceItems.Add(new InvoiceItem
            {
                SerialNumber = seq++,
                GrNumber = string.IsNullOrWhiteSpace(itemDto.GrNumber) ? null : itemDto.GrNumber.Trim(),
                Description = itemDto.Description.Trim(),
                Quantity = itemDto.Quantity,
                Rate = itemDto.Rate,
                Amount = calculatedAmount,
                CreatedAt = DateTime.UtcNow
            });
        }

        runningTotal = Math.Round(runningTotal, 2);

        // 3. Validate Adjustment & Calculate Balance
        var (normalizedType, adjustmentAmount, calculatedRate, balance) =
            CalculateAdjustmentAndBalance(runningTotal, dto.AdjustmentType, dto.AdjustmentRate, dto.Advance);

        // 4. Build Customer Snapshot from existing customer master
        var customerName = !string.IsNullOrWhiteSpace(client.CompanyName)
            ? client.CompanyName
            : (client.ContactPerson ?? "Valued Customer");

        var invoice = new Invoice
        {
            InvoiceNumber = await _invoiceRepository.GetNextInvoiceNumberAsync(),
            InvoiceDate = dto.InvoiceDate == default ? DateTime.UtcNow : dto.InvoiceDate,
            NtnNumber = string.IsNullOrWhiteSpace(dto.NtnNumber) ? null : dto.NtnNumber.Trim(),
            ClientPoNumber = string.IsNullOrWhiteSpace(dto.ClientPoNumber) ? null : dto.ClientPoNumber.Trim(),
            CustomerId = client.ClientId,

            // Snapshot
            CustomerName = customerName,
            CompanyName = client.CompanyName,
            ContactNumber = client.Phone ?? string.Empty,
            Email = client.Email,
            BillingAddress = client.Address,

            // Financials
            Total = runningTotal,
            Advance = adjustmentAmount,
            AdjustmentType = normalizedType,
            AdjustmentRate = calculatedRate,
            Balance = balance,
            PreviousBalance = dto.PreviousBalance.HasValue && dto.PreviousBalance.Value > 0 ? Math.Round(dto.PreviousBalance.Value, 2) : null,
            Notes = dto.Notes,
            Items = invoiceItems
        };

        var created = await _invoiceRepository.AddAsync(invoice);
        _logger.LogInformation("Created Invoice {InvoiceNumber} for Customer {CustomerId} ({CustomerName}). Total: {Total}",
            created.InvoiceNumber, created.CustomerId, created.CustomerName, created.Total);

        return MapToDto(created);
    }

    public async Task<InvoiceDto> UpdateInvoiceAsync(long id, UpdateInvoiceDto dto)
    {
        var existing = await _invoiceRepository.GetByIdAsync(id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found.");
        }

        // Validate Customer
        var client = await _clientRepository.GetByIdAsync(dto.CustomerId);
        if (client == null)
        {
            throw new ArgumentException($"Customer with ID {dto.CustomerId} does not exist in Customer Master.");
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            throw new ArgumentException("An invoice must contain at least one item.");
        }

        var updatedItems = new List<InvoiceItem>();
        decimal runningTotal = 0;
        int seq = 1;

        foreach (var itemDto in dto.Items)
        {
            if (string.IsNullOrWhiteSpace(itemDto.Description))
            {
                throw new ArgumentException($"Item {seq}: Description is required.");
            }
            if (itemDto.Quantity <= 0)
            {
                throw new ArgumentException($"Item {seq}: Quantity must be greater than zero.");
            }
            if (itemDto.Rate < 0)
            {
                throw new ArgumentException($"Item {seq}: Rate cannot be negative.");
            }

            var calculatedAmount = Math.Round(itemDto.Quantity * itemDto.Rate, 2);
            runningTotal += calculatedAmount;

            updatedItems.Add(new InvoiceItem
            {
                InvoiceId = existing.Id,
                SerialNumber = seq++,
                GrNumber = string.IsNullOrWhiteSpace(itemDto.GrNumber) ? null : itemDto.GrNumber.Trim(),
                Description = itemDto.Description.Trim(),
                Quantity = itemDto.Quantity,
                Rate = itemDto.Rate,
                Amount = calculatedAmount,
                CreatedAt = DateTime.UtcNow
            });
        }

        runningTotal = Math.Round(runningTotal, 2);

        var (normalizedType, adjustmentAmount, calculatedRate, balance) =
            CalculateAdjustmentAndBalance(runningTotal, dto.AdjustmentType, dto.AdjustmentRate, dto.Advance);

        // Update details (preserving InvoiceNumber and CreatedAt)
        existing.InvoiceDate = dto.InvoiceDate == default ? existing.InvoiceDate : dto.InvoiceDate;
        existing.NtnNumber = string.IsNullOrWhiteSpace(dto.NtnNumber) ? null : dto.NtnNumber.Trim();
        existing.ClientPoNumber = string.IsNullOrWhiteSpace(dto.ClientPoNumber) ? null : dto.ClientPoNumber.Trim();
        existing.CustomerId = client.ClientId;

        // Refresh snapshot for selected customer
        existing.CustomerName = !string.IsNullOrWhiteSpace(client.CompanyName)
            ? client.CompanyName
            : (client.ContactPerson ?? "Valued Customer");
        existing.CompanyName = client.CompanyName;
        existing.ContactNumber = client.Phone ?? string.Empty;
        existing.Email = client.Email;
        existing.BillingAddress = client.Address;

        existing.Total = runningTotal;
        existing.Advance = adjustmentAmount;
        existing.AdjustmentType = normalizedType;
        existing.AdjustmentRate = calculatedRate;
        existing.Balance = balance;
        existing.PreviousBalance = dto.PreviousBalance.HasValue && dto.PreviousBalance.Value > 0 ? Math.Round(dto.PreviousBalance.Value, 2) : null;
        existing.Notes = dto.Notes;
        existing.Items = updatedItems;

        var updated = await _invoiceRepository.UpdateAsync(existing);
        _logger.LogInformation("Updated Invoice {InvoiceNumber}. Total: {Total}, Balance: {Balance}",
            updated.InvoiceNumber, updated.Total, updated.Balance);

        return MapToDto(updated);
    }

    public async Task<bool> DeleteInvoiceAsync(long id)
    {
        return await _invoiceRepository.DeleteAsync(id);
    }

    private static (string Type, decimal Amount, decimal? Rate, decimal Balance) CalculateAdjustmentAndBalance(
        decimal runningTotal,
        string? adjustmentType,
        decimal? adjustmentRate,
        decimal advanceAmount)
    {
        var type = string.IsNullOrWhiteSpace(adjustmentType)
            ? "advance"
            : adjustmentType.Trim().ToLowerInvariant();

        switch (type)
        {
            case "advance":
                if (advanceAmount < 0)
                    throw new ArgumentException("Advance amount cannot be negative.");
                if (advanceAmount > runningTotal)
                    throw new ArgumentException($"Advance amount (PKR {advanceAmount:N2}) cannot exceed the Invoice Total (PKR {runningTotal:N2}).");

                var adv = Math.Round(advanceAmount, 2);
                return ("advance", adv, null, Math.Round(runningTotal - adv, 2));

            case "tax_amount":
                if (advanceAmount < 0)
                    throw new ArgumentException("Tax amount cannot be negative.");

                var taxAmt = Math.Round(advanceAmount, 2);
                return ("tax_amount", taxAmt, null, Math.Round(runningTotal + taxAmt, 2));

            case "tax_percent":
                var taxPct = adjustmentRate ?? advanceAmount;
                if (taxPct < 0)
                    throw new ArgumentException("Tax percentage cannot be negative.");

                var roundedTaxPct = Math.Round(taxPct, 2);
                var computedTax = Math.Round(runningTotal * roundedTaxPct / 100m, 2);
                return ("tax_percent", computedTax, roundedTaxPct, Math.Round(runningTotal + computedTax, 2));

            case "percent_off":
                var offPct = adjustmentRate ?? advanceAmount;
                if (offPct < 0 || offPct > 100)
                    throw new ArgumentException("Discount percentage must be between 0% and 100%.");

                var roundedOffPct = Math.Round(offPct, 2);
                var computedDiscount = Math.Round(runningTotal * roundedOffPct / 100m, 2);
                return ("percent_off", computedDiscount, roundedOffPct, Math.Round(runningTotal - computedDiscount, 2));

            default:
                throw new ArgumentException($"Unsupported adjustment type '{adjustmentType}'.");
        }
    }

    public async Task<(byte[] FileBytes, string FileName)> GenerateReportPdfAsync(string? period = null, string? search = null, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var (items, _) = await _invoiceRepository.GetInvoicesAsync(search, period, fromDate, toDate, 1, 1000);
        var list = items.ToList();
        var pdfBytes = _invoicePdfService.GenerateInvoicesReportPdf(list, period, search, fromDate, toDate);

        var normalizedPeriod = (fromDate.HasValue || toDate.HasValue)
            ? "custom"
            : (string.IsNullOrWhiteSpace(period) ? "all" : period.Trim().ToLowerInvariant());
        var fileName = $"Invoices_Report_{normalizedPeriod}_{DateTime.UtcNow:yyyyMMdd}.pdf";
        return (pdfBytes, fileName);
    }

    private static InvoiceDto MapToDto(Invoice invoice)
    {
        return new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            NtnNumber = invoice.NtnNumber,
            ClientPoNumber = invoice.ClientPoNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.CustomerName,
            CompanyName = invoice.CompanyName,
            ContactNumber = invoice.ContactNumber,
            Email = invoice.Email,
            BillingAddress = invoice.BillingAddress,
            Total = invoice.Total,
            Advance = invoice.Advance,
            AdjustmentType = string.IsNullOrWhiteSpace(invoice.AdjustmentType) ? "advance" : invoice.AdjustmentType,
            AdjustmentRate = invoice.AdjustmentRate,
            Balance = invoice.Balance,
            PreviousBalance = invoice.PreviousBalance,
            Notes = invoice.Notes,
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt,
            Items = invoice.Items.OrderBy(i => i.SerialNumber).Select(i => new InvoiceItemDto
            {
                Id = i.Id,
                InvoiceId = i.InvoiceId,
                SerialNumber = i.SerialNumber,
                GrNumber = i.GrNumber,
                Description = i.Description,
                Quantity = i.Quantity,
                Rate = i.Rate,
                Amount = i.Amount
            }).ToList()
        };
    }
}

