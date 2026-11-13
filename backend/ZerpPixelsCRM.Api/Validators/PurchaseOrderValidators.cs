using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Validators;

public class PurchaseOrderItemInputValidator : AbstractValidator<PurchaseOrderItemInput>
{
    public PurchaseOrderItemInputValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Item description is required.")
            .MaximumLength(500).WithMessage("Item description cannot exceed 500 characters.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

        RuleFor(x => x.Rate)
            .GreaterThanOrEqualTo(0).WithMessage("Rate cannot be negative.");
    }
}

public class CreatePurchaseOrderRequestValidator : AbstractValidator<CreatePurchaseOrderRequest>
{
    public CreatePurchaseOrderRequestValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.PoDate)
            .NotEmpty().WithMessage("Purchase Order date is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one purchase item is required.");

        RuleForEach(x => x.Items).SetValidator(new PurchaseOrderItemInputValidator());
    }
}

public class UpdatePurchaseOrderRequestValidator : AbstractValidator<UpdatePurchaseOrderRequest>
{
    public UpdatePurchaseOrderRequestValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.PoDate)
            .NotEmpty().WithMessage("Purchase Order date is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one purchase item is required.");

        RuleForEach(x => x.Items).SetValidator(new PurchaseOrderItemInputValidator());
    }
}

