-- =========================================================
-- Zerp Pixels CRM - Seed Data
-- Engine: PostgreSQL 14+
-- =========================================================

INSERT INTO "Customers" ("Name", "Email", "Phone", "Company", "Status", "CreatedAt")
VALUES 
('Ali Khan', 'ali.khan@example.com', '+92 300 1234567', 'Alpha Tech Solutions', 'Active', CURRENT_TIMESTAMP),
('Sara Ahmed', 'sara.ahmed@example.com', '+92 321 7654321', 'Creative Studios', 'Active', CURRENT_TIMESTAMP),
('Usman Tariq', 'usman.tariq@example.com', '+92 333 9988776', 'Nexus Logistics', 'Inactive', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "Leads" ("Title", "ContactName", "Email", "Phone", "EstimatedValue", "Stage", "CreatedAt")
VALUES 
('Website Redesign Project', 'Bilal Hussain', 'bilal@innovate.pk', '+92 301 5556677', 150000.00, 'Qualified', CURRENT_TIMESTAMP),
('Enterprise CRM Implementation', 'Ayesha Malik', 'ayesha@globalretail.pk', '+92 302 4443322', 450000.00, 'Proposal', CURRENT_TIMESTAMP),
('Mobile App Development', 'Hamza Rauf', 'hamza@startuphub.io', '+92 345 1122334', 280000.00, 'New', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

