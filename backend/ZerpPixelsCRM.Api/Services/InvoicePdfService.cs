using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Services;

public class InvoicePdfService
{
    private static readonly string BrandPrimary = "#0284C7"; // Professional Printing Cyan/Blue
    private static readonly string BrandDark = "#0F172A";    // Slate Dark
    private static readonly string TextDark = "#1E293B";
    private static readonly string TextMuted = "#64748B";
    private static readonly string BorderColor = "#CBD5E1";
    private static readonly string BgLight = "#F8FAFC";
    private static readonly string SuccessGreen = "#15803D";
    private static byte[]? _cachedLogoBytes;

    private static byte[]? GetLogoBytes()
    {
        if (_cachedLogoBytes != null) return _cachedLogoBytes;

        var paths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "zeropixel_logo.png"),
            Path.Combine(Directory.GetCurrentDirectory(), "Assets", "zeropixel_logo.png"),
            Path.Combine(Directory.GetCurrentDirectory(), "backend", "ZerpPixelsCRM.Api", "Assets", "zeropixel_logo.png"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "Assets", "zeropixel_logo.png")
        };

        foreach (var p in paths)
        {
            try
            {
                if (File.Exists(p))
                {
                    _cachedLogoBytes = File.ReadAllBytes(p);
                    return _cachedLogoBytes;
                }
            }
            catch { }
        }
        return null;
    }

    private static byte[]? GetStampBytes()
    {
        var file = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "zeropixel_stamp_bank.png");
        if (File.Exists(file)) return File.ReadAllBytes(file);
        var fallback = Path.Combine(Directory.GetCurrentDirectory(), "backend", "ZerpPixelsCRM.Api", "Assets", "zeropixel_stamp_bank.png");
        if (File.Exists(fallback)) return File.ReadAllBytes(fallback);
        return null;
    }

    static InvoicePdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateInvoicePdf(Invoice invoice)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32, Unit.Point);
                page.DefaultTextStyle(x => x.FontFamily(Fonts.Arial).FontSize(9.5f).FontColor(TextDark));

                page.Header().Element(c => ComposeHeader(c, invoice));
                page.Content().Element(c => ComposeContent(c, invoice));
                page.Footer().Element(c => ComposeFooter(c, invoice));
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, Invoice invoice)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                // Left: Company Branding
                row.RelativeItem(3).Column(brandCol =>
                {
                    var logoBytes = GetLogoBytes();
                    if (logoBytes != null && logoBytes.Length > 0)
                    {
                        brandCol.Item().MaxWidth(180).Image(logoBytes);
                    }
                    else
                    {
                        brandCol.Item().Row(r =>
                        {
                            r.AutoItem().Text("Zero Pixel ").FontSize(20).Bold().FontColor(BrandDark);
                            r.AutoItem().Background(BrandPrimary).PaddingVertical(2).PaddingHorizontal(6).Text("ERP").FontSize(11).Bold().FontColor(Colors.White);
                        });
                        brandCol.Item().PaddingTop(2).Text("Global Perspective, Local Expertise").FontSize(8.5f).FontColor(TextMuted);
                    }
                });

                // Right: Document Title & Invoice Meta
                row.RelativeItem(2).AlignRight().Column(metaCol =>
                {
                    metaCol.Item().Text("INVOICE").FontSize(24).ExtraBold().FontColor(BrandPrimary);

                    metaCol.Item().PaddingTop(4).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(8).Column(box =>
                    {
                        box.Item().Row(r =>
                        {
                            r.ConstantItem(62).Text("Invoice No:").Bold().FontSize(9f);
                            r.RelativeItem().Text(invoice.InvoiceNumber).Bold().FontSize(9.5f).FontColor(BrandPrimary);
                        });
                        box.Item().PaddingTop(2).Row(r =>
                        {
                            r.ConstantItem(62).Text("Date#:").Bold().FontSize(9f);
                            r.RelativeItem().Text(invoice.InvoiceDate.ToString("MMM dd, yyyy")).FontSize(9f);
                        });
                        box.Item().PaddingTop(2).Row(r =>
                        {
                            r.ConstantItem(62).Text("NTN#:").Bold().FontSize(9f);
                            r.RelativeItem().Text(string.IsNullOrWhiteSpace(invoice.NtnNumber) ? "" : invoice.NtnNumber).FontSize(9f);
                        });
                    });
                });
            });

            col.Item().PaddingTop(10).LineHorizontal(1).LineColor(BorderColor);
        });
    }

    private void ComposeContent(IContainer container, Invoice invoice)
    {
        container.Column(col =>
        {
            col.Item().PaddingTop(10);

            // Billed To (Customer Snapshot)
            col.Item().Border(1).BorderColor(BorderColor).Background(BgLight).Padding(10).Row(row =>
            {
                row.RelativeItem(3).Column(custCol =>
                {
                    custCol.Item().Text("CUSTOMER:").FontSize(8f).Bold().FontColor(BrandPrimary);
                    custCol.Item().PaddingTop(2).Text(invoice.CustomerName).FontSize(10.5f).Bold().FontColor(BrandDark);

                    if (!string.IsNullOrWhiteSpace(invoice.CompanyName) && invoice.CompanyName != invoice.CustomerName)
                    {
                        custCol.Item().Text(invoice.CompanyName).FontSize(9f).FontColor(TextMuted);
                    }

                    if (!string.IsNullOrWhiteSpace(invoice.BillingAddress))
                    {
                        custCol.Item().PaddingTop(2).Text(invoice.BillingAddress).FontSize(8.5f).FontColor(TextDark);
                    }
                });

                row.RelativeItem(2).AlignRight().Column(contactCol =>
                {
                    contactCol.Item().Row(r =>
                    {
                        r.AutoItem().Text("Client' PO#: ").FontSize(8.5f).Bold();
                        r.AutoItem().Text(string.IsNullOrWhiteSpace(invoice.ClientPoNumber) ? "" : invoice.ClientPoNumber).FontSize(8.5f);
                    });

                    if (!string.IsNullOrWhiteSpace(invoice.ContactNumber))
                    {
                        contactCol.Item().PaddingTop(2).Row(r =>
                        {
                            r.AutoItem().Text("Phone: ").FontSize(8.5f).Bold();
                            r.AutoItem().Text(invoice.ContactNumber).FontSize(8.5f);
                        });
                    }

                    if (!string.IsNullOrWhiteSpace(invoice.Email))
                    {
                        contactCol.Item().PaddingTop(2).Row(r =>
                        {
                            r.AutoItem().Text("Email: ").FontSize(8.5f).Bold();
                            r.AutoItem().Text(invoice.Email).FontSize(8.5f);
                        });
                    }
                });
            });

            col.Item().PaddingTop(12);

            // Items Table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(35); // Sr No
                    columns.ConstantColumn(85); // GR No
                    columns.RelativeColumn(4);  // Description
                    columns.ConstantColumn(65); // Quantity
                    columns.ConstantColumn(75); // Rate
                    columns.ConstantColumn(85); // Amount
                });

                // Table Header
                table.Header(header =>
                {
                    header.Cell().Background(BrandPrimary).Padding(6).AlignCenter().Text("Sr No").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(6).Text("GR No").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(6).Text("Description").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(6).AlignRight().Text("Quantity").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(6).AlignRight().Text("Rate (PKR)").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(6).AlignRight().Text("Amount (PKR)").Bold().FontColor(Colors.White);
                });

                // Table Rows
                var items = invoice.Items?.OrderBy(i => i.SerialNumber).ToList() ?? new List<InvoiceItem>();
                int index = 1;
                foreach (var item in items)
                {
                    var bg = index % 2 == 0 ? BgLight : "#FFFFFF";

                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(6).AlignCenter().Text(index.ToString()).FontSize(8.5f);
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(6).Text(item.GrNumber ?? "—").FontSize(8.5f);
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(6).Text(item.Description).FontSize(9f);
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(6).AlignRight().Text(item.Quantity.ToString("N0")).FontSize(8.5f);
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(6).AlignRight().Text(item.Rate.ToString("N2")).FontSize(8.5f);
                    table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(6).AlignRight().Text(item.Amount.ToString("N2")).FontSize(9f).Bold();

                    index++;
                }
            });

            col.Item().PaddingTop(12);

            // Bottom Section: Notes & Totals
            col.Item().Row(row =>
            {
                // Left: Notes / Terms
                row.RelativeItem(3).Column(notesCol =>
                {
                    notesCol.Item().Text("Payment Terms & Notes:").Bold().FontSize(8.5f);
                    var defaultBankNotes = "Bank Details: Title Name: ZEROPIXEL Bank: Bank Islami IBAN:PK16BKIP0201515856490001 Account # 201515856490001";
                    if (!string.IsNullOrWhiteSpace(invoice.Notes) && !invoice.Notes.StartsWith("Test commercial") && invoice.Notes.Trim() != defaultBankNotes)
                    {
                        notesCol.Item().PaddingTop(4).Text(invoice.Notes).FontSize(8f).FontColor(TextMuted);
                    }
                });

                row.Spacing(20);

                // Right: Totals Box
                row.RelativeItem(2).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(8).Column(calcCol =>
                {
                    calcCol.Item().Row(r =>
                    {
                        r.RelativeItem().Text("TOTAL:").FontSize(9f).Bold();
                        r.RelativeItem().AlignRight().Text($"Rs. {invoice.Total:N2}").FontSize(9.5f).Bold();
                    });

                    calcCol.Item().PaddingTop(4).Row(r =>
                    {
                        r.RelativeItem().Text(GetAdjustmentLabel(invoice)).FontSize(9f);
                        r.RelativeItem().AlignRight().Text($"Rs. {invoice.Advance:N2}").FontSize(9f);
                    });

                    calcCol.Item().PaddingVertical(4).LineHorizontal(1).LineColor(BorderColor);

                    calcCol.Item().Row(r =>
                    {
                        r.RelativeItem().Text("BALANCE:").FontSize(10.5f).ExtraBold().FontColor(BrandDark);
                        r.RelativeItem().AlignRight().Text($"Rs. {invoice.Balance:N2}").FontSize(11f).ExtraBold().FontColor(SuccessGreen);
                    });
                });
            });
        });
    }

    private static string GetAdjustmentLabel(Invoice invoice)
    {
        var type = (invoice.AdjustmentType ?? "advance").Trim().ToLowerInvariant();
        return type switch
        {
            "tax_amount" => "TAX:",
            "tax_percent" => invoice.AdjustmentRate.HasValue
                ? $"TAX ({invoice.AdjustmentRate.Value:0.##}%):"
                : "TAX:",
            "percent_off" => invoice.AdjustmentRate.HasValue
                ? $"DISCOUNT ({invoice.AdjustmentRate.Value:0.##}% OFF):"
                : "DISCOUNT:",
            _ => "ADVANCE:"
        };
    }

    private void ComposeFooter(IContainer container, Invoice invoice)
    {
        container.Column(col =>
        {
            var stampBankBytes = GetStampBytes();
            if (stampBankBytes != null && stampBankBytes.Length > 0)
            {
                col.Item().AlignLeft().MaxWidth(175).Image(stampBankBytes);
            }

            col.Item().PaddingTop(4).LineHorizontal(1).LineColor(BorderColor);
            col.Item().PaddingTop(4).Text("This signature is valid for this digitally generated invoice only and is not authorized for any other use.").Bold().FontSize(8.5f).FontColor(BrandDark);
        });
    }
}

