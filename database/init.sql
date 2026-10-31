-- =========================================================
-- Zerp Pixels CRM - Database Initialization Script
-- Engine: PostgreSQL 14+
-- =========================================================

-- Optional: Create Database (run separately if not created)
-- CREATE DATABASE "ZerpPixelsCrmDb";

-- Customers Table
CREATE TABLE IF NOT EXISTS "Customers" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(150) NOT NULL,
    "Email" VARCHAR(150) NOT NULL,
    "Phone" VARCHAR(50),
    "Company" VARCHAR(150),
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ
);

-- Leads Table
CREATE TABLE IF NOT EXISTS "Leads" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "ContactName" VARCHAR(150) NOT NULL,
    "Email" VARCHAR(150) NOT NULL,
    "Phone" VARCHAR(50),
    "EstimatedValue" NUMERIC(18, 2),
    "Stage" VARCHAR(50) NOT NULL DEFAULT 'New',
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS "IX_Customers_Email" ON "Customers" ("Email");
CREATE INDEX IF NOT EXISTS "IX_Customers_Status" ON "Customers" ("Status");
CREATE INDEX IF NOT EXISTS "IX_Leads_Stage" ON "Leads" ("Stage");

