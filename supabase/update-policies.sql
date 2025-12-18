-- Update RLS policies to allow public write access
-- Run this SQL in your Supabase SQL Editor if you're getting 401 errors on INSERT/UPDATE/DELETE

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public insert to furniture_items" ON furniture_items;
DROP POLICY IF EXISTS "Allow public update to furniture_items" ON furniture_items;
DROP POLICY IF EXISTS "Allow public delete to furniture_items" ON furniture_items;
DROP POLICY IF EXISTS "Allow public insert to categories" ON categories;
DROP POLICY IF EXISTS "Allow public update to categories" ON categories;
DROP POLICY IF EXISTS "Allow public delete to categories" ON categories;

-- Furniture items policies
CREATE POLICY "Allow public insert to furniture_items"
  ON furniture_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to furniture_items"
  ON furniture_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to furniture_items"
  ON furniture_items
  FOR DELETE
  USING (true);

-- Categories policies
CREATE POLICY "Allow public insert to categories"
  ON categories
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to categories"
  ON categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to categories"
  ON categories
  FOR DELETE
  USING (true);

