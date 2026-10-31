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
    }
}
