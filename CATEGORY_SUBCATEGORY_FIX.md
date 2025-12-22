# Category and Subcategory Fix

## Problem
When assigning a product a subcategory, it was overriding the category field, causing the subcategory to become the category. This happened because the `furniture_items` table only had a single `category` column that stored either the parent category OR the subcategory, but not both.

## Solution
Added a separate `subcategory` column to the `furniture_items` table to store subcategories separately from parent categories. Now:
- `category` field stores the **parent category** (e.g., "Dining", "Seating")
- `subcategory` field stores the **subcategory** (e.g., "Dining Tables", "Sofas") - optional

## Changes Made

### 1. Database Migration
- Created `supabase/add-subcategory-column.sql` migration file
- Adds `subcategory` column to `furniture_items` table
- Migrates existing data: if an item's category is a subcategory, it moves it to the subcategory column and sets category to the parent

### 2. TypeScript Interface
- Updated `FurnitureItem` interface in `data/furniture.ts` to include optional `subcategory` field

### 3. Database Operations
- Updated `lib/adminData.ts`:
  - `dbRowToFurnitureItem()` now reads subcategory from database
  - `furnitureItemToDbRow()` now writes subcategory to database

### 4. Admin Form
- Updated `components/admin/FurnitureForm.tsx`:
  - Form now has separate controls for category (parent) and subcategory
  - When selecting a parent category, it sets `category` to the parent
  - When selecting a subcategory, it sets `category` to parent and `subcategory` to the selected subcategory
  - Handles backward compatibility with existing data

### 5. Category Page Filtering
- Updated `app/category/[slug]/page.tsx`:
  - Filtering now uses both `category` and `subcategory` fields
  - When viewing a parent category, shows items where category matches OR subcategory belongs to that parent
  - When viewing a subcategory, shows only items with that subcategory
  - Includes backward compatibility for items with old data structure

### 6. Display Components
- `FurnitureCard` and `FurnitureModal` already display `item.category`, which now correctly shows the parent category
- Updated `FurnitureGrid` to properly handle the new structure

## How to Apply

1. **Run the database migration:**
   ```sql
   -- Execute the migration in your Supabase SQL Editor
   -- File: supabase/add-subcategory-column.sql
   ```

2. **The code changes are already in place** - no additional steps needed

3. **For existing products:**
   - The migration automatically moves subcategories from `category` to `subcategory` column
   - Products will now correctly show parent categories
   - You can edit products in the admin panel to assign subcategories if needed

## Testing

1. Create a new product and assign it a parent category and subcategory
2. Verify the product shows the parent category in listings
3. Navigate to a parent category page - should show all items from that category and its subcategories
4. Navigate to a subcategory page - should show only items with that specific subcategory
5. Filter by subcategory on a parent category page - should work correctly

## Backward Compatibility

The code includes backward compatibility for existing data:
- Items with subcategory stored in `category` field are automatically handled
- The migration moves old data to the new structure
- Display components work with both old and new data structures

