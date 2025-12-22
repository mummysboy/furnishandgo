-- Migration: Add subcategory column to furniture_items table
-- This allows products to have both a parent category and a subcategory

-- Add subcategory column (nullable, since existing items may not have subcategories)
ALTER TABLE furniture_items 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Create index for faster queries on subcategory
CREATE INDEX IF NOT EXISTS idx_furniture_items_subcategory ON furniture_items(subcategory);

-- Migrate existing data: If category is a subcategory, move it to subcategory column
-- and set category to its parent category
DO $$
DECLARE
  item_record RECORD;
  parent_category_name VARCHAR(100);
BEGIN
  -- Loop through all furniture items
  FOR item_record IN SELECT id, category FROM furniture_items LOOP
    -- Check if the category is a subcategory (has a parent)
    SELECT c_parent.name INTO parent_category_name
    FROM categories c
    LEFT JOIN categories c_parent ON c.parent_category_id = c_parent.id
    WHERE c.name = item_record.category
    AND c.parent_category_id IS NOT NULL;
    
    -- If we found a parent, update the item
    IF parent_category_name IS NOT NULL THEN
      UPDATE furniture_items
      SET 
        category = parent_category_name,
        subcategory = item_record.category
      WHERE id = item_record.id;
    END IF;
  END LOOP;
END $$;

-- Add comment to explain the columns
COMMENT ON COLUMN furniture_items.category IS 'Parent category name (e.g., "Dining", "Seating")';
COMMENT ON COLUMN furniture_items.subcategory IS 'Subcategory name (e.g., "Dining Tables", "Sofas"). NULL if item only has a parent category.';

