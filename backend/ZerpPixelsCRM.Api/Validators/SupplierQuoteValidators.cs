using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Validators;

public class SupplierQuoteItemInputValidator : AbstractValidator<SupplierQuoteItemInput>
{
    public SupplierQuoteItemInputValidator()
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

public class CreateSupplierQuoteRequestValidator : AbstractValidator<CreateSupplierQuoteRequest>
{
    public CreateSupplierQuoteRequestValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.QuoteDate)
            .NotEmpty().WithMessage("Quote date is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one quotation item is required.");

        RuleForEach(x => x.Items).SetValidator(new SupplierQuoteItemInputValidator());
    }
}

public class UpdateSupplierQuoteRequestValidator : AbstractValidator<UpdateSupplierQuoteRequest>
{
    public UpdateSupplierQuoteRequestValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.QuoteDate)
            .NotEmpty().WithMessage("Quote date is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one quotation item is required.");

        RuleForEach(x => x.Items).SetValidator(new SupplierQuoteItemInputValidator());
    }
}

