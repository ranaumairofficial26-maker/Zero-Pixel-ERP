# ZERO PIXEL ERP — CUSTOMER MANAGEMENT MODULE

Production-oriented Customer Management Module for **Zero Pixel**, a printing business ERP system.

---

## 🎯 Architecture & Scope

- **Single Admin Panel**: Dedicated interface for authorized Zero Pixel Admins to manage customer records. No customer portal, sales portal, or employee portal.
- **Customers Workflow**: Customers contact Zero Pixel externally (phone calls, WhatsApp, email, office visits). Admin creates and manages their profiles.
- **Scope**: Step 1 Customer Management.

---

## 💻 Technology Stack

### Frontend
- **Angular 19 / 22** with TypeScript
- **Standalone Components** (`CustomerListComponent`, `CustomerFormComponent`, `CustomerDetailComponent`, `AdminLayoutComponent`, `SidebarComponent`, `HeaderComponent`, `LoginComponent`)
- **Angular Router** with `authGuard` protection
- **Angular Reactive Forms** with field-level validation & duplicate submission prevention
- **Angular HttpClient** with `authInterceptor` adding JWT Bearer tokens
- **Angular Material** UI & modern custom styling conforming to Zero Pixel's brand identity

### Backend
- **ASP.NET Core Web API (.NET 8)**
- **Entity Framework Core 8** (`Npgsql.EntityFrameworkCore.PostgreSQL`)
- **PostgreSQL Database** (`clients` table with `client_id` BIGINT PK)
- **Centralized RFC 7807 Exception Handling** (`ProblemDetails`)
- **FluentValidation** for server-side validation
- **JWT Bearer Authentication** & **BCrypt.Net-Next** password hashing
- **Phone Normalization Engine** with duplicate customer detection & warning

---

## 🗄️ Database Schema (`clients`)

```sql
CREATE TABLE clients (
    client_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(200),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

-- Required indexes for fast searching and filtering
CREATE INDEX ix_clients_company_name ON clients (company_name);
CREATE INDEX ix_clients_phone ON clients (phone);
CREATE INDEX ix_clients_deleted_at ON clients (deleted_at);
CREATE INDEX ix_clients_is_active ON clients (is_active);
```

---

## 🚀 Running the Project

### 1. PostgreSQL Database
- Ensure PostgreSQL is running on port 5432 (`ZeroPixelErpDb`).
- Connection string in `appsettings.json`:
  `Host=localhost;Port=5432;Database=ZeroPixelErpDb;Username=postgres;Password=1234`

### 2. Backend API (.NET 8)
```bash
cd "backend/ZerpPixelsCRM.Api"
dotnet run --launch-profile http
```
- **Backend URL:** `http://localhost:5282`
- **Swagger Documentation:** `http://localhost:5282/swagger`

### 3. Frontend (Angular)
```bash
cd frontend
npm start
```
- **Frontend URL:** `http://localhost:4200`

---

## 🔐 Admin Authentication Credentials

- **Email:** `admin@zeropixel.com`
- **Password:** `Admin@123456`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate Admin & obtain JWT token |
| `GET` | `/api/clients` | Paginated customer list with search & status filter |
| `GET` | `/api/clients/{id}` | Get complete customer profile by ID |
| `POST` | `/api/clients` | Create customer (with phone duplicate check) |
| `PUT` | `/api/clients/{id}` | Update customer details (preserves `client_id`) |
| `PATCH` | `/api/clients/{id}/status` | Toggle customer active / inactive status |
| `DELETE` | `/api/clients/{id}` | Soft delete (archive) customer |
| `POST` | `/api/clients/{id}/restore` | Restore archived customer |
