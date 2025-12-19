-- Migration to restore subcategory parent-child relationships
-- This fixes the issue where all categories became top-level after deletion
-- Run this if subcategories lose their parent relationships

-- Update Dining subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Dining' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Dining Tables', 'Dining Chairs', 'Dining Sets')
  AND parent_category_id IS NULL;

-- Update Seating subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Seating' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Sofas', 'Armchairs', 'Recliners')
  AND parent_category_id IS NULL;

-- Update Storage subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Storage' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Bookshelves', 'Cabinets', 'Wardrobes')
  AND parent_category_id IS NULL;

-- Update Bedroom subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Bedroom' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Beds', 'Bedside Tables', 'Dressers')
  AND parent_category_id IS NULL;

-- Update Tables subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Tables' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Coffee Tables', 'Side Tables')
  AND parent_category_id IS NULL;

-- Update Kitchen Appliances subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Kitchen Appliances' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Refrigerators', 'Ovens', 'Dishwashers')
  AND parent_category_id IS NULL;

-- Update Furniture Packages subcategories
UPDATE categories 
SET parent_category_id = (SELECT id FROM categories WHERE name = 'Furniture Packages' AND parent_category_id IS NULL LIMIT 1)
WHERE name IN ('Starter Packages', 'Complete Packages')
  AND parent_category_id IS NULL;

