-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create furniture_items table
CREATE TABLE IF NOT EXISTS furniture_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT NOT NULL,
  images TEXT[],
  in_stock BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_furniture_items_category ON furniture_items(category);
CREATE INDEX IF NOT EXISTS idx_furniture_items_in_stock ON furniture_items(in_stock);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_furniture_items_updated_at
  BEFORE UPDATE ON furniture_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE furniture_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to furniture_items"
  ON furniture_items
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  USING (true);

-- Create policies for public write access (INSERT, UPDATE, DELETE)
-- NOTE: In production, you should replace these with authenticated admin policies
-- For now, these allow public write access for development purposes

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

-- Production recommendation:
-- Replace the above INSERT/UPDATE/DELETE policies with authenticated admin policies:
-- 
-- CREATE POLICY "Allow authenticated admin to modify furniture_items"
--   ON furniture_items
--   FOR ALL
--   USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT user_id FROM admin_users));
--
-- CREATE POLICY "Allow authenticated admin to modify categories"
--   ON categories
--   FOR ALL
--   USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT user_id FROM admin_users));

