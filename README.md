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
