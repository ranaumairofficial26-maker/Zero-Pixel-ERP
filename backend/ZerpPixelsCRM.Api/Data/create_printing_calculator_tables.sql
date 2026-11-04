-- =========================================================================
-- ZERO PIXEL ERP — PRINTING INTELLIGENCE & DYNAMIC PRINTING CALCULATOR SCHEMA
-- =========================================================================

-- 1. printing_categories
CREATE TABLE IF NOT EXISTS printing_categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(150) NOT NULL UNIQUE,
    source_category_name VARCHAR(150),
    item_count INTEGER NOT NULL DEFAULT 0,
    item_number_range VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS IX_printing_categories_name ON printing_categories(category_name);

-- 2. printing_items
CREATE TABLE IF NOT EXISTS printing_items (
    item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES printing_categories(category_id) ON DELETE RESTRICT,
    source_item_number INTEGER,
    item_name VARCHAR(250) NOT NULL,
    default_width_mm NUMERIC(10,2),
    default_height_mm NUMERIC(10,2),
    inches_str VARCHAR(50),
    cm_str VARCHAR(50),
    mm_str VARCHAR(50),
    sizing_basis VARCHAR(100),
    source_notes TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS IX_printing_items_category_name ON printing_items(category_id, item_name);

-- 3. paper_sizes
CREATE TABLE IF NOT EXISTS paper_sizes (
    paper_size_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    size_name VARCHAR(100) NOT NULL UNIQUE,
    length_inches NUMERIC(10,3),
    width_inches NUMERIC(10,3),
    width_mm NUMERIC(10,2),
    height_mm NUMERIC(10,2),
    size_type VARCHAR(50) NOT NULL DEFAULT 'StockPaper',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS IX_paper_sizes_size_name ON paper_sizes(size_name);

-- 4. printing_materials
CREATE TABLE IF NOT EXISTS printing_materials (
    material_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    material_name VARCHAR(150) NOT NULL UNIQUE,
    default_length NUMERIC(10,3),
    default_width NUMERIC(10,3),
    default_gsm NUMERIC(10,3),
    default_rate_per_kg NUMERIC(18,4),
    default_sheets_per_rim INTEGER DEFAULT 500,
    default_conversion_factor NUMERIC(12,4) DEFAULT 3100,
    pricing_method VARCHAR(50),
    packet_price NUMERIC(18,4),
    sheets_per_packet INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS IX_printing_materials_name ON printing_materials(material_name);

-- 5. material_price_profiles
CREATE TABLE IF NOT EXISTS material_price_profiles (
    profile_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES printing_materials(material_id) ON DELETE RESTRICT,
    paper_size_id INTEGER REFERENCES paper_sizes(paper_size_id) ON DELETE SET NULL,
    variant_name VARCHAR(150),
    gsm NUMERIC(10,3) NOT NULL,
    pricing_method VARCHAR(50) NOT NULL,
    rate_per_kg NUMERIC(18,4),
    conversion_factor NUMERIC(12,4) NOT NULL DEFAULT 3100,
    packet_price NUMERIC(18,4),
    sheets_per_packet INTEGER,
    direct_rim_price NUMERIC(18,4),
    sheets_per_rim INTEGER NOT NULL DEFAULT 500,
    direct_sheet_price NUMERIC(18,4),
    computed_per_sheet_price NUMERIC(18,4) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. cost_categories
CREATE TABLE IF NOT EXISTS cost_categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(150) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    default_calculation_method VARCHAR(50),
    default_rate NUMERIC(18,4),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. printing_cost_estimates
CREATE TABLE IF NOT EXISTS printing_cost_estimates (
    estimate_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estimate_number VARCHAR(50) NOT NULL UNIQUE,
    job_title VARCHAR(250) NOT NULL,
    product_type VARCHAR(100),
    printing_category_id INTEGER REFERENCES printing_categories(category_id) ON DELETE SET NULL,
    printing_item_id INTEGER REFERENCES printing_items(item_id) ON DELETE SET NULL,
    material_id INTEGER REFERENCES printing_materials(material_id) ON DELETE SET NULL,
    paper_size_id INTEGER REFERENCES paper_sizes(paper_size_id) ON DELETE SET NULL,
    printing_side VARCHAR(50),
    color_mode VARCHAR(50),
    job_description TEXT,
    notes TEXT,
    specifications_snapshot JSONB,
    material_pricing_snapshot JSONB,
    profit_percentage NUMERIC(8,2) NOT NULL DEFAULT 20,
    fixed_profit_amount NUMERIC(18,2),
    profit_calculation_method VARCHAR(50) NOT NULL DEFAULT 'Percentage',
    tax_percentage NUMERIC(8,2) NOT NULL DEFAULT 0,
    tax_calculation_method VARCHAR(50) NOT NULL DEFAULT 'OnSubtotal',
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS IX_printing_cost_estimates_estimate_number ON printing_cost_estimates(estimate_number);
CREATE INDEX IF NOT EXISTS IX_printing_cost_estimates_category ON printing_cost_estimates(printing_category_id);
CREATE INDEX IF NOT EXISTS IX_printing_cost_estimates_item ON printing_cost_estimates(printing_item_id);

-- 8. estimate_quantities
CREATE TABLE IF NOT EXISTS estimate_quantities (
    estimate_quantity_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estimate_id BIGINT NOT NULL REFERENCES printing_cost_estimates(estimate_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    sheets_required NUMERIC(12,2) NOT NULL,
    wastage_percentage NUMERIC(8,2) NOT NULL DEFAULT 0,
    paper_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS IX_estimate_quantities_estimate_id ON estimate_quantities(estimate_id);

-- 9. estimate_cost_items
CREATE TABLE IF NOT EXISTS estimate_cost_items (
    cost_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estimate_quantity_id BIGINT NOT NULL REFERENCES estimate_quantities(estimate_quantity_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES cost_categories(category_id) ON DELETE SET NULL,
    expense_name_snapshot VARCHAR(150) NOT NULL,
    calculation_method VARCHAR(50) NOT NULL,
    unit_rate NUMERIC(18,4) NOT NULL DEFAULT 0,
    units NUMERIC(12,3) NOT NULL DEFAULT 1,
    amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS IX_estimate_cost_items_quantity_id ON estimate_cost_items(estimate_quantity_id);

-- 10. estimate_results
CREATE TABLE IF NOT EXISTS estimate_results (
    result_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estimate_quantity_id BIGINT NOT NULL UNIQUE REFERENCES estimate_quantities(estimate_quantity_id) ON DELETE CASCADE,
    paper_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
    additional_expenses NUMERIC(18,4) NOT NULL DEFAULT 0,
    production_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
    profit_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    subtotal NUMERIC(18,4) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    grand_total NUMERIC(18,4) NOT NULL DEFAULT 0,
    per_piece_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

