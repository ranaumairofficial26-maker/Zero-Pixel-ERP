using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ZerpPixelsCRM.Api.Data;
using ZerpPixelsCRM.Api.Entities;
using ZerpPixelsCRM.Api.Interfaces;
using ZerpPixelsCRM.Api.Middleware;
using ZerpPixelsCRM.Api.Repositories.Implementations;
using ZerpPixelsCRM.Api.Repositories.Interfaces;
using ZerpPixelsCRM.Api.Services;
using ZerpPixelsCRM.Api.Validators;

// Configure QuestPDF Community License
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers with FluentValidation
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateClientRequestValidator>();

// 2. Database Context (PostgreSQL EF Core)
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "Host=localhost;Port=5432;Database=ZeroPixelErpDb;Username=postgres;Password=1234";

var connectionString = ParseConnectionString(rawConnectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 3. Repository Pattern & Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IAdminUserRepository, AdminUserRepository>();
builder.Services.AddScoped<IQuotationRepository, QuotationRepository>();
builder.Services.AddScoped<IPrintingOrderRepository, PrintingOrderRepository>();
builder.Services.AddScoped<IProductionJobRepository, ProductionJobRepository>();
builder.Services.AddScoped<IProductionJobSheetRepository, ProductionJobSheetRepository>();
builder.Services.AddScoped<IPrintingCalculatorRepository, PrintingCalculatorRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
builder.Services.AddScoped<ISupplierQuoteRepository, SupplierQuoteRepository>();
builder.Services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
builder.Services.AddScoped<ISupplierBillRepository, SupplierBillRepository>();
builder.Services.AddScoped<ISupplierPaymentRepository, SupplierPaymentRepository>();

// 4. Dependency Injection for Business Services
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPrintingOrderService, PrintingOrderService>();
builder.Services.AddScoped<IProductionService, ProductionService>();
builder.Services.AddScoped<IProductionJobSheetService, ProductionJobSheetService>();
builder.Services.AddScoped<IQuotationService, QuotationService>();
builder.Services.AddScoped<IPrintingCalculatorService, PrintingCalculatorService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<ISupplierQuoteService, SupplierQuoteService>();
builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
builder.Services.AddScoped<ISupplierBillService, SupplierBillService>();
builder.Services.AddScoped<ISupplierPaymentService, SupplierPaymentService>();
builder.Services.AddSingleton<InvoicePdfService>();
builder.Services.AddSingleton<QuotationPdfService>();
builder.Services.AddScoped<PrintingIntelligenceSeeder>();

// 4. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ZeroPixel_SuperSecure_Secret_JWT_Key_2026_Development_Only!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ZeroPixelApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ZeroPixelAdmin";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Dev environment
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. CORS policy for Angular Frontend (Local + Vercel)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:4200",
                  "https://zero-pixel-erp.vercel.app"
              )
              .SetIsOriginAllowed(origin => 
                  origin.EndsWith(".vercel.app") || 
                  origin == "http://localhost:4200" || 
                  origin == "http://localhost")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Swagger / OpenAPI with JWT Authorization Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Zero Pixel ERP - Customer Management API",
        Version = "v1",
        Description = "Step 1: Production Customer Management API for Zero Pixel ERP"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Auto-Migrate Database and Seed Admin User on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();

        // Ensure Digital Marketing columns exist safely on quotation_items and updated_at on admin_users
        await context.Database.ExecuteSqlRawAsync(
            "ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP; " +
            "ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS service_category VARCHAR(50); " +
            "ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS service_details TEXT; " +
            "ALTER TABLE quotation_revisions ADD COLUMN IF NOT EXISTS production_type VARCHAR(50) DEFAULT 'IN_HOUSE'; " +
            "ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS production_type VARCHAR(50) DEFAULT 'IN_HOUSE'; " +
            @"CREATE TABLE IF NOT EXISTS printing_orders (
                order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                order_number VARCHAR(50) NOT NULL UNIQUE,
                quotation_id BIGINT NOT NULL REFERENCES quotations(quotation_id) ON DELETE CASCADE,
                revision_id BIGINT NOT NULL UNIQUE REFERENCES quotation_revisions(revision_id) ON DELETE CASCADE,
                client_id BIGINT REFERENCES clients(client_id) ON DELETE SET NULL,
                customer_name VARCHAR(200) NOT NULL,
                contact_person VARCHAR(150),
                customer_phone VARCHAR(30) NOT NULL,
                customer_email VARCHAR(200),
                customer_address TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'Pending Review',
                production_type VARCHAR(50) NOT NULL DEFAULT 'IN_HOUSE',
                subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
                discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                tax_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                grand_total NUMERIC(18,2) NOT NULL DEFAULT 0,
                notes TEXT,
                confirmed_at TIMESTAMPTZ,
                confirmed_by VARCHAR(100),
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS printing_order_items (
                order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                order_id BIGINT NOT NULL REFERENCES printing_orders(order_id) ON DELETE CASCADE,
                quotation_item_id BIGINT,
                product_name VARCHAR(250) NOT NULL,
                description TEXT,
                size_dimensions VARCHAR(150),
                material VARCHAR(150),
                gsm VARCHAR(50),
                printing_color VARCHAR(100),
                finishing VARCHAR(150),
                quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
                unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
                unit_price NUMERIC(18,2) NOT NULL DEFAULT 0,
                line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
                production_type VARCHAR(50) NOT NULL DEFAULT 'IN_HOUSE',
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS production_jobs (
                job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                job_number VARCHAR(50) NOT NULL UNIQUE,
                order_id BIGINT NOT NULL REFERENCES printing_orders(order_id) ON DELETE CASCADE,
                production_type VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Queued',
                priority VARCHAR(30) NOT NULL DEFAULT 'Normal',
                target_start_date TIMESTAMPTZ,
                due_date TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                assigned_operator VARCHAR(150),
                machine_name VARCHAR(150),
                vendor_name VARCHAR(200),
                vendor_phone VARCHAR(50),
                vendor_email VARCHAR(200),
                vendor_reference VARCHAR(100),
                outsourced_cost NUMERIC(18,2),
                expected_delivery_date TIMESTAMPTZ,
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT UQ_production_jobs_order_prod_type UNIQUE(order_id, production_type)
            );
            CREATE TABLE IF NOT EXISTS production_job_items (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                job_id BIGINT NOT NULL REFERENCES production_jobs(job_id) ON DELETE CASCADE,
                order_item_id BIGINT NOT NULL REFERENCES printing_order_items(order_item_id) ON DELETE CASCADE,
                CONSTRAINT UQ_job_order_item UNIQUE(job_id, order_item_id)
            );
            CREATE INDEX IF NOT EXISTS IX_printing_orders_status ON printing_orders(status);
            CREATE INDEX IF NOT EXISTS IX_printing_orders_quotation_id ON printing_orders(quotation_id);
            CREATE INDEX IF NOT EXISTS IX_production_jobs_status ON production_jobs(status);
            CREATE INDEX IF NOT EXISTS IX_production_jobs_production_type ON production_jobs(production_type);
            CREATE TABLE IF NOT EXISTS production_job_sheets (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                job_card_number VARCHAR(50) NOT NULL,
                job_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                customer_name VARCHAR(150) NOT NULL,
                job_name VARCHAR(200) NOT NULL,
                quantity INTEGER NOT NULL,
                paper_size VARCHAR(100),
                paper_type VARCHAR(100),
                gsm INTEGER,
                printing_sheet_size VARCHAR(100),
                printing_colors VARCHAR(50),
                printing_side VARCHAR(50),
                printing_method VARCHAR(50),
                printing_method_other VARCHAR(100),
                printing_machine VARCHAR(100),
                printing_operator VARCHAR(100),
                printing_start_date TIMESTAMPTZ,
                printing_completion_date TIMESTAMPTZ,
                lamination VARCHAR(50),
                lamination_other VARCHAR(100),
                die_cutting VARCHAR(50),
                binding VARCHAR(50),
                binding_other VARCHAR(100),
                uv_coating VARCHAR(50),
                packing VARCHAR(50),
                packing_instructions VARCHAR(500),
                special_instructions TEXT,
                production_supervisor VARCHAR(100),
                authorized_by VARCHAR(100),
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_production_job_sheets_job_card_number ON production_job_sheets(job_card_number);
            CREATE INDEX IF NOT EXISTS IX_production_job_sheets_customer_name ON production_job_sheets(customer_name);
            CREATE INDEX IF NOT EXISTS IX_production_job_sheets_created_at ON production_job_sheets(created_at);

            CREATE TABLE IF NOT EXISTS printing_machine_rates (
                id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                machine_name VARCHAR(100) NOT NULL UNIQUE,
                print_per_plate NUMERIC(18,4) NOT NULL DEFAULT 0,
                print_per_set NUMERIC(18,4) NOT NULL DEFAULT 0,
                printing_plate NUMERIC(18,4) NOT NULL DEFAULT 0,
                plate_per_set NUMERIC(18,4) NOT NULL DEFAULT 0,
                display_order INT NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS invoices (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                invoice_number VARCHAR(50) NOT NULL UNIQUE,
                invoice_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                customer_id BIGINT NOT NULL REFERENCES clients(client_id) ON DELETE RESTRICT,
                customer_name VARCHAR(200) NOT NULL,
                company_name VARCHAR(200),
                contact_number VARCHAR(50) NOT NULL,
                email VARCHAR(200),
                billing_address TEXT,
                total NUMERIC(18,2) NOT NULL DEFAULT 0,
                advance NUMERIC(18,2) NOT NULL DEFAULT 0,
                balance NUMERIC(18,2) NOT NULL DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_invoices_invoice_number ON invoices(invoice_number);
            CREATE INDEX IF NOT EXISTS IX_invoices_customer_id ON invoices(customer_id);
            CREATE INDEX IF NOT EXISTS IX_invoices_invoice_date ON invoices(invoice_date);
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ntn_number VARCHAR(100);
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_po_number VARCHAR(100);
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS adjustment_type VARCHAR(30) NOT NULL DEFAULT 'advance';
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS adjustment_rate NUMERIC(18,2);
            ALTER TABLE invoices ADD COLUMN IF NOT EXISTS previous_balance NUMERIC(18,2);

            CREATE TABLE IF NOT EXISTS invoice_items (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
                serial_number INT NOT NULL,
                gr_number VARCHAR(50),
                description VARCHAR(500) NOT NULL,
                quantity NUMERIC(18,2) NOT NULL DEFAULT 1,
                rate NUMERIC(18,2) NOT NULL DEFAULT 0,
                amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_invoice_items_invoice_id ON invoice_items(invoice_id);

            CREATE TABLE IF NOT EXISTS suppliers (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                supplier_name VARCHAR(200) NOT NULL,
                contact_person VARCHAR(150),
                phone_number VARCHAR(30),
                email VARCHAR(200),
                address TEXT,
                lead_time_working_days INT,
                bank_name VARCHAR(150),
                account_name VARCHAR(200),
                account_number_or_iban VARCHAR(100),
                status VARCHAR(30) NOT NULL DEFAULT 'Active',
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_suppliers_supplier_name ON suppliers(supplier_name);
            CREATE INDEX IF NOT EXISTS IX_suppliers_status ON suppliers(status);

            CREATE TABLE IF NOT EXISTS supplier_services (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                supplier_id BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
                service_name VARCHAR(250) NOT NULL
            );
            CREATE INDEX IF NOT EXISTS IX_supplier_services_supplier_id ON supplier_services(supplier_id);

            CREATE TABLE IF NOT EXISTS supplier_quotes (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                quote_number VARCHAR(50) NOT NULL UNIQUE,
                supplier_id BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
                supplier_reference_number VARCHAR(100),
                quote_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                status VARCHAR(30) NOT NULL DEFAULT 'Recorded',
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_supplier_quotes_supplier_id ON supplier_quotes(supplier_id);
            CREATE INDEX IF NOT EXISTS IX_supplier_quotes_quote_date ON supplier_quotes(quote_date);

            CREATE TABLE IF NOT EXISTS supplier_quote_items (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                supplier_quote_id BIGINT NOT NULL REFERENCES supplier_quotes(id) ON DELETE RESTRICT,
                serial_number INT NOT NULL,
                description VARCHAR(500) NOT NULL,
                quantity NUMERIC(18,2) NOT NULL DEFAULT 1,
                rate NUMERIC(18,2) NOT NULL DEFAULT 0,
                amount NUMERIC(18,2) NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS IX_supplier_quote_items_quote_id ON supplier_quote_items(supplier_quote_id);

            CREATE TABLE IF NOT EXISTS purchase_orders (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                po_number VARCHAR(50) NOT NULL UNIQUE,
                supplier_id BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
                supplier_quote_id BIGINT REFERENCES supplier_quotes(id) ON DELETE RESTRICT,
                project_job_id BIGINT REFERENCES production_jobs(job_id) ON DELETE RESTRICT,
                po_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(30) NOT NULL DEFAULT 'Draft',
                total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                issued_at TIMESTAMPTZ,
                cancelled_at TIMESTAMPTZ
            );
            CREATE INDEX IF NOT EXISTS IX_purchase_orders_supplier_id ON purchase_orders(supplier_id);
            CREATE INDEX IF NOT EXISTS IX_purchase_orders_status ON purchase_orders(status);
            CREATE INDEX IF NOT EXISTS IX_purchase_orders_po_date ON purchase_orders(po_date);

            CREATE TABLE IF NOT EXISTS purchase_order_items (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
                serial_number INT NOT NULL,
                description VARCHAR(500) NOT NULL,
                quantity NUMERIC(18,2) NOT NULL DEFAULT 1,
                rate NUMERIC(18,2) NOT NULL DEFAULT 0,
                amount NUMERIC(18,2) NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS IX_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);

            CREATE TABLE IF NOT EXISTS supplier_bills (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                internal_bill_number VARCHAR(50) NOT NULL UNIQUE,
                supplier_invoice_number VARCHAR(100) NOT NULL,
                supplier_id BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
                purchase_order_id BIGINT REFERENCES purchase_orders(id) ON DELETE RESTRICT,
                bill_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                due_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                description VARCHAR(1000),
                total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                paid_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                status VARCHAR(30) NOT NULL DEFAULT 'Unpaid',
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                cancelled_at TIMESTAMPTZ
            );
            CREATE INDEX IF NOT EXISTS IX_supplier_bills_supplier_id ON supplier_bills(supplier_id);
            CREATE INDEX IF NOT EXISTS IX_supplier_bills_po_id ON supplier_bills(purchase_order_id);
            CREATE INDEX IF NOT EXISTS IX_supplier_bills_status ON supplier_bills(status);
            CREATE INDEX IF NOT EXISTS IX_supplier_bills_due_date ON supplier_bills(due_date);
            CREATE INDEX IF NOT EXISTS IX_supplier_bills_sup_inv ON supplier_bills(supplier_id, supplier_invoice_number);

            CREATE TABLE IF NOT EXISTS supplier_bill_items (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                supplier_bill_id BIGINT NOT NULL REFERENCES supplier_bills(id) ON DELETE RESTRICT,
                serial_number INT NOT NULL,
                description VARCHAR(500) NOT NULL,
                quantity NUMERIC(18,2) NOT NULL DEFAULT 1,
                rate NUMERIC(18,2) NOT NULL DEFAULT 0,
                amount NUMERIC(18,2) NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS IX_supplier_bill_items_bill_id ON supplier_bill_items(supplier_bill_id);

            CREATE TABLE IF NOT EXISTS supplier_payments (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                payment_number VARCHAR(50) NOT NULL UNIQUE,
                supplier_id BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
                supplier_bill_id BIGINT NOT NULL REFERENCES supplier_bills(id) ON DELETE RESTRICT,
                payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                amount NUMERIC(18,2) NOT NULL DEFAULT 0,
                payment_method VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
                payment_account_reference VARCHAR(150),
                transaction_reference VARCHAR(150),
                notes VARCHAR(1000),
                status VARCHAR(30) NOT NULL DEFAULT 'Posted',
                reversal_reason VARCHAR(500),
                reversed_at TIMESTAMPTZ,
                reversed_by VARCHAR(150),
                created_by VARCHAR(150),
                idempotency_key VARCHAR(100) UNIQUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_supplier_payments_supplier_id ON supplier_payments(supplier_id);
            CREATE INDEX IF NOT EXISTS IX_supplier_payments_bill_id ON supplier_payments(supplier_bill_id);
            CREATE INDEX IF NOT EXISTS IX_supplier_payments_payment_date ON supplier_payments(payment_date);
            CREATE INDEX IF NOT EXISTS IX_supplier_payments_status ON supplier_payments(status);");

        var authService = services.GetRequiredService<IAuthService>();
        await authService.SeedAdminUserAsync();

        var printingSeeder = services.GetRequiredService<PrintingIntelligenceSeeder>();
        await printingSeeder.SeedAllAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database or seeding the Admin user.");
    }
}

// 8. Middleware Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Zero Pixel ERP v1");
    });
}

app.UseCors("AllowAngularFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", database = "PostgreSQL Connected", serverTime = DateTime.UtcNow }));

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    app.Urls.Add($"http://*:{port}");
}

app.Run();

static string ParseConnectionString(string input)
{
    if (string.IsNullOrWhiteSpace(input)) return input;

    // If it's a URL like postgres://user:pass@host:port/dbname
    if (input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        try
        {
            var uri = new Uri(input);
            var userInfo = uri.UserInfo.Split(':');
            var user = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
            var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var db = uri.AbsolutePath.TrimStart('/');
            var port = uri.Port > 0 ? uri.Port : 5432;

            return $"Host={uri.Host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true";
        }
        catch
        {
            return input;
        }
    }

    return input;
}
