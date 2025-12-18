-- Seed script to populate initial furniture data
-- Run this after creating the schema

-- Insert categories first
INSERT INTO categories (name) VALUES
  ('Dining'),
  ('Seating'),
  ('Storage'),
  ('Bedroom'),
  ('Tables'),
  ('Kitchen Appliances'),
  ('Furniture Packages')
ON CONFLICT (name) DO NOTHING;

-- Insert furniture items
INSERT INTO furniture_items (name, description, price, category, image, images, in_stock, quantity) VALUES
  ('The Shabbos Table', 'A proper dining table that''s seen more challah than you can shake a stick at. Solid oak, seats eight comfortably (or twelve if your bubbe insists on squeezing everyone in). This isn''t just furniture—it''s where memories are made, and where your mother-in-law will definitely comment on your cooking.', 899.00, 'Dining', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop'], true, 1),
  ('The Kvetch-Free Sofa', 'So comfortable, even your most <em>frum</em> relative won''t find anything to complain about. Three-seater in premium fabric that repels both stains and unwanted opinions. Comes with built-in support for long Shabbos afternoons and even longer family visits.', 1299.00, 'Seating', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop'], true, 1),
  ('The Shtetl Bookshelf', 'Holds all your books, your grandmother''s photo frames, and your collection of <em>mishloach manot</em> baskets. Made from reclaimed wood with character—much like your family. Each shelf is strong enough to hold generations of wisdom (and a few questionable decorative items).', 449.00, 'Storage', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop'], true, 1),
  ('The Mitzvah Bed', 'A bed so comfortable, sleeping in on Shabbos morning feels like a <em>mitzvah</em>. King-size with a solid frame that won''t squeak when you roll over (important for maintaining <em>shalom bayit</em>). Includes space underneath for storage, or for hiding from your mother''s phone calls.', 1599.00, 'Bedroom', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop'], true, 1),
  ('The Chutzpah Coffee Table', 'Bold enough to be the centrepiece of your living room, practical enough to hold your <em>Shabbos</em> candles and your remote control. Glass top, solid wood base. It''s got <em>chutzpah</em>, but in a good way—like that cousin who always brings the best <em>kugel</em>.', 349.00, 'Tables', 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop'], true, 1)
ON CONFLICT DO NOTHING;

-- Note: This is a sample seed. You can add more items or use the migration script to import all items from the TypeScript data file.

