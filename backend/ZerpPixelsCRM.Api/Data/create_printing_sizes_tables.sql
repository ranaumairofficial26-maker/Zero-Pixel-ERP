-- Create printing_sizes table
CREATE TABLE IF NOT EXISTS printing_sizes (
    size_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    size_name VARCHAR(100) NOT NULL UNIQUE,
    width_mm NUMERIC(10,2),
    height_mm NUMERIC(10,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS IX_printing_sizes_name ON printing_sizes(size_name);
CREATE INDEX IF NOT EXISTS IX_printing_sizes_order ON printing_sizes(display_order);

-- Create printing_item_sizes table for product-specific sizes
CREATE TABLE IF NOT EXISTS printing_item_sizes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    printing_item_id INTEGER NOT NULL REFERENCES printing_items(item_id) ON DELETE CASCADE,
    size_id INTEGER NOT NULL REFERENCES printing_sizes(size_id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT UQ_printing_item_size UNIQUE (printing_item_id, size_id)
);

CREATE INDEX IF NOT EXISTS IX_printing_item_sizes_item ON printing_item_sizes(printing_item_id);
CREATE INDEX IF NOT EXISTS IX_printing_item_sizes_size ON printing_item_sizes(size_id);

