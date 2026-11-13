using FluentValidation;
using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Validators;

public class CreateSupplierRequestValidator : AbstractValidator<CreateSupplierRequest>
{
    public CreateSupplierRequestValidator()
    {
        RuleFor(x => x.SupplierName)
            .NotEmpty().WithMessage("Supplier / Company Name is required.")
            .MaximumLength(200).WithMessage("Supplier name cannot exceed 200 characters.");

        RuleFor(x => x.ContactPerson)
            .MaximumLength(150).WithMessage("Contact person cannot exceed 150 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30).WithMessage("Phone number cannot exceed 30 characters.");

        RuleFor(x => x.Email)
            .MaximumLength(200).WithMessage("Email cannot exceed 200 characters.")
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Please enter a valid email address.");

        RuleFor(x => x.LeadTimeWorkingDays)
            .GreaterThanOrEqualTo(0).When(x => x.LeadTimeWorkingDays.HasValue)
            .WithMessage("Lead time cannot be negative.");

        RuleFor(x => x.Status)
            .Must(s => s == "Active" || s == "Inactive")
            .WithMessage("Status must be Active or Inactive.");
    }
}

public class UpdateSupplierRequestValidator : AbstractValidator<UpdateSupplierRequest>
{
    public UpdateSupplierRequestValidator()
    {
        RuleFor(x => x.SupplierName)
            .NotEmpty().WithMessage("Supplier / Company Name is required.")
            .MaximumLength(200).WithMessage("Supplier name cannot exceed 200 characters.");

        RuleFor(x => x.ContactPerson)
            .MaximumLength(150).WithMessage("Contact person cannot exceed 150 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30).WithMessage("Phone number cannot exceed 30 characters.");

        RuleFor(x => x.Email)
            .MaximumLength(200).WithMessage("Email cannot exceed 200 characters.")
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Please enter a valid email address.");

        RuleFor(x => x.LeadTimeWorkingDays)
            .GreaterThanOrEqualTo(0).When(x => x.LeadTimeWorkingDays.HasValue)
            .WithMessage("Lead time cannot be negative.");

        RuleFor(x => x.Status)
            .Must(s => s == "Active" || s == "Inactive")
            .WithMessage("Status must be Active or Inactive.");
    }
}

