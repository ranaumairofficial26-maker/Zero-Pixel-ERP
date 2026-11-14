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
                            r.ConstantItem(62).Text("Date:").Bold().FontSize(9f);
                            r.RelativeItem().Text(invoice.InvoiceDate.ToString("MMM dd, yyyy")).FontSize(9f);
                        });
                        box.Item().PaddingTop(2).Row(r =>
                        {
                            r.ConstantItem(62).Text("NTN:").Bold().FontSize(9f);
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
                        r.AutoItem().Text("Client' PO: ").FontSize(8.5f).Bold();
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

                // Right: Totals Box (+ Optional Previous Balance Box)
                row.RelativeItem(2).Column(rightCol =>
                {
                    rightCol.Item().Border(1).BorderColor(BorderColor).Background(BgLight).Padding(8).Column(calcCol =>
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

                    if (invoice.PreviousBalance.HasValue && invoice.PreviousBalance.Value > 0)
                    {
                        var totalBalance = Math.Round(invoice.Balance + invoice.PreviousBalance.Value, 2);
                        rightCol.Item().PaddingTop(6).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(8).Column(prevCol =>
                        {
                            prevCol.Item().Row(r =>
                            {
                                r.RelativeItem().Text("PREVIOUS BALANCE:").FontSize(8.5f).Bold();
                                r.RelativeItem().AlignRight().Text($"Rs. {invoice.PreviousBalance.Value:N2}").FontSize(9f).Bold();
                            });

                            prevCol.Item().PaddingVertical(4).LineHorizontal(1).LineColor(BorderColor);

                            prevCol.Item().Row(r =>
                            {
                                r.RelativeItem().Text("TOTAL BALANCE:").FontSize(10.5f).ExtraBold().FontColor(BrandDark);
                                r.RelativeItem().AlignRight().Text($"Rs. {totalBalance:N2}").FontSize(11f).ExtraBold().FontColor(BrandPrimary);
                            });
                        });
                    }
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

    public byte[] GenerateInvoicesReportPdf(List<Invoice> invoices, string? period, string? search, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var normalizedPeriod = string.IsNullOrWhiteSpace(period) ? "all" : period.Trim().ToLowerInvariant();
        var today = DateTime.UtcNow.Date;
        string periodTitle;
        string periodRange;

        if (fromDate.HasValue || toDate.HasValue)
        {
            periodTitle = "CUSTOM DATE RANGE REPORT";
            if (fromDate.HasValue && toDate.HasValue)
            {
                periodRange = $"{fromDate.Value:MMM dd, yyyy} - {toDate.Value:MMM dd, yyyy}";
            }
            else if (fromDate.HasValue)
            {
                periodRange = $"From {fromDate.Value:MMM dd, yyyy}";
            }
            else
            {
                periodRange = $"Up to {toDate!.Value:MMM dd, yyyy}";
            }
        }
        else
        {
            (periodTitle, periodRange) = normalizedPeriod switch
            {
                "daily" => ("DAILY INVOICE REPORT", today.ToString("MMM dd, yyyy")),
                "weekly" => ("WEEKLY INVOICE REPORT", $"{today.AddDays(-6):MMM dd, yyyy} - {today:MMM dd, yyyy}"),
                "monthly" => ("MONTHLY INVOICE REPORT", $"{new DateTime(today.Year, today.Month, 1):MMM dd, yyyy} - {today:MMM dd, yyyy}"),
                "yearly" => ("YEARLY INVOICE REPORT", $"{new DateTime(today.Year, 1, 1):MMM dd, yyyy} - {today:MMM dd, yyyy}"),
                _ => ("ALL INVOICES REPORT", "All Dates")
            };
        }

        var totalAmount = invoices.Sum(i => i.Total);
        var totalBalance = invoices.Sum(i => i.Balance);
        var totalPreviousBalance = invoices.Sum(i => i.PreviousBalance ?? 0m);
        var grandTotalBalance = totalBalance + totalPreviousBalance;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(28);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Arial).FontColor(TextDark));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem(3).Column(brandCol =>
                        {
                            var logoBytes = GetLogoBytes();
                            if (logoBytes != null && logoBytes.Length > 0)
                            {
                                brandCol.Item().MaxWidth(150).Image(logoBytes);
                            }
                            else
                            {
                                brandCol.Item().Text("ZERO PIXEL").FontSize(16).Bold().FontColor(BrandDark);
                            }
                        });

                        row.RelativeItem(3).AlignRight().Column(metaCol =>
                        {
                            metaCol.Item().Text(periodTitle).FontSize(17).ExtraBold().FontColor(BrandPrimary);
                            metaCol.Item().Text($"Period: {periodRange}  |  Invoices: {invoices.Count}").FontSize(9).Bold();
                            if (!string.IsNullOrWhiteSpace(search))
                            {
                                metaCol.Item().Text($"Search Filter: \"{search.Trim()}\"").FontSize(8.5f).FontColor(TextMuted);
                            }
                            metaCol.Item().Text($"Generated: {DateTime.Now:MMM dd, yyyy hh:mm tt}").FontSize(8).FontColor(TextMuted);
                        });
                    });

                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor(BorderColor);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    if (invoices.Count == 0)
                    {
                        col.Item().Padding(24).Border(1).BorderColor(BorderColor).Background(BgLight).AlignCenter()
                            .Text("No invoices found for the selected period.").FontSize(11).FontColor(TextMuted);
                    }
                    else
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(28);      // Sr
                                columns.ConstantColumn(95);      // Invoice #
                                columns.ConstantColumn(72);      // Date
                                columns.RelativeColumn(1.4f);    // Customer
                                columns.RelativeColumn(1.8f);    // Items Summary
                                columns.ConstantColumn(80);      // Total
                                columns.ConstantColumn(80);      // Adj / Tax
                                columns.ConstantColumn(85);      // Balance
                                columns.ConstantColumn(80);      // Prev Bal
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background(BrandDark).Padding(6).Text("#").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).Text("INVOICE #").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).Text("DATE").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).Text("CUSTOMER").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).Text("ITEMS / DETAILS").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).AlignRight().Text("TOTAL").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).AlignRight().Text("ADJ / TAX").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).AlignRight().Text("BALANCE").FontColor(Colors.White).Bold().FontSize(8);
                                header.Cell().Background(BrandDark).Padding(6).AlignRight().Text("PREV. BAL").FontColor(Colors.White).Bold().FontSize(8);
                            });

                            int sr = 1;
                            foreach (var inv in invoices)
                            {
                                var bg = sr % 2 == 0 ? BgLight : "#FFFFFF";
                                var itemSummary = inv.Items != null && inv.Items.Count > 0
                                    ? string.Join(", ", inv.Items.OrderBy(x => x.SerialNumber).Select(x => $"{x.Description} ({x.Quantity:0.##})"))
                                    : "—";
                                var custText = string.IsNullOrWhiteSpace(inv.ClientPoNumber)
                                    ? inv.CustomerName
                                    : $"{inv.CustomerName} (PO: {inv.ClientPoNumber})";

                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).Text(sr.ToString()).FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).Text(inv.InvoiceNumber).Bold().FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).Text(inv.InvoiceDate.ToString("dd MMM yyyy")).FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).Text(custText).FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).Text(itemSummary).FontSize(7.5f).FontColor(TextMuted);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).AlignRight().Text($"Rs. {inv.Total:N2}").FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).AlignRight().Text($"Rs. {inv.Advance:N2}").FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).AlignRight().Text($"Rs. {inv.Balance:N2}").Bold().FontSize(8);
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor(BorderColor).Padding(5).AlignRight().Text(inv.PreviousBalance.HasValue && inv.PreviousBalance.Value > 0 ? $"Rs. {inv.PreviousBalance.Value:N2}" : "—").FontSize(8);

                                sr++;
                            }
                        });

                        col.Item().PaddingTop(12).AlignRight().Width(280).Border(1).BorderColor(BorderColor).Background(BgLight).Padding(10).Column(sumCol =>
                        {
                            sumCol.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Total Invoices:").FontSize(9).Bold();
                                r.RelativeItem().AlignRight().Text(invoices.Count.ToString()).FontSize(9).Bold();
                            });
                            sumCol.Item().PaddingTop(3).Row(r =>
                            {
                                r.RelativeItem().Text("Total Amount:").FontSize(9);
                                r.RelativeItem().AlignRight().Text($"Rs. {totalAmount:N2}").FontSize(9).Bold();
                            });
                            sumCol.Item().PaddingTop(3).Row(r =>
                            {
                                r.RelativeItem().Text("Total Balance:").FontSize(9);
                                r.RelativeItem().AlignRight().Text($"Rs. {totalBalance:N2}").FontSize(9).Bold();
                            });
                            if (totalPreviousBalance > 0)
                            {
                                sumCol.Item().PaddingTop(3).Row(r =>
                                {
                                    r.RelativeItem().Text("Total Previous Balance:").FontSize(9);
                                    r.RelativeItem().AlignRight().Text($"Rs. {totalPreviousBalance:N2}").FontSize(9).Bold();
                                });
                            }
                            sumCol.Item().PaddingVertical(4).LineHorizontal(1).LineColor(BorderColor);
                            sumCol.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Grand Total Balance:").FontSize(10).ExtraBold().FontColor(BrandDark);
                                r.RelativeItem().AlignRight().Text($"Rs. {grandTotalBalance:N2}").FontSize(10.5f).ExtraBold().FontColor(BrandPrimary);
                            });
                        });
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Zero Pixel ERP — Invoice Report  |  Page ").FontSize(8).FontColor(TextMuted);
                    x.CurrentPageNumber().FontSize(8).FontColor(TextMuted);
                    x.Span(" of ").FontSize(8).FontColor(TextMuted);
                    x.TotalPages().FontSize(8).FontColor(TextMuted);
                });
            });
        });

        return document.GeneratePdf();
    }
}

