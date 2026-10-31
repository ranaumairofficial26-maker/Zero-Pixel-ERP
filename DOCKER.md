# Zero Pixel CRM - Docker Deployment Guide

This project includes a complete, production-ready Docker configuration using multi-stage builds and Docker Compose.

---

## 🚀 Quick Start (Run Everything with 1 Command)

Open your terminal in the root folder (`d:\Zerp pixels crm`) and run:

```bash
docker compose up --build -d
```

---

## 🌐 Services & Ports

| Service | Description | URL / Port | Credentials / Info |
|---|---|---|---|
| **Frontend** | Angular 18 + Nginx | [http://localhost:4200](http://localhost:4200) or [http://localhost](http://localhost) | Complete UI with SPA routing & reverse proxy |
| **Backend API** | .NET 8 Web API | [http://localhost:5282/swagger](http://localhost:5282/swagger) | Swagger UI & REST API |
| **PostgreSQL** | Database 16 | `localhost:5432` | User: `postgres` / Pass: `postgrespassword` / DB: `ZeroPixelErpDb` |
| **pgAdmin 4** | Database GUI | [http://localhost:5050](http://localhost:5050) | Email: `admin@zerppixels.com` / Pass: `adminpassword` |

---

## 📋 Common Docker Commands

### 1. View running containers:
```bash
docker compose ps
```

### 2. View live logs:
```bash
# All logs
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# Frontend logs only
docker compose logs -f frontend
```

### 3. Stop all services:
```bash
docker compose down
```

### 4. Stop and delete database volumes (Fresh Reset):
```bash
docker compose down -v
```

---

## ⚙️ Architecture Highlights

1. **Backend (`backend/Dockerfile`):**
   - Multi-stage build using `mcr.microsoft.com/dotnet/sdk:8.0` and `aspnet:8.0`.
   - Pre-installed `fontconfig`, `libfontconfig1`, and `fonts-liberation` packages to ensure **QuestPDF** PDF generation operates flawlessly on Linux.
   - Automatically migrates database schemas and seeds default admin credentials on startup.

2. **Frontend (`frontend/Dockerfile` & `frontend/nginx.conf`):**
   - Multi-stage build compiling Angular with Node 20.
   - Served via lightweight `nginx:alpine`.
   - Built-in reverse proxy routes `/api/*` and `/swagger/*` calls directly to the backend container without CORS issues.
   - SPA fallback configured so page reloads (`F5`) on deep routes like `/admin/quotations/new` never return 404 errors.

