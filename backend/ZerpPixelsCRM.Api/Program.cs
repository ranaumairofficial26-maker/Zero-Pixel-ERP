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

// 4. Dependency Injection for Business Services
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPrintingOrderRepository, PrintingOrderRepository>();
builder.Services.AddScoped<IProductionJobRepository, ProductionJobRepository>();
builder.Services.AddScoped<IPrintingOrderService, PrintingOrderService>();
builder.Services.AddScoped<IProductionService, ProductionService>();
builder.Services.AddScoped<IQuotationService, QuotationService>();
builder.Services.AddSingleton<QuotationPdfService>();

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

        // Ensure Digital Marketing columns exist safely on quotation_items
        await context.Database.ExecuteSqlRawAsync(
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
            DROP TABLE IF EXISTS printing_materials CASCADE;
            ALTER TABLE sheet_calculations DROP COLUMN IF EXISTS material_id CASCADE;
            ALTER TABLE sheet_calculations DROP COLUMN IF EXISTS material_name_snapshot CASCADE;
            CREATE TABLE IF NOT EXISTS sheet_calculations (
                calculation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                length NUMERIC(12,3) NOT NULL,
                width NUMERIC(12,3) NOT NULL,
                gsm NUMERIC(12,3) NOT NULL,
                rate_per_kg NUMERIC(18,4) NOT NULL,
                sheets_per_rim INTEGER NOT NULL DEFAULT 500,
                required_sheets INTEGER NOT NULL DEFAULT 500,
                conversion_factor NUMERIC(12,4) NOT NULL DEFAULT 3100,
                rim_price NUMERIC(18,4) NOT NULL,
                per_sheet_price NUMERIC(18,4) NOT NULL,
                total_paper_cost NUMERIC(18,4) NOT NULL,
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS IX_sheet_calculations_created_at ON sheet_calculations(created_at DESC);");

        var authService = services.GetRequiredService<IAuthService>();
        await authService.SeedAdminUserAsync();
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
