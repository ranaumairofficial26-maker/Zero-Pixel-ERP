using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class PrintingOrderService : IPrintingOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PrintingOrderService> _logger;

    public PrintingOrderService(IUnitOfWork unitOfWork, ILogger<PrintingOrderService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PrintingOrderDto?> CreateOrderFromApprovedRevisionAsync(long revisionId, string? notes = null)
    {
        var revision = await _unitOfWork.Quotations.GetRevisionWithDetailsAsync(revisionId);
        if (revision == null)
        {
            return null;
        }

        var isApproved = revision.ApprovalLogs.Any(a => a.Decision.Equals("Approved", StringComparison.OrdinalIgnoreCase));
        if (!isApproved)
        {
            throw new InvalidOperationException($"Cannot create a Printing Order for quotation revision {revision.RevisionNumber} because its status is '{revision.Status}' and it is not Approved.");
        }

        return await CreateOrSyncOrderFromRevisionAsync(revisionId, notes ?? "Auto (Quotation Approved)");
    }

    public async Task<PrintingOrderDto?> CreateOrSyncOrderFromRevisionAsync(long revisionId, string? notes = null)
    {
        var revision = await _unitOfWork.Quotations.GetRevisionWithDetailsAsync(revisionId);
        if (revision == null)
        {
            return null;
        }

        var quotation = revision.Quotation;
        var proposedProdType = string.IsNullOrWhiteSpace(revision.ProductionType) ? "IN_HOUSE" : revision.ProductionType.Trim();
        var now = DateTime.UtcNow;

        var existingOrder = await _unitOfWork.PrintingOrders.GetOrderByRevisionIdAsync(revisionId);
        if (existingOrder != null)
        {
            existingOrder.ProductionType = proposedProdType;
            existingOrder.CustomerName = quotation.CustomerName;
            existingOrder.CustomerPhone = quotation.CustomerPhone;
            existingOrder.CustomerEmail = quotation.CustomerEmail;
            existingOrder.CustomerAddress = quotation.CustomerAddress;
            existingOrder.Subtotal = revision.Subtotal;
            existingOrder.DiscountAmount = revision.DiscountAmount;
            existingOrder.TaxAmount = revision.TaxAmount;
            existingOrder.GrandTotal = revision.GrandTotal;
            existingOrder.Status = "Pending Review";
            existingOrder.UpdatedAt = now;

            foreach (var revItem in revision.Items)
            {
                var existingItem = existingOrder.Items.FirstOrDefault(i => i.QuotationItemId == revItem.ItemId);
                var itemProdType = string.IsNullOrWhiteSpace(revItem.ProductionType) ? proposedProdType : revItem.ProductionType.Trim();
                if (existingItem != null)
                {
                    existingItem.ProductName = revItem.ProductName;
                    existingItem.Description = revItem.Description;
                    existingItem.SizeDimensions = revItem.SizeDimensions;
                    existingItem.Material = revItem.Material;
                    existingItem.Gsm = revItem.Gsm;
                    existingItem.PrintingColor = revItem.PrintingColor;
                    existingItem.Finishing = revItem.Finishing;
                    existingItem.Quantity = revItem.Quantity;
                    existingItem.Unit = revItem.Unit;
                    existingItem.UnitPrice = revItem.UnitPrice;
                    existingItem.LineTotal = revItem.LineTotal;
                    existingItem.ProductionType = itemProdType;
                    existingItem.Notes = revItem.Notes;
                }
                else
                {
                    existingOrder.Items.Add(new PrintingOrderItem
                    {
                        Order = existingOrder,
                        QuotationItemId = revItem.ItemId,
                        ProductName = revItem.ProductName,
                        Description = revItem.Description,
                        SizeDimensions = revItem.SizeDimensions,
                        Material = revItem.Material,
                        Gsm = revItem.Gsm,
                        PrintingColor = revItem.PrintingColor,
                        Finishing = revItem.Finishing,
                        Quantity = revItem.Quantity,
                        Unit = revItem.Unit,
                        UnitPrice = revItem.UnitPrice,
                        LineTotal = revItem.LineTotal,
                        ProductionType = itemProdType,
                        Notes = revItem.Notes
                    });
                }
            }

            var distinctTypes = existingOrder.Items.Select(i => i.ProductionType).Distinct().ToList();
            if (distinctTypes.Count > 1) existingOrder.ProductionType = "MIXED";
            else if (distinctTypes.Count == 1) existingOrder.ProductionType = distinctTypes.First();

            await _unitOfWork.CompleteAsync();

            var syncedConfirmed = await ConfirmOrderAsync(existingOrder.OrderId, new ConfirmPrintingOrderRequest
            {
                ConfirmedBy = "Quotation Production Sync",
                Notes = notes
            });

            return syncedConfirmed ?? MapToDto(existingOrder);
        }

        var orderNumber = await _unitOfWork.PrintingOrders.GenerateNextOrderNumberAsync();

        var order = new PrintingOrder
        {
            OrderNumber = orderNumber,
            QuotationId = quotation.QuotationId,
            RevisionId = revision.RevisionId,
            ClientId = quotation.ClientId,
            CustomerName = quotation.CustomerName,
            ContactPerson = quotation.ContactPerson,
            CustomerPhone = quotation.CustomerPhone,
            CustomerEmail = quotation.CustomerEmail,
            CustomerAddress = quotation.CustomerAddress,
            Status = "Pending Review",
            ProductionType = proposedProdType,
            Subtotal = revision.Subtotal,
            DiscountAmount = revision.DiscountAmount,
            TaxAmount = revision.TaxAmount,
            GrandTotal = revision.GrandTotal,
            Notes = notes ?? revision.CustomerNotes,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var item in revision.Items)
        {
            var itemProdType = string.IsNullOrWhiteSpace(item.ProductionType) ? proposedProdType : item.ProductionType.Trim();

            order.Items.Add(new PrintingOrderItem
            {
                Order = order,
                QuotationItemId = item.ItemId,
                ProductName = item.ProductName,
                Description = item.Description,
                SizeDimensions = item.SizeDimensions,
                Material = item.Material,
                Gsm = item.Gsm,
                PrintingColor = item.PrintingColor,
                Finishing = item.Finishing,
                Quantity = item.Quantity,
                Unit = item.Unit,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal,
                ProductionType = itemProdType,
                Notes = item.Notes
            });
        }

        var distinctItemTypes = order.Items.Select(i => i.ProductionType).Distinct().ToList();
        if (distinctItemTypes.Count > 1)
        {
            order.ProductionType = "MIXED";
        }
        else if (distinctItemTypes.Count == 1)
        {
            order.ProductionType = distinctItemTypes.First();
        }

        await _unitOfWork.PrintingOrders.AddAsync(order);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Created Printing Order {OrderNumber} for quotation {QuotationNumber} (Revision {RevisionNumber})",
            order.OrderNumber, quotation.QuotationNumber, revision.RevisionNumber);

        var confirmedOrder = await ConfirmOrderAsync(order.OrderId, new ConfirmPrintingOrderRequest
        {
            ConfirmedBy = "Quotation Production Sync",
            Notes = notes
        });

        return confirmedOrder ?? MapToDto(order);
    }

    public async Task<PrintingOrderDto?> GetOrderByIdAsync(long orderId)
    {
        var order = await _unitOfWork.PrintingOrders.GetOrderWithDetailsAsync(orderId);
        return order == null ? null : MapToDto(order);
    }

    public async Task<PrintingOrderDto?> GetOrderByRevisionIdAsync(long revisionId)
    {
        var order = await _unitOfWork.PrintingOrders.GetOrderByRevisionIdAsync(revisionId);
        return order == null ? null : MapToDto(order);
    }

    public async Task<List<PrintingOrderDto>> GetAllOrdersAsync(string? status = null, string? search = null)
    {
        var orders = await _unitOfWork.PrintingOrders.GetAllOrdersAsync(status, search);
        return orders.Select(MapToDto).ToList();
    }

    public async Task<PrintingOrderDto?> UpdateOrderProductionTypesAsync(long orderId, UpdateOrderItemsProductionTypeRequest request)
    {
        var order = await _unitOfWork.PrintingOrders.GetOrderWithDetailsAsync(orderId);
        if (order == null) return null;

        if (order.Status.Equals("Confirmed", StringComparison.OrdinalIgnoreCase) ||
            order.Status.Equals("In Production", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Cannot change production type of an already confirmed order.");
        }

        if (!string.IsNullOrWhiteSpace(request.OverallProductionType))
        {
            order.ProductionType = request.OverallProductionType.Trim();
        }

        if (request.Items != null && request.Items.Any())
        {
            foreach (var itemUpdate in request.Items)
            {
                var existingItem = order.Items.FirstOrDefault(i => i.OrderItemId == itemUpdate.OrderItemId);
                if (existingItem != null)
                {
                    existingItem.ProductionType = itemUpdate.ProductionType.Trim();
                }
            }

            var distinctTypes = order.Items.Select(i => i.ProductionType).Distinct().ToList();
            if (distinctTypes.Count > 1)
            {
                order.ProductionType = "MIXED";
            }
            else if (distinctTypes.Count == 1)
            {
                order.ProductionType = distinctTypes.First();
            }
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.CompleteAsync();

        return MapToDto(order);
    }

    public async Task<PrintingOrderDto?> ConfirmOrderAsync(long orderId, ConfirmPrintingOrderRequest request)
    {
        // Use a database transaction to ensure atomicity and duplicate prevention
        using var transaction = await _unitOfWork.Context.Database.BeginTransactionAsync();
        try
        {
            var order = await _unitOfWork.PrintingOrders.GetOrderWithDetailsAsync(orderId);
            if (order == null) return null;

            // Idempotency: If already confirmed, return without duplicating jobs
            if (order.Status.Equals("Confirmed", StringComparison.OrdinalIgnoreCase) ||
                order.Status.Equals("In Production", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Order {OrderId} is already confirmed. Returning existing jobs.", orderId);
                return MapToDto(order);
            }

            // Allow Admin to review or change the proposed production type before confirming the order
            if (request.Items != null && request.Items.Any())
            {
                foreach (var itemUpdate in request.Items)
                {
                    var existingItem = order.Items.FirstOrDefault(i => i.OrderItemId == itemUpdate.OrderItemId);
                    if (existingItem != null)
                    {
                        existingItem.ProductionType = itemUpdate.ProductionType.Trim();
                    }
                }
            }

            var distinctTypes = order.Items.Select(i => i.ProductionType).Distinct().ToList();
            if (distinctTypes.Count > 1)
            {
                order.ProductionType = "MIXED";
            }
            else if (distinctTypes.Count == 1)
            {
                order.ProductionType = distinctTypes.First();
            }

            var now = DateTime.UtcNow;
            order.Status = "Confirmed";
            order.ConfirmedAt = now;
            order.ConfirmedBy = !string.IsNullOrWhiteSpace(request.ConfirmedBy) ? request.ConfirmedBy.Trim() : "Admin";
            if (!string.IsNullOrWhiteSpace(request.Notes))
            {
                order.Notes = request.Notes.Trim();
            }
            order.UpdatedAt = now;

            // Separate items by ProductionType
            var inHouseItems = order.Items.Where(i => i.ProductionType.Equals("IN_HOUSE", StringComparison.OrdinalIgnoreCase)).ToList();
            var outsourcedItems = order.Items.Where(i => i.ProductionType.Equals("OUTSOURCED", StringComparison.OrdinalIgnoreCase)).ToList();

            // 1. Create or sync In-House Production Job
            var existingIhJob = order.ProductionJobs.FirstOrDefault(j => j.ProductionType.Equals("IN_HOUSE", StringComparison.OrdinalIgnoreCase));
            if (inHouseItems.Any())
            {
                if (existingIhJob == null)
                {
                    var ihJobNumber = await _unitOfWork.ProductionJobs.GenerateNextJobNumberAsync("IN_HOUSE");
                    var ihJob = new ProductionJob
                    {
                        JobNumber = ihJobNumber,
                        OrderId = order.OrderId,
                        ProductionType = "IN_HOUSE",
                        Status = "Queued",
                        Priority = "Normal",
                        TargetStartDate = now,
                        DueDate = now.AddDays(3),
                        CreatedAt = now,
                        UpdatedAt = now
                    };

                    foreach (var item in inHouseItems)
                    {
                        ihJob.JobItems.Add(new ProductionJobItem
                        {
                            Job = ihJob,
                            OrderItemId = item.OrderItemId
                        });
                    }

                    await _unitOfWork.ProductionJobs.AddAsync(ihJob);
                    order.ProductionJobs.Add(ihJob);
                }
                else
                {
                    if (existingIhJob.Status == "Cancelled") existingIhJob.Status = "Queued";
                    existingIhJob.UpdatedAt = now;
                    existingIhJob.JobItems.Clear();
                    foreach (var item in inHouseItems)
                    {
                        existingIhJob.JobItems.Add(new ProductionJobItem
                        {
                            Job = existingIhJob,
                            OrderItemId = item.OrderItemId
                        });
                    }
                }
            }
            else if (existingIhJob != null)
            {
                existingIhJob.Status = "Cancelled";
                existingIhJob.UpdatedAt = now;
            }

            // 2. Create or sync Outsourced Production Job
            var existingOsJob = order.ProductionJobs.FirstOrDefault(j => j.ProductionType.Equals("OUTSOURCED", StringComparison.OrdinalIgnoreCase));
            if (outsourcedItems.Any())
            {
                if (existingOsJob == null)
                {
                    var osJobNumber = await _unitOfWork.ProductionJobs.GenerateNextJobNumberAsync("OUTSOURCED");
                    var osJob = new ProductionJob
                    {
                        JobNumber = osJobNumber,
                        OrderId = order.OrderId,
                        ProductionType = "OUTSOURCED",
                        Status = "Pending Vendor PO",
                        Priority = "Normal",
                        TargetStartDate = now,
                        DueDate = now.AddDays(5),
                        CreatedAt = now,
                        UpdatedAt = now
                    };

                    foreach (var item in outsourcedItems)
                    {
                        osJob.JobItems.Add(new ProductionJobItem
                        {
                            Job = osJob,
                            OrderItemId = item.OrderItemId
                        });
                    }

                    await _unitOfWork.ProductionJobs.AddAsync(osJob);
                    order.ProductionJobs.Add(osJob);
                }
                else
                {
                    if (existingOsJob.Status == "Cancelled") existingOsJob.Status = "Pending Vendor PO";
                    existingOsJob.UpdatedAt = now;
                    existingOsJob.JobItems.Clear();
                    foreach (var item in outsourcedItems)
                    {
                        existingOsJob.JobItems.Add(new ProductionJobItem
                        {
                            Job = existingOsJob,
                            OrderItemId = item.OrderItemId
                        });
                    }
                }
            }
            else if (existingOsJob != null)
            {
                existingOsJob.Status = "Cancelled";
                existingOsJob.UpdatedAt = now;
            }

            await _unitOfWork.CompleteAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Confirmed Printing Order {OrderNumber}. Generated {JobCount} production jobs.",
                order.OrderNumber, order.ProductionJobs.Count);

            var reloaded = await _unitOfWork.PrintingOrders.GetOrderWithDetailsAsync(order.OrderId);
            return MapToDto(reloaded ?? order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static PrintingOrderDto MapToDto(PrintingOrder order)
    {
        return new PrintingOrderDto
        {
            OrderId = order.OrderId,
            OrderNumber = order.OrderNumber,
            QuotationId = order.QuotationId,
            QuotationNumber = order.Quotation?.QuotationNumber ?? string.Empty,
            RevisionId = order.RevisionId,
            RevisionNumber = order.Revision?.RevisionNumber ?? 1,
            ClientId = order.ClientId,
            CustomerName = order.CustomerName,
            ContactPerson = order.ContactPerson,
            CustomerPhone = order.CustomerPhone,
            CustomerEmail = order.CustomerEmail,
            CustomerAddress = order.CustomerAddress,
            Status = order.Status,
            ProductionType = order.ProductionType,
            Subtotal = order.Subtotal,
            DiscountAmount = order.DiscountAmount,
            TaxAmount = order.TaxAmount,
            GrandTotal = order.GrandTotal,
            Notes = order.Notes,
            ConfirmedAt = order.ConfirmedAt,
            ConfirmedBy = order.ConfirmedBy,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.Items.Select(i => new PrintingOrderItemDto
            {
                OrderItemId = i.OrderItemId,
                OrderId = i.OrderId,
                QuotationItemId = i.QuotationItemId,
                ProductName = i.ProductName,
                Description = i.Description,
                SizeDimensions = i.SizeDimensions,
                Material = i.Material,
                Gsm = i.Gsm,
                PrintingColor = i.PrintingColor,
                Finishing = i.Finishing,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                LineTotal = i.LineTotal,
                ProductionType = i.ProductionType,
                Notes = i.Notes
            }).ToList(),
            ProductionJobs = order.ProductionJobs.Select(j => new ProductionJobSummaryDto
            {
                JobId = j.JobId,
                JobNumber = j.JobNumber,
                ProductionType = j.ProductionType,
                Status = j.Status,
                AssignedOperator = j.AssignedOperator,
                VendorName = j.VendorName,
                ItemCount = j.JobItems.Count
            }).ToList()
        };
    }
}

