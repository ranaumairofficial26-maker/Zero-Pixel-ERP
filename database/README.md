# Zerp Pixels CRM - Database Setup (PostgreSQL)

This folder contains database initialization scripts, seed data, and Docker configurations for PostgreSQL.

## 1. Local PostgreSQL Setup (Installed Service)
If PostgreSQL is already installed on your local machine:
1. Open **pgAdmin** or **psql**.
2. Create a new database named `ZerpPixelsCrmDb`:
   ```sql
   CREATE DATABASE "ZerpPixelsCrmDb";
   ```
3. Run the scripts in the following order:
   - `init.sql` (Creates tables and indexes)
   - `seed.sql` (Inserts initial CRM sample records)

4. Update your backend connection string in `backend/ZerpPixelsCRM.Api/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=ZerpPixelsCrmDb;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"
   }
   ```

---

## 2. Docker Setup (Alternative)
If you prefer running PostgreSQL via Docker:
```bash
cd database
docker compose up -d
```
- PostgreSQL will be running on `localhost:5432`
- pgAdmin will be available at `http://localhost:5050`
  - Email: `admin@zerppixels.com`
  - Password: `adminpassword`
- Default DB user: `postgres`
- Default DB password: `postgrespassword`

