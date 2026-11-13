using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Validators;

public class CreateSupplierBillValidator : AbstractValidator<CreateSupplierBillRequest>
{
    public CreateSupplierBillValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.SupplierInvoiceNumber)
            .NotEmpty().WithMessage("Supplier invoice number is required.")
            .MaximumLength(100).WithMessage("Supplier invoice number cannot exceed 100 characters.");

        RuleFor(x => x.BillDate)
            .NotEmpty().WithMessage("Bill date is required.");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one bill item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Description)
                .NotEmpty().WithMessage("Item description is required.")
                .MaximumLength(500).WithMessage("Item description cannot exceed 500 characters.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Item quantity must be greater than zero.");

            item.RuleFor(i => i.Rate)
                .GreaterThanOrEqualTo(0).WithMessage("Item rate cannot be negative.");
        });
    }
}

public class UpdateSupplierBillValidator : AbstractValidator<UpdateSupplierBillRequest>
{
    public UpdateSupplierBillValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.SupplierInvoiceNumber)
            .NotEmpty().WithMessage("Supplier invoice number is required.")
            .MaximumLength(100).WithMessage("Supplier invoice number cannot exceed 100 characters.");

        RuleFor(x => x.BillDate)
            .NotEmpty().WithMessage("Bill date is required.");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one bill item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Description)
                .NotEmpty().WithMessage("Item description is required.")
                .MaximumLength(500).WithMessage("Item description cannot exceed 500 characters.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Item quantity must be greater than zero.");

            item.RuleFor(i => i.Rate)
                .GreaterThanOrEqualTo(0).WithMessage("Item rate cannot be negative.");
        });
    }
}

