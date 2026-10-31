using FluentValidation;
using System.Text.RegularExpressions;
using ZerpPixelsCRM.Api.DTOs;

namespace ZerpPixelsCRM.Api.Validators;

public class CreateClientRequestValidator : AbstractValidator<CreateClientRequest>
{
    private static readonly Regex PhoneRegex = new Regex(@"^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,5}\)?[-.\s]?)?[\d-.\s]{6,20}$", RegexOptions.Compiled);

    public CreateClientRequestValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company / Customer Name is required.")
            .MaximumLength(200).WithMessage("Company name cannot exceed 200 characters.");

        RuleFor(x => x.ContactPerson)
            .MaximumLength(150).WithMessage("Contact person name cannot exceed 150 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone Number is required.")
            .MaximumLength(30).WithMessage("Phone number cannot exceed 30 characters.")
            .Must(IsValidPhone).WithMessage("Please enter a valid phone number format (e.g. 03001234567 or +923001234567).");

        RuleFor(x => x.Email)
            .MaximumLength(200).WithMessage("Email cannot exceed 200 characters.")
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email)).WithMessage("Please enter a valid email address.");

        RuleFor(x => x.Address)
            .MaximumLength(1000).WithMessage("Address cannot exceed 1000 characters.");
    }

    private bool IsValidPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        return PhoneRegex.IsMatch(phone.Trim());
    }
}

public class UpdateClientRequestValidator : AbstractValidator<UpdateClientRequest>
{
    private static readonly Regex PhoneRegex = new Regex(@"^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,5}\)?[-.\s]?)?[\d-.\s]{6,20}$", RegexOptions.Compiled);

    public UpdateClientRequestValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company / Customer Name is required.")
            .MaximumLength(200).WithMessage("Company name cannot exceed 200 characters.");

        RuleFor(x => x.ContactPerson)
            .MaximumLength(150).WithMessage("Contact person name cannot exceed 150 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone Number is required.")
            .MaximumLength(30).WithMessage("Phone number cannot exceed 30 characters.")
            .Must(IsValidPhone).WithMessage("Please enter a valid phone number format.");

        RuleFor(x => x.Email)
            .MaximumLength(200).WithMessage("Email cannot exceed 200 characters.")
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email)).WithMessage("Please enter a valid email address.");

        RuleFor(x => x.Address)
            .MaximumLength(1000).WithMessage("Address cannot exceed 1000 characters.");
    }

    private bool IsValidPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        return PhoneRegex.IsMatch(phone.Trim());
    }
}

