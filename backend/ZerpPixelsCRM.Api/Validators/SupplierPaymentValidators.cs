using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Validators;

public class CreateSupplierPaymentValidator : AbstractValidator<CreateSupplierPaymentRequest>
{
    private static readonly string[] AllowedMethods = { "Cash", "Bank Transfer", "Cheque" };

    public CreateSupplierPaymentValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Please select a valid supplier.");

        RuleFor(x => x.SupplierBillId)
            .GreaterThan(0).WithMessage("Please select a valid supplier bill.");

        RuleFor(x => x.PaymentDate)
            .NotEmpty().WithMessage("Payment date is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than zero.");

        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required.")
            .Must(m => AllowedMethods.Contains(m, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Payment method must be Cash, Bank Transfer, or Cheque.");

        RuleFor(x => x.PaymentAccountReference)
            .MaximumLength(150).WithMessage("Payment account reference cannot exceed 150 characters.");

        RuleFor(x => x.TransactionReference)
            .MaximumLength(150).WithMessage("Transaction reference cannot exceed 150 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Payment notes cannot exceed 1000 characters.");
    }
}

public class ReverseSupplierPaymentValidator : AbstractValidator<ReverseSupplierPaymentRequest>
{
    public ReverseSupplierPaymentValidator()
    {
        RuleFor(x => x.ReversalReason)
            .NotEmpty().WithMessage("Reversal reason is required.")
            .MaximumLength(500).WithMessage("Reversal reason cannot exceed 500 characters.");
    }
}

public class UpdateSupplierPaymentValidator : AbstractValidator<UpdateSupplierPaymentRequest>
{
    private static readonly string[] AllowedMethods = { "Cash", "Bank Transfer", "Cheque" };

    public UpdateSupplierPaymentValidator()
    {
        RuleFor(x => x.PaymentDate)
            .NotEmpty().WithMessage("Payment date is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than zero.");

        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required.")
            .Must(m => AllowedMethods.Contains(m, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Payment method must be Cash, Bank Transfer, or Cheque.");

        RuleFor(x => x.PaymentAccountReference)
            .MaximumLength(150).WithMessage("Payment account reference cannot exceed 150 characters.");

        RuleFor(x => x.TransactionReference)
            .MaximumLength(150).WithMessage("Transaction reference cannot exceed 150 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Payment notes cannot exceed 1000 characters.");
    }
}
