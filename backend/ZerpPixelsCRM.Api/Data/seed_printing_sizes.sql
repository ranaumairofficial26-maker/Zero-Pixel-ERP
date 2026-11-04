-- 1. Insert 14 Global Presets in the exact required order
INSERT INTO printing_sizes (size_name, width_mm, height_mm, display_order, is_active)
VALUES
    ('A6', 105.00, 148.00, 1, TRUE),
    ('A5', 148.00, 210.00, 2, TRUE),
    ('A4', 210.00, 297.00, 3, TRUE),
    ('A3', 297.00, 420.00, 4, TRUE),
    ('A2', 420.00, 594.00, 5, TRUE),
    ('A1', 594.00, 841.00, 6, TRUE),
    ('DL finished', 99.00, 210.00, 7, TRUE),
    ('C5 envelope', 229.00, 162.00, 8, TRUE),
    ('C4 envelope', 324.00, 229.00, 9, TRUE),
    ('CR80 ID card', 85.60, 54.00, 10, TRUE),
    ('Common 3×6 ft banner', 914.40, 1828.80, 11, TRUE),
    ('Common 8×4 ft board', 2438.40, 1219.20, 12, TRUE),
    ('Common roll-up', 850.00, 2000.00, 13, TRUE),
    ('Custom Size', NULL, NULL, 999, TRUE)
ON CONFLICT (size_name) DO UPDATE SET
    width_mm = EXCLUDED.width_mm,
    height_mm = EXCLUDED.height_mm,
    display_order = EXCLUDED.display_order;

-- 2. Link items to matching global sizes or insert item-specific sizes
DO $$
DECLARE
    r RECORD;
    matching_size_id INTEGER;
    item_size_name VARCHAR(150);
BEGIN
    FOR r IN SELECT item_id, item_name, default_width_mm, default_height_mm, mm_str, inches_str FROM printing_items WHERE default_width_mm IS NOT NULL AND default_height_mm IS NOT NULL LOOP
        -- Check if it matches any existing preset within 1 mm
        SELECT size_id INTO matching_size_id 
        FROM printing_sizes 
        WHERE (ABS(width_mm - r.default_width_mm) <= 1.0 AND ABS(height_mm - r.default_height_mm) <= 1.0)
           OR (ABS(width_mm - r.default_height_mm) <= 1.0 AND ABS(height_mm - r.default_width_mm) <= 1.0)
        ORDER BY display_order LIMIT 1;

        IF matching_size_id IS NOT NULL THEN
            -- Link item to this existing global size
            INSERT INTO printing_item_sizes (printing_item_id, size_id, is_default)
            VALUES (r.item_id, matching_size_id, TRUE)
            ON CONFLICT (printing_item_id, size_id) DO NOTHING;
        ELSE
            -- Create an item-specific size preset
            item_size_name := r.item_name || ' (' || r.default_width_mm || ' × ' || r.default_height_mm || ' mm)';
            
            INSERT INTO printing_sizes (size_name, width_mm, height_mm, display_order, is_active)
            VALUES (item_size_name, r.default_width_mm, r.default_height_mm, 100, TRUE)
            ON CONFLICT (size_name) DO NOTHING
            RETURNING size_id INTO matching_size_id;

            IF matching_size_id IS NULL THEN
                SELECT size_id INTO matching_size_id FROM printing_sizes WHERE size_name = item_size_name;
            END IF;

            IF matching_size_id IS NOT NULL THEN
                INSERT INTO printing_item_sizes (printing_item_id, size_id, is_default)
                VALUES (r.item_id, matching_size_id, TRUE)
                ON CONFLICT (printing_item_id, size_id) DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END $$;

