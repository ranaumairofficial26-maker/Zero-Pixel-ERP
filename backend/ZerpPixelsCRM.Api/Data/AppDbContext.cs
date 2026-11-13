using Microsoft.EntityFrameworkCore;
using ZerpPixelsCRM.Api.Entities;

namespace ZerpPixelsCRM.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationRevision> QuotationRevisions => Set<QuotationRevision>();
    public DbSet<QuotationItem> QuotationItems => Set<QuotationItem>();
    public DbSet<QuotationSendLog> QuotationSendLogs => Set<QuotationSendLog>();
    public DbSet<QuotationApprovalLog> QuotationApprovalLogs => Set<QuotationApprovalLog>();
    public DbSet<PrintingOrder> PrintingOrders => Set<PrintingOrder>();
    public DbSet<PrintingOrderItem> PrintingOrderItems => Set<PrintingOrderItem>();
    public DbSet<ProductionJob> ProductionJobs => Set<ProductionJob>();
    public DbSet<ProductionJobItem> ProductionJobItems => Set<ProductionJobItem>();
    public DbSet<ProductionJobSheet> ProductionJobSheets => Set<ProductionJobSheet>();
    public DbSet<PrintingCategory> PrintingCategories => Set<PrintingCategory>();
    public DbSet<PrintingItem> PrintingItems => Set<PrintingItem>();
    public DbSet<PaperSize> PaperSizes => Set<PaperSize>();
    public DbSet<PrintingSize> PrintingSizes => Set<PrintingSize>();
    public DbSet<PrintingItemSize> PrintingItemSizes => Set<PrintingItemSize>();
    public DbSet<PrintingMaterial> PrintingMaterials => Set<PrintingMaterial>();
    public DbSet<CostCategory> CostCategories => Set<CostCategory>();
    public DbSet<PrintingMachineRate> PrintingMachineRates => Set<PrintingMachineRate>();
    public DbSet<PrintingCostEstimate> PrintingCostEstimates => Set<PrintingCostEstimate>();
    public DbSet<EstimateQuantity> EstimateQuantities => Set<EstimateQuantity>();
    public DbSet<EstimateCostItem> EstimateCostItems => Set<EstimateCostItem>();
    public DbSet<EstimateResult> EstimateResults => Set<EstimateResult>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<SupplierServiceItem> SupplierServices => Set<SupplierServiceItem>();
    public DbSet<SupplierQuote> SupplierQuotes => Set<SupplierQuote>();
    public DbSet<SupplierQuoteItem> SupplierQuoteItems => Set<SupplierQuoteItem>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<SupplierBill> SupplierBills => Set<SupplierBill>();
    public DbSet<SupplierBillItem> SupplierBillItems => Set<SupplierBillItem>();
    public DbSet<SupplierPayment> SupplierPayments => Set<SupplierPayment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Configure Client entity
        modelBuilder.Entity<Client>(entity =>
        {
            entity.ToTable("clients");

            entity.HasKey(e => e.ClientId);

            entity.Property(e => e.ClientId)
                  .HasColumnName("client_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.CompanyName)
                  .HasColumnName("company_name")
                  .HasMaxLength(200)
                  .IsRequired();

            entity.Property(e => e.ContactPerson)
                  .HasColumnName("contact_person")
                  .HasMaxLength(150);

            entity.Property(e => e.Phone)
                  .HasColumnName("phone")
                  .HasMaxLength(30)
                  .IsRequired();

            entity.Property(e => e.Email)
                  .HasColumnName("email")
                  .HasMaxLength(200);

            entity.Property(e => e.Address)
                  .HasColumnName("address")
                  .HasColumnType("text");

            entity.Property(e => e.IsActive)
                  .HasColumnName("is_active")
                  .HasDefaultValue(true)
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.UpdatedAt)
                  .HasColumnName("updated_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.DeletedAt)
                  .HasColumnName("deleted_at")
                  .HasColumnType("timestamptz");

            entity.HasIndex(e => e.CompanyName, "IX_clients_company_name");
            entity.HasIndex(e => e.Phone, "IX_clients_phone");
            entity.HasIndex(e => e.DeletedAt, "IX_clients_deleted_at");
            entity.HasIndex(e => e.IsActive, "IX_clients_is_active");
        });

        // 2. Configure AdminUser entity
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.ToTable("admin_users");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .HasColumnName("user_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.Email)
                  .HasColumnName("email")
                  .HasMaxLength(150)
                  .IsRequired();

            entity.HasIndex(e => e.Email, "IX_admin_users_email").IsUnique();

            entity.Property(e => e.PasswordHash)
                  .HasColumnName("password_hash")
                  .HasMaxLength(255)
                  .IsRequired();

            entity.Property(e => e.FullName)
                  .HasColumnName("full_name")
                  .HasMaxLength(150)
                  .IsRequired();

            entity.Property(e => e.Role)
                  .HasColumnName("role")
                  .HasMaxLength(50)
                  .HasDefaultValue("Admin")
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.UpdatedAt)
                  .HasColumnName("updated_at")
                  .HasColumnType("timestamptz")
                  .HasDefaultValueSql("CURRENT_TIMESTAMP")
                  .IsRequired();
        });

        // 3. Configure Quotation entity
        modelBuilder.Entity<Quotation>(entity =>
        {
            entity.ToTable("quotations");

            entity.HasKey(e => e.QuotationId);

            entity.Property(e => e.QuotationId)
                  .HasColumnName("quotation_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.QuotationNumber)
                  .HasColumnName("quotation_number")
                  .HasMaxLength(50)
                  .IsRequired();

            entity.HasIndex(e => e.QuotationNumber, "IX_quotations_quotation_number").IsUnique();

            entity.Property(e => e.ClientId)
                  .HasColumnName("client_id");

            entity.HasIndex(e => e.ClientId, "IX_quotations_client_id");

            entity.Property(e => e.CustomerName)
                  .HasColumnName("customer_name")
                  .HasMaxLength(200)
                  .IsRequired();

            entity.HasIndex(e => e.CustomerName, "IX_quotations_customer_name");

            entity.Property(e => e.ContactPerson)
                  .HasColumnName("contact_person")
                  .HasMaxLength(150);

            entity.Property(e => e.CustomerPhone)
                  .HasColumnName("customer_phone")
                  .HasMaxLength(30)
                  .IsRequired();

            entity.Property(e => e.CustomerEmail)
                  .HasColumnName("customer_email")
                  .HasMaxLength(200);

            entity.Property(e => e.CustomerAddress)
                  .HasColumnName("customer_address")
                  .HasColumnType("text");

            entity.Property(e => e.QuotationType)
                  .HasColumnName("quotation_type")
                  .HasMaxLength(30)
                  .HasDefaultValue("Printing")
                  .IsRequired();

            entity.Property(e => e.Currency)
                  .HasColumnName("currency")
                  .HasMaxLength(3)
                  .HasDefaultValue("PKR")
                  .IsRequired();

            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.UpdatedAt)
                  .HasColumnName("updated_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.DeletedAt)
                  .HasColumnName("deleted_at")
                  .HasColumnType("timestamptz");

            entity.HasIndex(e => e.DeletedAt, "IX_quotations_deleted_at");

            entity.HasMany(e => e.Revisions)
                  .WithOne(r => r.Quotation)
                  .HasForeignKey(r => r.QuotationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 4. Configure QuotationRevision entity
        modelBuilder.Entity<QuotationRevision>(entity =>
        {
            entity.ToTable("quotation_revisions");

            entity.HasKey(e => e.RevisionId);

            entity.Property(e => e.RevisionId)
                  .HasColumnName("revision_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.QuotationId)
                  .HasColumnName("quotation_id")
                  .IsRequired();

            entity.HasIndex(e => e.QuotationId, "IX_quotation_revisions_quotation_id");

            entity.Property(e => e.RevisionNumber)
                  .HasColumnName("revision_number")
                  .IsRequired();

            // Unique composite index: 1 revision per revision number per quotation
            entity.HasIndex(e => new { e.QuotationId, e.RevisionNumber }, "IX_quotation_revisions_quote_rev").IsUnique();

            entity.Property(e => e.Status)
                  .HasColumnName("status")
                  .HasMaxLength(30)
                  .HasDefaultValue("Draft")
                  .IsRequired();

            entity.HasIndex(e => e.Status, "IX_quotation_revisions_status");

            entity.Property(e => e.QuotationDate)
                  .HasColumnName("quotation_date")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.HasIndex(e => e.QuotationDate, "IX_quotation_revisions_date");

            entity.Property(e => e.ValidUntil)
                  .HasColumnName("valid_until")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.Subtotal)
                  .HasColumnName("subtotal")
                  .HasColumnType("numeric(18,2)")
                  .IsRequired();

            entity.Property(e => e.DiscountType)
                  .HasColumnName("discount_type")
                  .HasMaxLength(20)
                  .HasDefaultValue("None")
                  .IsRequired();

            entity.Property(e => e.DiscountValue)
                  .HasColumnName("discount_value")
                  .HasColumnType("numeric(18,2)")
                  .HasDefaultValue(0m)
                  .IsRequired();

            entity.Property(e => e.DiscountAmount)
                  .HasColumnName("discount_amount")
                  .HasColumnType("numeric(18,2)")
                  .HasDefaultValue(0m)
                  .IsRequired();

            entity.Property(e => e.TaxRate)
                  .HasColumnName("tax_rate")
                  .HasColumnType("numeric(8,4)")
                  .HasDefaultValue(0m)
                  .IsRequired();

            entity.Property(e => e.TaxAmount)
                  .HasColumnName("tax_amount")
                  .HasColumnType("numeric(18,2)")
                  .HasDefaultValue(0m)
                  .IsRequired();

            entity.Property(e => e.GrandTotal)
                  .HasColumnName("grand_total")
                  .HasColumnType("numeric(18,2)")
                  .IsRequired();

            entity.Property(e => e.InternalNotes)
                  .HasColumnName("internal_notes")
                  .HasColumnType("text");

            entity.Property(e => e.CustomerNotes)
                  .HasColumnName("customer_notes")
                  .HasColumnType("text");

            entity.Property(e => e.TermsAndConditions)
                  .HasColumnName("terms_and_conditions")
                  .HasColumnType("text");

            entity.Property(e => e.FinalizedAt)
                  .HasColumnName("finalized_at")
                  .HasColumnType("timestamptz");

            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.UpdatedAt)
                  .HasColumnName("updated_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.HasMany(e => e.Items)
                  .WithOne(i => i.Revision)
                  .HasForeignKey(i => i.RevisionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.SendLogs)
                  .WithOne(s => s.Revision)
                  .HasForeignKey(s => s.RevisionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.ApprovalLogs)
                  .WithOne(a => a.Revision)
                  .HasForeignKey(a => a.RevisionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 5. Configure QuotationItem entity
        modelBuilder.Entity<QuotationItem>(entity =>
        {
            entity.ToTable("quotation_items");

            entity.HasKey(e => e.ItemId);

            entity.Property(e => e.ItemId)
                  .HasColumnName("item_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.RevisionId)
                  .HasColumnName("revision_id")
                  .IsRequired();

            entity.HasIndex(e => e.RevisionId, "IX_quotation_items_revision_id");

            entity.Property(e => e.SortOrder)
                  .HasColumnName("sort_order")
                  .HasDefaultValue(0)
                  .IsRequired();

            entity.Property(e => e.ItemType)
                  .HasColumnName("item_type")
                  .HasMaxLength(30)
                  .HasDefaultValue("Printing")
                  .IsRequired();

            entity.Property(e => e.ProductName)
                  .HasColumnName("product_name")
                  .HasMaxLength(250)
                  .IsRequired();

            entity.Property(e => e.Description)
                  .HasColumnName("description")
                  .HasColumnType("text");

            entity.Property(e => e.SizeDimensions)
                  .HasColumnName("size_dimensions")
                  .HasMaxLength(150);

            entity.Property(e => e.Material)
                  .HasColumnName("material")
                  .HasMaxLength(150);

            entity.Property(e => e.Gsm)
                  .HasColumnName("gsm")
                  .HasMaxLength(50);

            entity.Property(e => e.PrintingColor)
                  .HasColumnName("printing_color")
                  .HasMaxLength(100);

            entity.Property(e => e.Finishing)
                  .HasColumnName("finishing")
                  .HasMaxLength(150);

            entity.Property(e => e.Quantity)
                  .HasColumnName("quantity")
                  .HasColumnType("numeric(18,3)")
                  .HasDefaultValue(1m)
                  .IsRequired();

            entity.Property(e => e.Unit)
                  .HasColumnName("unit")
                  .HasMaxLength(50)
                  .HasDefaultValue("pcs")
                  .IsRequired();

            entity.Property(e => e.UnitPrice)
                  .HasColumnName("unit_price")
                  .HasColumnType("numeric(18,2)")
                  .IsRequired();

            entity.Property(e => e.LineTotal)
                  .HasColumnName("line_total")
                  .HasColumnType("numeric(18,2)")
                  .IsRequired();

            entity.Property(e => e.ServiceCategory)
                  .HasColumnName("service_category")
                  .HasMaxLength(50);

            entity.Property(e => e.ServiceDetails)
                  .HasColumnName("service_details")
                  .HasColumnType("text");

            entity.Property(e => e.Notes)
                  .HasColumnName("notes")
                  .HasColumnType("text");
        });

        // 6. Configure QuotationSendLog entity
        modelBuilder.Entity<QuotationSendLog>(entity =>
        {
            entity.ToTable("quotation_send_logs");

            entity.HasKey(e => e.SendId);

            entity.Property(e => e.SendId)
                  .HasColumnName("send_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.RevisionId)
                  .HasColumnName("revision_id")
                  .IsRequired();

            entity.HasIndex(e => e.RevisionId, "IX_quotation_send_logs_revision_id");

            entity.Property(e => e.SendMethod)
                  .HasColumnName("send_method")
                  .HasMaxLength(30)
                  .IsRequired();

            entity.Property(e => e.Recipient)
                  .HasColumnName("recipient")
                  .HasMaxLength(200)
                  .IsRequired();

            entity.Property(e => e.MarkedSentAt)
                  .HasColumnName("marked_sent_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.Notes)
                  .HasColumnName("notes")
                  .HasColumnType("text");

            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();
        });

        // 7. Configure QuotationApprovalLog entity
        modelBuilder.Entity<QuotationApprovalLog>(entity =>
        {
            entity.ToTable("quotation_approval_logs");

            entity.HasKey(e => e.ApprovalId);

            entity.Property(e => e.ApprovalId)
                  .HasColumnName("approval_id")
                  .UseIdentityAlwaysColumn();

            entity.Property(e => e.RevisionId)
                  .HasColumnName("revision_id")
                  .IsRequired();

            entity.HasIndex(e => e.RevisionId, "IX_quotation_approval_logs_revision_id");

            entity.Property(e => e.Decision)
                  .HasColumnName("decision")
                  .HasMaxLength(30)
                  .IsRequired();

            entity.Property(e => e.ResponseMethod)
                  .HasColumnName("response_method")
                  .HasMaxLength(30)
                  .IsRequired();

            entity.Property(e => e.ContactName)
                  .HasColumnName("contact_name")
                  .HasMaxLength(150);

            entity.Property(e => e.ResponseAt)
                  .HasColumnName("response_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();

            entity.Property(e => e.Notes)
                  .HasColumnName("notes")
                  .HasColumnType("text");

            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasColumnType("timestamptz")
                  .IsRequired();
        });

        // 8. Configure PrintingCategory entity
        modelBuilder.Entity<PrintingCategory>(entity =>
        {
            entity.ToTable("printing_categories");
            entity.HasKey(e => e.CategoryId);
            entity.Property(e => e.CategoryId).HasColumnName("category_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.CategoryName).HasColumnName("category_name").HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.CategoryName, "IX_printing_categories_name").IsUnique();
            entity.Property(e => e.SourceCategoryName).HasColumnName("source_category_name").HasMaxLength(150);
            entity.Property(e => e.ItemCount).HasColumnName("item_count").HasDefaultValue(0);
            entity.Property(e => e.ItemNumberRange).HasColumnName("item_number_range").HasMaxLength(50);
            entity.Property(e => e.DisplayOrder).HasColumnName("display_order").HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");

            entity.HasMany(e => e.Items)
                  .WithOne(i => i.Category)
                  .HasForeignKey(i => i.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 9. Configure PrintingItem entity
        modelBuilder.Entity<PrintingItem>(entity =>
        {
            entity.ToTable("printing_items");
            entity.HasKey(e => e.ItemId);
            entity.Property(e => e.ItemId).HasColumnName("item_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.SourceItemNumber).HasColumnName("source_item_number");
            entity.Property(e => e.ItemName).HasColumnName("item_name").HasMaxLength(250).IsRequired();
            entity.Property(e => e.DefaultWidthMm).HasColumnName("default_width_mm").HasColumnType("numeric(10,2)");
            entity.Property(e => e.DefaultHeightMm).HasColumnName("default_height_mm").HasColumnType("numeric(10,2)");
            entity.Property(e => e.InchesStr).HasColumnName("inches_str").HasMaxLength(50);
            entity.Property(e => e.CmStr).HasColumnName("cm_str").HasMaxLength(50);
            entity.Property(e => e.MmStr).HasColumnName("mm_str").HasMaxLength(50);
            entity.Property(e => e.SizingBasis).HasColumnName("sizing_basis").HasMaxLength(100);
            entity.Property(e => e.SourceNotes).HasColumnName("source_notes").HasColumnType("text");
            entity.Property(e => e.IsCustom).HasColumnName("is_custom").HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");

            entity.HasIndex(e => new { e.CategoryId, e.ItemName }, "IX_printing_items_category_name");
        });

        // 10. Configure PaperSize entity
        modelBuilder.Entity<PaperSize>(entity =>
        {
            entity.ToTable("paper_sizes");
            entity.HasKey(e => e.PaperSizeId);
            entity.Property(e => e.PaperSizeId).HasColumnName("paper_size_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.SizeName).HasColumnName("size_name").HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.SizeName, "IX_paper_sizes_size_name").IsUnique();
            entity.Property(e => e.LengthInches).HasColumnName("length_inches").HasColumnType("numeric(10,3)");
            entity.Property(e => e.WidthInches).HasColumnName("width_inches").HasColumnType("numeric(10,3)");
            entity.Property(e => e.WidthMm).HasColumnName("width_mm").HasColumnType("numeric(10,2)");
            entity.Property(e => e.HeightMm).HasColumnName("height_mm").HasColumnType("numeric(10,2)");
            entity.Property(e => e.SizeType).HasColumnName("size_type").HasMaxLength(50).HasDefaultValue("StockPaper");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        });

        // 11. Configure PrintingMaterial entity
        modelBuilder.Entity<PrintingMaterial>(entity =>
        {
            entity.ToTable("printing_materials");
            entity.HasKey(e => e.MaterialId);
            entity.Property(e => e.MaterialId).HasColumnName("material_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.MaterialName, "IX_printing_materials_name").IsUnique();
            entity.Property(e => e.DefaultLength).HasColumnName("default_length").HasColumnType("numeric(10,3)");
            entity.Property(e => e.DefaultWidth).HasColumnName("default_width").HasColumnType("numeric(10,3)");
            entity.Property(e => e.DefaultGsm).HasColumnName("default_gsm").HasColumnType("numeric(10,3)");
            entity.Property(e => e.DefaultRatePerKg).HasColumnName("default_rate_per_kg").HasColumnType("numeric(18,4)");
            entity.Property(e => e.DefaultSheetsPerRim).HasColumnName("default_sheets_per_rim").HasDefaultValue(500);
            entity.Property(e => e.DefaultConversionFactor).HasColumnName("default_conversion_factor").HasColumnType("numeric(12,4)").HasDefaultValue(3100m);
            entity.Property(e => e.PricingMethod).HasColumnName("pricing_method").HasMaxLength(50);
            entity.Property(e => e.PacketPrice).HasColumnName("packet_price").HasColumnType("numeric(18,4)");
            entity.Property(e => e.SheetsPerPacket).HasColumnName("sheets_per_packet");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        });

        // 12. Configure CostCategory entity
        modelBuilder.Entity<CostCategory>(entity =>
        {
            entity.ToTable("cost_categories");
            entity.HasKey(e => e.CategoryId);
            entity.Property(e => e.CategoryId).HasColumnName("category_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.CategoryName).HasColumnName("category_name").HasMaxLength(150).IsRequired();
            entity.Property(e => e.DisplayOrder).HasColumnName("display_order").HasDefaultValue(0);
            entity.Property(e => e.DefaultCalculationMethod).HasColumnName("default_calculation_method").HasMaxLength(50);
            entity.Property(e => e.DefaultRate).HasColumnName("default_rate").HasColumnType("numeric(18,4)");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        });

        // 14. Configure PrintingCostEstimate entity
        modelBuilder.Entity<PrintingCostEstimate>(entity =>
        {
            entity.ToTable("printing_cost_estimates");
            entity.HasKey(e => e.EstimateId);
            entity.Property(e => e.EstimateId).HasColumnName("estimate_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.EstimateNumber).HasColumnName("estimate_number").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.EstimateNumber, "IX_printing_cost_estimates_estimate_number").IsUnique();

            entity.Property(e => e.JobTitle).HasColumnName("job_title").HasMaxLength(250).IsRequired();
            entity.Property(e => e.ProductType).HasColumnName("product_type").HasMaxLength(100);
            entity.Property(e => e.PrintingCategoryId).HasColumnName("printing_category_id");
            entity.Property(e => e.PrintingItemId).HasColumnName("printing_item_id");
            entity.Property(e => e.MaterialId).HasColumnName("material_id");
            entity.Property(e => e.PaperSizeId).HasColumnName("paper_size_id");
            entity.Property(e => e.PrintingSide).HasColumnName("printing_side").HasMaxLength(50);
            entity.Property(e => e.ColorMode).HasColumnName("color_mode").HasMaxLength(50);
            entity.Property(e => e.JobDescription).HasColumnName("job_description").HasColumnType("text");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.SpecificationsSnapshot).HasColumnName("specifications_snapshot").HasColumnType("jsonb");
            entity.Property(e => e.MaterialPricingSnapshot).HasColumnName("material_pricing_snapshot").HasColumnType("jsonb");
            entity.Property(e => e.ProfitPercentage).HasColumnName("profit_percentage").HasColumnType("numeric(8,2)").HasDefaultValue(20m);
            entity.Property(e => e.FixedProfitAmount).HasColumnName("fixed_profit_amount").HasColumnType("numeric(18,2)");
            entity.Property(e => e.ProfitCalculationMethod).HasColumnName("profit_calculation_method").HasMaxLength(50).HasDefaultValue("Percentage");
            entity.Property(e => e.TaxPercentage).HasColumnName("tax_percentage").HasColumnType("numeric(8,2)").HasDefaultValue(0m);
            entity.Property(e => e.TaxCalculationMethod).HasColumnName("tax_calculation_method").HasMaxLength(50).HasDefaultValue("OnSubtotal");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50).HasDefaultValue("Draft");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at").HasColumnType("timestamptz");

            entity.HasOne(e => e.PrintingCategory)
                  .WithMany()
                  .HasForeignKey(e => e.PrintingCategoryId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.PrintingItem)
                  .WithMany()
                  .HasForeignKey(e => e.PrintingItemId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Material)
                  .WithMany()
                  .HasForeignKey(e => e.MaterialId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.PaperSize)
                  .WithMany()
                  .HasForeignKey(e => e.PaperSizeId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Quantities)
                  .WithOne(q => q.Estimate)
                  .HasForeignKey(q => q.EstimateId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 15. Configure EstimateQuantity entity
        modelBuilder.Entity<EstimateQuantity>(entity =>
        {
            entity.ToTable("estimate_quantities");
            entity.HasKey(e => e.EstimateQuantityId);
            entity.Property(e => e.EstimateQuantityId).HasColumnName("estimate_quantity_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.EstimateId).HasColumnName("estimate_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.SheetsRequired).HasColumnName("sheets_required").HasColumnType("numeric(12,2)");
            entity.Property(e => e.WastagePercentage).HasColumnName("wastage_percentage").HasColumnType("numeric(8,2)").HasDefaultValue(0m);
            entity.Property(e => e.PaperCost).HasColumnName("paper_cost").HasColumnType("numeric(18,4)");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);

            entity.HasMany(e => e.CostItems)
                  .WithOne(c => c.EstimateQuantity)
                  .HasForeignKey(c => c.EstimateQuantityId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Result)
                  .WithOne(r => r.EstimateQuantity)
                  .HasForeignKey<EstimateResult>(r => r.EstimateQuantityId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 16. Configure EstimateCostItem entity
        modelBuilder.Entity<EstimateCostItem>(entity =>
        {
            entity.ToTable("estimate_cost_items");
            entity.HasKey(e => e.CostItemId);
            entity.Property(e => e.CostItemId).HasColumnName("cost_item_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.EstimateQuantityId).HasColumnName("estimate_quantity_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.ExpenseNameSnapshot).HasColumnName("expense_name_snapshot").HasMaxLength(150).IsRequired();
            entity.Property(e => e.CalculationMethod).HasColumnName("calculation_method").HasMaxLength(50).IsRequired();
            entity.Property(e => e.UnitRate).HasColumnName("unit_rate").HasColumnType("numeric(18,4)").HasDefaultValue(0m);
            entity.Property(e => e.Units).HasColumnName("units").HasColumnType("numeric(12,3)").HasDefaultValue(1m);
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(18,4)").HasDefaultValue(0m);
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);

            entity.HasOne(e => e.Category)
                  .WithMany()
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // 17. Configure EstimateResult entity
        modelBuilder.Entity<EstimateResult>(entity =>
        {
            entity.ToTable("estimate_results");
            entity.HasKey(e => e.ResultId);
            entity.Property(e => e.ResultId).HasColumnName("result_id").UseIdentityAlwaysColumn();
            entity.Property(e => e.EstimateQuantityId).HasColumnName("estimate_quantity_id");
            entity.HasIndex(e => e.EstimateQuantityId, "IX_estimate_results_estimate_quantity_id").IsUnique();

            entity.Property(e => e.PaperCost).HasColumnName("paper_cost").HasColumnType("numeric(18,4)");
            entity.Property(e => e.AdditionalExpenses).HasColumnName("additional_expenses").HasColumnType("numeric(18,4)");
            entity.Property(e => e.ProductionCost).HasColumnName("production_cost").HasColumnType("numeric(18,4)");
            entity.Property(e => e.ProfitAmount).HasColumnName("profit_amount").HasColumnType("numeric(18,4)");
            entity.Property(e => e.Subtotal).HasColumnName("subtotal").HasColumnType("numeric(18,4)");
            entity.Property(e => e.TaxAmount).HasColumnName("tax_amount").HasColumnType("numeric(18,4)");
            entity.Property(e => e.GrandTotal).HasColumnName("grand_total").HasColumnType("numeric(18,4)");
            entity.Property(e => e.PerPieceCost).HasColumnName("per_piece_cost").HasColumnType("numeric(18,4)");
            entity.Property(e => e.CalculatedAt).HasColumnName("calculated_at").HasColumnType("timestamptz");
        });

        // 18. Configure ProductionJobSheet entity
        modelBuilder.Entity<ProductionJobSheet>(entity =>
        {
            entity.ToTable("production_job_sheets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.JobCardNumber).HasColumnName("job_card_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.JobDate).HasColumnName("job_date").HasColumnType("timestamptz");
            entity.Property(e => e.CustomerName).HasColumnName("customer_name").HasMaxLength(150).IsRequired();
            entity.Property(e => e.JobName).HasColumnName("job_name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").IsRequired();
            entity.Property(e => e.PaperSize).HasColumnName("paper_size").HasMaxLength(100);
            entity.Property(e => e.PaperType).HasColumnName("paper_type").HasMaxLength(100);
            entity.Property(e => e.Gsm).HasColumnName("gsm");
            entity.Property(e => e.PrintingSheetSize).HasColumnName("printing_sheet_size").HasMaxLength(100);
            entity.Property(e => e.PrintingColors).HasColumnName("printing_colors").HasMaxLength(50);
            entity.Property(e => e.PrintingSide).HasColumnName("printing_side").HasMaxLength(50);
            entity.Property(e => e.PrintingMethod).HasColumnName("printing_method").HasMaxLength(50);
            entity.Property(e => e.PrintingMethodOther).HasColumnName("printing_method_other").HasMaxLength(100);
            entity.Property(e => e.PrintingMachine).HasColumnName("printing_machine").HasMaxLength(100);
            entity.Property(e => e.PrintingOperator).HasColumnName("printing_operator").HasMaxLength(100);
            entity.Property(e => e.PrintingStartDate).HasColumnName("printing_start_date").HasColumnType("timestamptz");
            entity.Property(e => e.PrintingCompletionDate).HasColumnName("printing_completion_date").HasColumnType("timestamptz");
            entity.Property(e => e.Lamination).HasColumnName("lamination").HasMaxLength(50);
            entity.Property(e => e.LaminationOther).HasColumnName("lamination_other").HasMaxLength(100);
            entity.Property(e => e.DieCutting).HasColumnName("die_cutting").HasMaxLength(50);
            entity.Property(e => e.Binding).HasColumnName("binding").HasMaxLength(50);
            entity.Property(e => e.BindingOther).HasColumnName("binding_other").HasMaxLength(100);
            entity.Property(e => e.UvCoating).HasColumnName("uv_coating").HasMaxLength(50);
            entity.Property(e => e.Packing).HasColumnName("packing").HasMaxLength(50);
            entity.Property(e => e.PackingInstructions).HasColumnName("packing_instructions").HasMaxLength(500);
            entity.Property(e => e.SpecialInstructions).HasColumnName("special_instructions").HasColumnType("text");
            entity.Property(e => e.ProductionSupervisor).HasColumnName("production_supervisor").HasMaxLength(100);
            entity.Property(e => e.AuthorizedBy).HasColumnName("authorized_by").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        });

        // 19. Configure Invoice entity
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("invoices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date").HasColumnType("timestamptz");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.CustomerName).HasColumnName("customer_name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.CompanyName).HasColumnName("company_name").HasMaxLength(200);
            entity.Property(e => e.ContactNumber).HasColumnName("contact_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(200);
            entity.Property(e => e.BillingAddress).HasColumnName("billing_address").HasColumnType("text");
            entity.Property(e => e.Total).HasColumnName("total").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Advance).HasColumnName("advance").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Balance).HasColumnName("balance").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");

            entity.HasOne(e => e.Customer)
                  .WithMany()
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Items)
                  .WithOne(i => i.Invoice)
                  .HasForeignKey(i => i.InvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.InvoiceDate);
        });

        // 20. Configure InvoiceItem entity
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.ToTable("invoice_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id").IsRequired();
            entity.Property(e => e.SerialNumber).HasColumnName("serial_number").IsRequired();
            entity.Property(e => e.GrNumber).HasColumnName("gr_number").HasMaxLength(50);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Rate).HasColumnName("rate").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");

            entity.HasIndex(e => e.InvoiceId);
        });

        // 21. Configure Supplier entity
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.ToTable("suppliers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.SupplierName).HasColumnName("supplier_name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.ContactPerson).HasColumnName("contact_person").HasMaxLength(150);
            entity.Property(e => e.PhoneNumber).HasColumnName("phone_number").HasMaxLength(30);
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(200);
            entity.Property(e => e.Address).HasColumnName("address").HasColumnType("text");
            entity.Property(e => e.LeadTimeWorkingDays).HasColumnName("lead_time_working_days");
            entity.Property(e => e.BankName).HasColumnName("bank_name").HasMaxLength(150);
            entity.Property(e => e.AccountName).HasColumnName("account_name").HasMaxLength(200);
            entity.Property(e => e.AccountNumberOrIban).HasColumnName("account_number_or_iban").HasMaxLength(100);
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Active").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");

            entity.HasMany(e => e.Services)
                  .WithOne(s => s.Supplier)
                  .HasForeignKey(s => s.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SupplierName, "IX_suppliers_supplier_name");
            entity.HasIndex(e => e.Status, "IX_suppliers_status");
        });

        // 22. Configure SupplierServiceItem entity
        modelBuilder.Entity<SupplierServiceItem>(entity =>
        {
            entity.ToTable("supplier_services");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id").IsRequired();
            entity.Property(e => e.ServiceName).HasColumnName("service_name").HasMaxLength(250).IsRequired();

            entity.HasIndex(e => e.SupplierId, "IX_supplier_services_supplier_id");
        });

        // 23. Configure SupplierQuote entity
        modelBuilder.Entity<SupplierQuote>(entity =>
        {
            entity.ToTable("supplier_quotes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.QuoteNumber).HasColumnName("quote_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id").IsRequired();
            entity.Property(e => e.SupplierReferenceNumber).HasColumnName("supplier_reference_number").HasMaxLength(100);
            entity.Property(e => e.QuoteDate).HasColumnName("quote_date").HasColumnType("timestamptz");
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Recorded").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");

            entity.HasOne(e => e.Supplier)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Items)
                  .WithOne(i => i.SupplierQuote)
                  .HasForeignKey(i => i.SupplierQuoteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.QuoteNumber).IsUnique();
            entity.HasIndex(e => e.SupplierId);
            entity.HasIndex(e => e.QuoteDate);
        });

        // 24. Configure SupplierQuoteItem entity
        modelBuilder.Entity<SupplierQuoteItem>(entity =>
        {
            entity.ToTable("supplier_quote_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.SupplierQuoteId).HasColumnName("supplier_quote_id").IsRequired();
            entity.Property(e => e.SerialNumber).HasColumnName("serial_number").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Rate).HasColumnName("rate").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)").IsRequired();

            entity.HasIndex(e => e.SupplierQuoteId);
        });

        // 25. Configure PurchaseOrder entity
        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.ToTable("purchase_orders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.PoNumber).HasColumnName("po_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id").IsRequired();
            entity.Property(e => e.SupplierQuoteId).HasColumnName("supplier_quote_id");
            entity.Property(e => e.ProjectJobId).HasColumnName("project_job_id");
            entity.Property(e => e.PoDate).HasColumnName("po_date").HasColumnType("timestamptz");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Draft").IsRequired();
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
            entity.Property(e => e.IssuedAt).HasColumnName("issued_at").HasColumnType("timestamptz");
            entity.Property(e => e.CancelledAt).HasColumnName("cancelled_at").HasColumnType("timestamptz");

            entity.HasOne(e => e.Supplier)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SupplierQuote)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierQuoteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProjectJob)
                  .WithMany()
                  .HasForeignKey(e => e.ProjectJobId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Items)
                  .WithOne(i => i.PurchaseOrder)
                  .HasForeignKey(i => i.PurchaseOrderId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PoNumber).IsUnique();
            entity.HasIndex(e => e.SupplierId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PoDate);
        });

        // 26. Configure PurchaseOrderItem entity
        modelBuilder.Entity<PurchaseOrderItem>(entity =>
        {
            entity.ToTable("purchase_order_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.PurchaseOrderId).HasColumnName("purchase_order_id").IsRequired();
            entity.Property(e => e.SerialNumber).HasColumnName("serial_number").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Rate).HasColumnName("rate").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)").IsRequired();

            entity.HasIndex(e => e.PurchaseOrderId);
        });

        // 27. Configure SupplierBill entity
        modelBuilder.Entity<SupplierBill>(entity =>
        {
            entity.ToTable("supplier_bills");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.InternalBillNumber).HasColumnName("internal_bill_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.SupplierInvoiceNumber).HasColumnName("supplier_invoice_number").HasMaxLength(100).IsRequired();
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id").IsRequired();
            entity.Property(e => e.PurchaseOrderId).HasColumnName("purchase_order_id");
            entity.Property(e => e.BillDate).HasColumnName("bill_date").HasColumnType("timestamptz");
            entity.Property(e => e.DueDate).HasColumnName("due_date").HasColumnType("timestamptz");
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.PaidAmount).HasColumnName("paid_amount").HasColumnType("numeric(18,2)").HasDefaultValue(0m).IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Unpaid").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
            entity.Property(e => e.CancelledAt).HasColumnName("cancelled_at").HasColumnType("timestamptz");

            entity.HasOne(e => e.Supplier)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PurchaseOrder)
                  .WithMany()
                  .HasForeignKey(e => e.PurchaseOrderId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Items)
                  .WithOne(i => i.SupplierBill)
                  .HasForeignKey(i => i.SupplierBillId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.InternalBillNumber).IsUnique();
            entity.HasIndex(e => e.SupplierId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => new { e.SupplierId, e.SupplierInvoiceNumber });
        });

        // 28. Configure SupplierBillItem entity
        modelBuilder.Entity<SupplierBillItem>(entity =>
        {
            entity.ToTable("supplier_bill_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.SupplierBillId).HasColumnName("supplier_bill_id").IsRequired();
            entity.Property(e => e.SerialNumber).HasColumnName("serial_number").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Rate).HasColumnName("rate").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)").IsRequired();

            entity.HasIndex(e => e.SupplierBillId);
        });

        // 29. Configure SupplierPayment entity
        modelBuilder.Entity<SupplierPayment>(entity =>
        {
            entity.ToTable("supplier_payments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            entity.Property(e => e.PaymentNumber).HasColumnName("payment_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id").IsRequired();
            entity.Property(e => e.SupplierBillId).HasColumnName("supplier_bill_id").IsRequired();
            entity.Property(e => e.PaymentDate).HasColumnName("payment_date").HasColumnType("timestamptz");
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.PaymentMethod).HasColumnName("payment_method").HasMaxLength(50).IsRequired();
            entity.Property(e => e.PaymentAccountReference).HasColumnName("payment_account_reference").HasMaxLength(150);
            entity.Property(e => e.TransactionReference).HasColumnName("transaction_reference").HasMaxLength(150);
            entity.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(1000);
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Posted").IsRequired();
            entity.Property(e => e.ReversalReason).HasColumnName("reversal_reason").HasMaxLength(500);
            entity.Property(e => e.ReversedAt).HasColumnName("reversed_at").HasColumnType("timestamptz");
            entity.Property(e => e.ReversedBy).HasColumnName("reversed_by").HasMaxLength(150);
            entity.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(150);
            entity.Property(e => e.IdempotencyKey).HasColumnName("idempotency_key").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");

            entity.HasOne(e => e.Supplier)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SupplierBill)
                  .WithMany()
                  .HasForeignKey(e => e.SupplierBillId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PaymentNumber).IsUnique();
            entity.HasIndex(e => e.SupplierId);
            entity.HasIndex(e => e.SupplierBillId);
            entity.HasIndex(e => e.PaymentDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IdempotencyKey).IsUnique();
        });
    }
}
