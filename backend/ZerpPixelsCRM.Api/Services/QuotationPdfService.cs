using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Services;

public class QuotationPdfService
{
    private static readonly string BrandPrimary = "#0099DD";
    private static readonly string TextDark = "#1E293B";
    private static readonly string TextMuted = "#64748B";
    private static readonly string BorderColor = "#E2E8F0";
    private static readonly string BgLight = "#F8FAFC";
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
            catch {}
        }
        return null;
    }

    static QuotationPdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateQuotationPdf(Quotation quotation, QuotationRevision revision)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(35, Unit.Point);
                page.DefaultTextStyle(x => x.FontFamily(Fonts.Arial).FontSize(9.5f).FontColor(TextDark));

                page.Header().Element(c => ComposeHeader(c, quotation, revision));
                page.Content().Element(c => ComposeContent(c, quotation, revision));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, Quotation quotation, QuotationRevision revision)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                // Left: Company Branding
                row.RelativeItem().Column(brandCol =>
                {
                    var logoBytes = GetLogoBytes();
                    if (logoBytes != null && logoBytes.Length > 0)
                    {
                        brandCol.Item().MaxWidth(185).Image(logoBytes);
                    }
                    else
                    {
                        brandCol.Item().Row(r =>
                        {
                            r.AutoItem().Text("Zero Pixel ").FontSize(20).Bold().FontColor(TextDark);
                            r.AutoItem().Background(BrandPrimary).PaddingVertical(2).PaddingHorizontal(6).Text("ERP").FontSize(11).Bold().FontColor(Colors.White);
                        });
                        brandCol.Item().PaddingTop(2).Text("Global Perspective, Local Expertise").FontSize(8.5f).FontColor(TextMuted);
                    }

                    brandCol.Item().PaddingTop(4).Text("Zero Pixel Printing & Digital Production").FontSize(8.5f).FontColor(TextDark);
                    brandCol.Item().Text("Lahore, Pakistan | info@zeropixel.pk | +92 300 1234567").FontSize(7.5f).FontColor(TextMuted);
                });

                // Right: Document Title & Metadata
                row.RelativeItem().AlignRight().Column(metaCol =>
                {
                    metaCol.Item().Text("QUOTATION").FontSize(22).Bold().FontColor(BrandPrimary);
                    metaCol.Item().PaddingTop(4).Row(r =>
                    {
                        r.AutoItem().Text("Quote #: ").Bold();
                        r.AutoItem().Text(quotation.QuotationNumber);
                    });
                    metaCol.Item().Row(r =>
                    {
                        r.AutoItem().Text("Revision: ").Bold();
                        r.AutoItem().Text($"Rev {revision.RevisionNumber}");
                    });
                    metaCol.Item().Row(r =>
                    {
                        r.AutoItem().Text("Date: ").Bold();
                        r.AutoItem().Text(revision.QuotationDate.ToString("dd MMM yyyy"));
                    });
                    metaCol.Item().Row(r =>
                    {
                        r.AutoItem().Text("Valid Until: ").Bold();
                        r.AutoItem().Text(revision.ValidUntil.ToString("dd MMM yyyy"));
                    });
                });
            });

            col.Item().PaddingVertical(10).LineHorizontal(1).LineColor(BorderColor);
        });
    }

    private void ComposeContent(IContainer container, Quotation quotation, QuotationRevision revision)
    {
        container.Column(col =>
        {
            // Customer Snapshot Box
            col.Item().Row(row =>
            {
                row.RelativeItem(3).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(10).Column(c =>
                {
                    c.Item().Text("QUOTATION FOR").FontSize(8).Bold().FontColor(BrandPrimary);
                    c.Item().PaddingTop(3).Text(quotation.CustomerName).FontSize(12).Bold().FontColor(TextDark);
                    if (!string.IsNullOrWhiteSpace(quotation.ContactPerson))
                    {
                        c.Item().Text($"Attention: {quotation.ContactPerson}").FontSize(9).FontColor(TextDark);
                    }
                    c.Item().Text($"Phone: {quotation.CustomerPhone}").FontSize(9).FontColor(TextDark);
                    if (!string.IsNullOrWhiteSpace(quotation.CustomerEmail))
                    {
                        c.Item().Text($"Email: {quotation.CustomerEmail}").FontSize(8.5f).FontColor(TextMuted);
                    }
                    if (!string.IsNullOrWhiteSpace(quotation.CustomerAddress))
                    {
                        c.Item().Text($"Address: {quotation.CustomerAddress}").FontSize(8.5f).FontColor(TextMuted);
                    }
                });

                row.Spacing(15);

                row.RelativeItem(2).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(10).Column(c =>
                {
                    c.Item().Text("PROJECT DETAILS").FontSize(8).Bold().FontColor(BrandPrimary);
                    c.Item().PaddingTop(3).Row(r =>
                    {
                        r.AutoItem().Text("Type: ").Bold().FontSize(8.5f);
                        r.AutoItem().Text(quotation.QuotationType).FontSize(8.5f);
                    });
                    c.Item().Row(r =>
                    {
                        r.AutoItem().Text("Currency: ").Bold().FontSize(8.5f);
                        r.AutoItem().Text(quotation.Currency).FontSize(8.5f);
                    });
                    c.Item().Row(r =>
                    {
                        r.AutoItem().Text("Total Items: ").Bold().FontSize(8.5f);
                        r.AutoItem().Text(revision.Items.Count.ToString()).FontSize(8.5f);
                    });
                });
            });

            col.Item().PaddingTop(15);

            // Items Table
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(25); // #
                    columns.RelativeColumn(3);  // Product & Description
                    columns.RelativeColumn(3);  // Specifications
                    columns.ConstantColumn(45); // Qty
                    columns.ConstantColumn(40); // Unit
                    columns.ConstantColumn(75); // Rate
                    columns.ConstantColumn(80); // Total
                });

                // Table Header
                table.Header(header =>
                {
                    header.Cell().Background(BrandPrimary).Padding(5).Text("#").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(5).Text("Product / Service").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(5).Text("Specifications").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(5).AlignRight().Text("Qty").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(5).AlignCenter().Text("Unit").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(5).AlignRight().Text("Rate (PKR)").Bold().FontColor(Colors.White);
                    header.Cell().Background(BrandPrimary).Padding(5).AlignRight().Text("Total (PKR)").Bold().FontColor(Colors.White);
                });

                // Table Rows
                int index = 1;
                foreach (var item in revision.Items.OrderBy(i => i.SortOrder).ThenBy(i => i.ItemId))
                {
                    var bg = index % 2 == 0 ? BgLight : "#FFFFFF";

                    table.Cell().Background(bg).Padding(5).Text(index.ToString());
                    table.Cell().Background(bg).Padding(5).Column(pc =>
                    {
                        pc.Item().Text(item.ProductName).Bold();
                        if (!string.IsNullOrWhiteSpace(item.ServiceCategory))
                        {
                            pc.Item().Text($"Service: {item.ServiceCategory}").FontSize(7.5f).Bold().FontColor(BrandPrimary);
                        }
                        if (!string.IsNullOrWhiteSpace(item.Description))
                        {
                            pc.Item().Text(item.Description).FontSize(8).FontColor(TextMuted);
                        }
                    });

                    // Build Specs string
                    table.Cell().Background(bg).Padding(5).Column(sc =>
                    {
                        if (!string.IsNullOrWhiteSpace(item.ServiceCategory))
                        {
                            sc.Item().Text(item.ServiceCategory).FontSize(8).Bold().FontColor(BrandPrimary);

                            if (!string.IsNullOrWhiteSpace(item.ServiceDetails))
                            {
                                try
                                {
                                    using var jsonDoc = System.Text.Json.JsonDocument.Parse(item.ServiceDetails);
                                    var root = jsonDoc.RootElement;

                                    if (item.ServiceCategory == "Website" || item.ServiceCategory.Contains("Web", StringComparison.OrdinalIgnoreCase))
                                    {
                                        if (root.TryGetProperty("pagesCount", out var pages))
                                        {
                                            sc.Item().Text($"Pages: {pages}").FontSize(7.5f).Bold();
                                        }
                                    }
                                    else if (item.ServiceCategory == "Marketing")
                                    {
                                        var mktSpecs = new List<string>();
                                        if (root.TryGetProperty("postsCount", out var posts) && posts.GetInt32() > 0)
                                            mktSpecs.Add($"{posts} Posts");
                                        if (root.TryGetProperty("videoCount", out var vids) && vids.GetInt32() > 0)
                                            mktSpecs.Add($"{vids} Videos");
                                        if (mktSpecs.Count > 0)
                                            sc.Item().Text(string.Join(" | ", mktSpecs)).FontSize(7.5f).Bold();
                                    }
                                }
                                catch
                                {
                                    // ignore JSON parse errors in PDF rendering
                                }
                            }

                            if (!string.IsNullOrWhiteSpace(item.Description))
                            {
                                sc.Item().Text(item.Description).FontSize(7.5f).FontColor(TextMuted);
                            }
                            return;
                        }

                        var specs = new List<string>();
                        if (!string.IsNullOrWhiteSpace(item.SizeDimensions)) specs.Add($"Size: {item.SizeDimensions}");
                        if (!string.IsNullOrWhiteSpace(item.Material)) specs.Add($"Material: {item.Material}");
                        if (!string.IsNullOrWhiteSpace(item.Gsm)) specs.Add($"GSM: {item.Gsm}");
                        if (!string.IsNullOrWhiteSpace(item.PrintingColor)) specs.Add($"Color: {item.PrintingColor}");
                        if (!string.IsNullOrWhiteSpace(item.Finishing)) specs.Add($"Finish: {item.Finishing}");

                        if (specs.Count > 0)
                        {
                            sc.Item().Text(string.Join(" | ", specs)).FontSize(8);
                        }
                        else
                        {
                            sc.Item().Text("Standard").FontSize(8).FontColor(TextMuted);
                        }
                    });

                    table.Cell().Background(bg).Padding(5).AlignRight().Text(item.Quantity.ToString("N0"));
                    table.Cell().Background(bg).Padding(5).AlignCenter().Text(item.Unit);
                    table.Cell().Background(bg).Padding(5).AlignRight().Text(item.UnitPrice.ToString("N2"));
                    table.Cell().Background(bg).Padding(5).AlignRight().Text(item.LineTotal.ToString("N2")).Bold();

                    index++;
                }
            });

            col.Item().PaddingTop(12);

            // Financial Summary Section (Right-aligned)
            col.Item().Row(row =>
            {
                // Left: Notes / Terms
                row.RelativeItem(3).Column(notesCol =>
                {
                    if (!string.IsNullOrWhiteSpace(revision.CustomerNotes))
                    {
                        notesCol.Item().Text("Customer Notes:").Bold().FontSize(8.5f);
                        notesCol.Item().PaddingTop(2).Text(revision.CustomerNotes).FontSize(8).FontColor(TextMuted);
                    }

                    notesCol.Item().PaddingTop(6).Text("Terms & Conditions:").Bold().FontSize(8.5f);
                    var terms = !string.IsNullOrWhiteSpace(revision.TermsAndConditions)
                        ? revision.TermsAndConditions
                        : "1. 50% advance payment required upon quotation approval.\n2. Delivery timeline starts after sample approval.\n3. Quotation is valid until the specified date above.";
                    notesCol.Item().PaddingTop(2).Text(terms).FontSize(8).FontColor(TextMuted);
                });

                row.Spacing(20);

                // Right: Financials
                row.RelativeItem(2).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(8).Column(calcCol =>
                {
                    calcCol.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Subtotal:").FontSize(9);
                        r.RelativeItem().AlignRight().Text($"{quotation.Currency} {revision.Subtotal:N2}").FontSize(9);
                    });

                    if (revision.DiscountAmount > 0)
                    {
                        calcCol.Item().PaddingTop(3).Row(r =>
                        {
                            var discLabel = revision.DiscountType == "Percentage"
                                ? $"Discount ({revision.DiscountValue:0.##}%):"
                                : "Discount (Fixed):";
                            r.RelativeItem().Text(discLabel).FontSize(9).FontColor(Colors.Red.Darken2);
                            r.RelativeItem().AlignRight().Text($"-{quotation.Currency} {revision.DiscountAmount:N2}").FontSize(9).FontColor(Colors.Red.Darken2);
                        });
                    }

                    if (revision.TaxRate > 0)
                    {
                        calcCol.Item().PaddingTop(3).Row(r =>
                        {
                            r.RelativeItem().Text($"Tax ({revision.TaxRate:0.##}%):").FontSize(9);
                            r.RelativeItem().AlignRight().Text($"+{quotation.Currency} {revision.TaxAmount:N2}").FontSize(9);
                        });
                    }

                    calcCol.Item().PaddingVertical(4).LineHorizontal(1).LineColor(BorderColor);

                    calcCol.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Grand Total:").FontSize(11).Bold().FontColor(BrandPrimary);
                        r.RelativeItem().AlignRight().Text($"{quotation.Currency} {revision.GrandTotal:N2}").FontSize(12).Bold().FontColor(BrandPrimary);
                    });
                });
            });
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(1).LineColor(BorderColor);
            col.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text("Thank you for your business! Zero Pixel ERP").FontSize(7.5f).FontColor(TextMuted);
                row.RelativeItem().AlignRight().Text(text =>
                {
                    text.Span("Page ").FontSize(7.5f).FontColor(TextMuted);
                    text.CurrentPageNumber().FontSize(7.5f).FontColor(TextMuted);
                    text.Span(" of ").FontSize(7.5f).FontColor(TextMuted);
                    text.TotalPages().FontSize(7.5f).FontColor(TextMuted);
                });
            });
        });
    }
}
