using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.DTOs;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Repositories.Interfaces;

namespace ZerpPixelsCRM.Api.Services;

public class ProductionService : IProductionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductionService> _logger;

    public ProductionService(IUnitOfWork unitOfWork, ILogger<ProductionService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<ProductionJobDto>> GetProductionJobsAsync(string? productionType = null, string? status = null, string? search = null)
    {
        var jobs = await _unitOfWork.ProductionJobs.GetJobsAsync(productionType, status, search);
        return jobs.Select(MapToDto).ToList();
    }

    public async Task<ProductionJobDto?> GetProductionJobByIdAsync(long jobId)
    {
        var job = await _unitOfWork.ProductionJobs.GetJobWithDetailsAsync(jobId);
        return job == null ? null : MapToDto(job);
    }

    public async Task<ProductionJobDto?> UpdateProductionJobAsync(long jobId, UpdateProductionJobRequest request)
    {
        var job = await _unitOfWork.ProductionJobs.GetJobWithDetailsAsync(jobId);
        if (job == null) return null;

        var now = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            job.Status = request.Status.Trim();
            if (job.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                job.CompletedAt = now;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Priority))
        {
            job.Priority = request.Priority.Trim();
        }

        if (request.TargetStartDate.HasValue) job.TargetStartDate = request.TargetStartDate.Value;
        if (request.DueDate.HasValue) job.DueDate = request.DueDate.Value;
        if (request.CompletedAt.HasValue) job.CompletedAt = request.CompletedAt.Value;

        // In-House fields
        if (request.AssignedOperator != null) job.AssignedOperator = request.AssignedOperator.Trim();
        if (request.MachineName != null) job.MachineName = request.MachineName.Trim();

        // Outsourced fields
        if (request.VendorName != null) job.VendorName = request.VendorName.Trim();
        if (request.VendorPhone != null) job.VendorPhone = request.VendorPhone.Trim();
        if (request.VendorEmail != null) job.VendorEmail = request.VendorEmail.Trim();
        if (request.VendorReference != null) job.VendorReference = request.VendorReference.Trim();
        if (request.OutsourcedCost.HasValue) job.OutsourcedCost = request.OutsourcedCost.Value;
        if (request.ExpectedDeliveryDate.HasValue) job.ExpectedDeliveryDate = request.ExpectedDeliveryDate.Value;

        if (request.Notes != null) job.Notes = request.Notes.Trim();

        job.UpdatedAt = now;
        await _unitOfWork.CompleteAsync();

        return MapToDto(job);
    }

    public async Task<ProductionJobDto?> UpdateJobStatusAsync(long jobId, string status, string? notes = null)
    {
        return await UpdateProductionJobAsync(jobId, new UpdateProductionJobRequest
        {
            Status = status,
            Notes = notes
        });
    }

    public async Task<bool> DeleteJobAsync(long jobId)
    {
        var job = await _unitOfWork.ProductionJobs.GetJobWithDetailsAsync(jobId);
        if (job == null) return false;

        _unitOfWork.ProductionJobs.Remove(job);
        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("Deleted production job {JobId} ({JobNumber})", jobId, job.JobNumber);
        return true;
    }

    public async Task<int> ClearInHouseJobsAsync()
    {
        var inHouseJobs = await _unitOfWork.ProductionJobs.GetJobsAsync("IN_HOUSE", null, null);
        int count = 0;
        foreach (var j in inHouseJobs)
        {
            var tracked = await _unitOfWork.ProductionJobs.GetJobWithDetailsAsync(j.JobId);
            if (tracked != null)
            {
                _unitOfWork.ProductionJobs.Remove(tracked);
                count++;
            }
        }
        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("Cleared all {Count} In-House production jobs", count);
        return count;
    }

    private static ProductionJobDto MapToDto(ProductionJob job)
    {
        return new ProductionJobDto
        {
            JobId = job.JobId,
            JobNumber = job.JobNumber,
            OrderId = job.OrderId,
            OrderNumber = job.Order?.OrderNumber ?? string.Empty,
            CustomerName = job.Order?.CustomerName ?? string.Empty,
            CustomerPhone = job.Order?.CustomerPhone ?? string.Empty,
            ProductionType = job.ProductionType,
            Status = job.Status,
            Priority = job.Priority,
            TargetStartDate = job.TargetStartDate,
            DueDate = job.DueDate,
            CompletedAt = job.CompletedAt,
            AssignedOperator = job.AssignedOperator,
            MachineName = job.MachineName,
            VendorName = job.VendorName,
            VendorPhone = job.VendorPhone,
            VendorEmail = job.VendorEmail,
            VendorReference = job.VendorReference,
            OutsourcedCost = job.OutsourcedCost,
            ExpectedDeliveryDate = job.ExpectedDeliveryDate,
            Notes = job.Notes,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt,
            Items = job.JobItems.Select(ji => new PrintingOrderItemDto
            {
                OrderItemId = ji.OrderItem.OrderItemId,
                OrderId = ji.OrderItem.OrderId,
                QuotationItemId = ji.OrderItem.QuotationItemId,
                ProductName = ji.OrderItem.ProductName,
                Description = ji.OrderItem.Description,
                SizeDimensions = ji.OrderItem.SizeDimensions,
                Material = ji.OrderItem.Material,
                Gsm = ji.OrderItem.Gsm,
                PrintingColor = ji.OrderItem.PrintingColor,
                Finishing = ji.OrderItem.Finishing,
                Quantity = ji.OrderItem.Quantity,
                Unit = ji.OrderItem.Unit,
                UnitPrice = ji.OrderItem.UnitPrice,
                LineTotal = ji.OrderItem.LineTotal,
                ProductionType = ji.OrderItem.ProductionType,
                Notes = ji.OrderItem.Notes
            }).ToList()
        };
    }
}

