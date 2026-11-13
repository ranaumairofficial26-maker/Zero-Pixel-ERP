# Zero Pixel ERP — Database (`ZeroPixelErpDb`)

This folder contains the complete PostgreSQL database schema, seed data, and full database backup for **Zero Pixel ERP & CRM**.

---

## 1. Files in this Folder

| File / Folder | Description |
| :--- | :--- |
| [`schema.sql`](./schema.sql) | Complete PostgreSQL database schema (`CREATE TABLE`, primary keys, foreign keys, and indexes for all 26 tables). |
| [`seed_data.sql`](./seed_data.sql) | `INSERT` statements for all current records and master seed data (admin users, printing categories, 195 printing items, paper sizes, materials, machine rates, clients, quotations, orders, jobs, and invoices). |
| [`ZeroPixelErpDb_full_backup.sql`](./ZeroPixelErpDb_full_backup.sql) | Complete single-file backup (Schema + Data combined) ready to restore into any PostgreSQL instance. |
| [`seed/printing_categories.json`](./seed/printing_categories.json) | Master JSON seed for printing categories. |
| [`seed/printing_items_195.json`](./seed/printing_items_195.json) | Master JSON seed for 195 commercial printing items & specifications. |

---

## 2. Database Connection Details (Local Development)

Configured in [`backend/ZerpPixelsCRM.Api/appsettings.json`](../backend/ZerpPixelsCRM.Api/appsettings.json):

- **Engine**: PostgreSQL 18
- **Host**: `localhost`
- **Port**: `5432`
- **Database Name**: `ZeroPixelErpDb`
- **Username**: `postgres`
- **Password**: `1234`

---

## 3. How to Restore / Import on Any Machine

### Option A: Automatic (via .NET Backend)
When you run the backend (`dotnet run`), Entity Framework Core automatically creates `ZeroPixelErpDb`, runs all migrations, ensures all tables/columns exist, and seeds default master data via [`Program.cs`](../backend/ZerpPixelsCRM.Api/Program.cs) and [`PrintingIntelligenceSeeder.cs`](../backend/ZerpPixelsCRM.Api/Data/PrintingIntelligenceSeeder.cs).

### Option B: Manual Restore via `psql` or pgAdmin
To restore the full backup (`ZeroPixelErpDb_full_backup.sql`) manually into PostgreSQL:

```powershell
$env:PGPASSWORD="1234"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d ZeroPixelErpDb -f "d:\Zerp pixels crm\database\ZeroPixelErpDb_full_backup.sql"
```

