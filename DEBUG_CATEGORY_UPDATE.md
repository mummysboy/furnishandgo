# Debugging Category/Subcategory Update Issue

## Steps to Debug

### 1. Check if Migration Was Run

First, verify that the `subcategory` column exists in your database:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run this query:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'furniture_items' 
AND column_name = 'subcategory';
```

If this returns no rows, you need to run the migration:
- Execute the SQL in `supabase/add-subcategory-column.sql`

### 2. Check Browser Console

When you edit an item's category/subcategory:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Edit an item and save
4. Look for log messages like:
   - "Updating furniture item: ..."
   - "Successfully updated furniture item: ..."
   - Any error messages

### 3. Verify Database Update

After saving an item, check the database directly:

1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Open `furniture_items` table
4. Find the item you just edited
5. Verify:
   - `category` field shows the parent category
   - `subcategory` field shows the subcategory (or NULL if none)

### 4. Check Category Page Filtering

The category page filters items based on:
- Parent category: Shows items where `category = parent` OR `subcategory` belongs to that parent
- Subcategory: Shows items where `subcategory = subcategory name`

### 5. Common Issues

**Issue: Column doesn't exist**
- Solution: Run the migration `supabase/add-subcategory-column.sql`

**Issue: Update succeeds but item doesn't appear**
- Solution: Refresh the category page (the page loads data on mount, so it needs a refresh)

**Issue: Item appears in wrong category**
- Check: Verify the `category` field is set to the parent category, not the subcategory
- Check: Verify the `subcategory` field is set correctly

**Issue: Console shows errors**
- Check the error message - it will tell you what's wrong
- Common errors:
  - "column does not exist" → Run migration
  - "permission denied" → Check RLS policies
  - "item not found" → Item ID mismatch

### 6. Test the Update Function

You can test if the update is working by:

1. Edit an item in admin panel
2. Change its category/subcategory
3. Save
4. Check browser console for success/error messages
5. Go to Supabase Table Editor and verify the change
6. Navigate to the category page and refresh to see if it appears

### 7. Force Refresh

If the item was updated in the database but doesn't appear on the category page:
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Or navigate away and back to the category page

