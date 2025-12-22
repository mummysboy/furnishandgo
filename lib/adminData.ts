import { FurnitureItem } from '@/data/furniture'
import { supabase } from './supabase'

// Category type with subcategory support
export interface Category {
  id: number
  name: string
  parent_category_id: number | null
  created_at?: string
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[]
}

// Helper to check if Supabase is configured
function ensureSupabaseConfigured(): void {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. See SUPABASE_SETUP.md for instructions.'
    )
  }
}

// Convert database row to FurnitureItem
function dbRowToFurnitureItem(row: any): FurnitureItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    category: row.category,
    subcategory: row.subcategory || undefined,
    image: row.image,
    images: row.images || undefined,
    inStock: row.in_stock,
    quantity: row.quantity || 0,
  }
}

// Convert FurnitureItem to database insert/update format
function furnitureItemToDbRow(item: FurnitureItem): any {
  return {
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    subcategory: item.subcategory || null,
    image: item.image,
    images: item.images || null,
    in_stock: item.inStock,
    quantity: item.quantity || 0,
  }
}

// Get furniture items from Supabase
export async function getFurnitureItems(): Promise<FurnitureItem[]> {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from('furniture_items')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching furniture items from Supabase:', error)
    throw new Error(`Failed to fetch furniture items: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(dbRowToFurnitureItem)
}

// Update a single furniture item in Supabase
export async function updateFurnitureItem(item: FurnitureItem): Promise<void> {
  ensureSupabaseConfigured()

  try {
    const dbRow = furnitureItemToDbRow(item)
    
    console.log('Updating furniture item:', { 
      id: item.id, 
      category: item.category, 
      subcategory: item.subcategory,
      dbRow: { ...dbRow, images: dbRow.images ? `${dbRow.images.length} images` : 'no images' }
    })
    
    // First, verify the item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from('furniture_items')
      .select('id, category, subcategory')
      .eq('id', item.id)
      .single()

    if (fetchError || !existingItem) {
      throw new Error(`Item with id ${item.id} not found`)
    }

    console.log('Existing item before update:', existingItem)
    
    const { error, data } = await supabase
      .from('furniture_items')
      .update(dbRow)
      .eq('id', item.id)
      .select()

    if (error) {
      console.error('Error updating furniture item:', error)
      // Check if it's a column error (subcategory column might not exist)
      if (error.message.includes('subcategory') || error.message.includes('column')) {
        throw new Error(`Database column error: ${error.message}. Please run the migration: supabase/add-subcategory-column.sql`)
      }
      throw new Error(`Failed to update furniture item: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error('Update succeeded but no data returned')
    }

    console.log('Successfully updated furniture item:', data[0])

    // Verify the update worked
    const { data: verifiedItem } = await supabase
      .from('furniture_items')
      .select('id, category, subcategory')
      .eq('id', item.id)
      .single()

    console.log('Verified item after update:', verifiedItem)

    // Update categories if needed
    const items = await getFurnitureItems()
    await updateCategoriesFromItems(items)
  } catch (error) {
    console.error('Error updating furniture item:', error)
    throw error
  }
}

// Save furniture items to Supabase
export async function saveFurnitureItems(items: FurnitureItem[]): Promise<void> {
  ensureSupabaseConfigured()

  try {
    // Use upsert (insert or update) for each item
    // This is more efficient and handles updates correctly
    const dbRows = items.map(item => ({
      ...furnitureItemToDbRow(item),
      id: item.id, // Preserve ID if it exists
    }))

    const { error: upsertError } = await supabase
      .from('furniture_items')
      .upsert(dbRows, { onConflict: 'id' })

    if (upsertError) {
      console.error('Error upserting furniture items:', upsertError)
      throw new Error(`Failed to save furniture items: ${upsertError.message}`)
    }

    // Update categories
    await updateCategoriesFromItems(items)
  } catch (error) {
    console.error('Error saving to Supabase:', error)
    throw error
  }
}

// Reset furniture items
export async function resetFurnitureItems(): Promise<void> {
  ensureSupabaseConfigured()

  const { error } = await supabase
    .from('furniture_items')
    .delete()
    .neq('id', 0)

  if (error) {
    console.error('Error resetting furniture items in Supabase:', error)
    throw new Error(`Failed to reset furniture items: ${error.message}`)
  }
}

// Get all categories from Supabase (returns just names for backward compatibility)
export async function getCategories(): Promise<string[]> {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .is('parent_category_id', null) // Only top-level categories
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories from Supabase:', error)
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  if (!data || data.length === 0) {
    // If no categories in database, get from furniture items
    const items = await getFurnitureItems()
    const itemCategories = Array.from(new Set(items.map(item => item.category)))
    return itemCategories.sort()
  }

  return data.map(row => row.name).sort()
}

// Get all categories with full structure
export async function getCategoriesFull(): Promise<Category[]> {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories from Supabase:', error)
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    parent_category_id: row.parent_category_id || null,
    created_at: row.created_at,
  }))
}

// Get categories with their subcategories
export async function getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
  try {
    const allCategories = await getCategoriesFull()
    
    // Get top-level categories (no parent)
    const topLevelCategories = allCategories.filter(cat => !cat.parent_category_id)
    
    // Build structure with subcategories
    return topLevelCategories.map(category => ({
      ...category,
      subcategories: allCategories.filter(cat => cat.parent_category_id === category.id),
    }))
  } catch (error: any) {
    // If the error is about missing column, provide helpful message
    if (error.message && error.message.includes('parent_category_id')) {
      console.error('Subcategories not set up. Please run the migration: supabase/add-subcategories.sql')
      throw new Error('Subcategories feature requires database migration. Please run supabase/add-subcategories.sql in your Supabase SQL Editor.')
    }
    throw error
  }
}

// Get subcategories for a specific category
export async function getSubcategories(parentCategoryId: number): Promise<Category[]> {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_category_id', parentCategoryId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching subcategories from Supabase:', error)
    throw new Error(`Failed to fetch subcategories: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    parent_category_id: row.parent_category_id || null,
    created_at: row.created_at,
  }))
}

// Get category by name (can be parent or subcategory)
export async function getCategoryByName(name: string): Promise<Category | null> {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching category from Supabase:', error)
    throw new Error(`Failed to fetch category: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    name: data.name,
    parent_category_id: data.parent_category_id || null,
    created_at: data.created_at,
  }
}

// Get parent category name for a given category name (returns the name itself if it's a parent)
export async function getParentCategoryName(categoryName: string): Promise<string> {
  ensureSupabaseConfigured()

  // First, try to find the category
  const category = await getCategoryByName(categoryName)
  if (!category) {
    // If category doesn't exist in database, return the name as-is (fallback)
    return categoryName
  }

  // If it's a parent category (no parent_category_id), return the name itself
  if (!category.parent_category_id) {
    return category.name
  }

  // If it's a subcategory, get the parent category
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .eq('id', category.parent_category_id)
    .single()

  if (error || !data) {
    // Fallback to the original name if parent not found
    return categoryName
  }

  return data.name
}

// Get a map of category names to their parent category names
export async function getCategoryToParentMap(): Promise<Map<string, string>> {
  const allCategories = await getCategoriesFull()
  const categoryMap = new Map<string, string>()

  for (const category of allCategories) {
    if (category.parent_category_id) {
      // It's a subcategory, find its parent
      const parent = allCategories.find(cat => cat.id === category.parent_category_id)
      if (parent) {
        categoryMap.set(category.name, parent.name)
      } else {
        // Fallback: use the category name itself
        categoryMap.set(category.name, category.name)
      }
    } else {
      // It's a parent category, map to itself
      categoryMap.set(category.name, category.name)
    }
  }

  return categoryMap
}

// Save categories
export async function saveCategories(categories: string[]): Promise<void> {
  ensureSupabaseConfigured()

  try {
    // Delete existing categories and insert new ones
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('Error deleting categories:', deleteError)
      throw new Error(`Failed to delete categories: ${deleteError.message}`)
    }

    const categoryRows = categories.map(name => ({ name }))
    const { error: insertError } = await supabase
      .from('categories')
      .insert(categoryRows)

    if (insertError) {
      console.error('Error inserting categories:', insertError)
      throw new Error(`Failed to save categories: ${insertError.message}`)
    }
  } catch (error) {
    console.error('Error saving categories to Supabase:', error)
    throw error
  }
}

// Update categories from items
async function updateCategoriesFromItems(items: FurnitureItem[]): Promise<void> {
  ensureSupabaseConfigured()
  
  // Get the full category structure (including subcategories)
  const allExistingCategories = await getCategoriesFull()
  const itemCategories = Array.from(new Set(items.map(item => item.category)))
  
  // Get existing top-level category names
  const existingTopLevelNames = allExistingCategories
    .filter(cat => !cat.parent_category_id)
    .map(cat => cat.name)
  
  // Get all existing category names (both parent and subcategories)
  const allExistingNames = allExistingCategories.map(cat => cat.name)
  
  // Find new categories that don't exist yet
  const newCategories = itemCategories.filter(catName => !allExistingNames.includes(catName))
  
  // Only add new top-level categories (don't touch existing structure)
  for (const newCategoryName of newCategories) {
    if (!existingTopLevelNames.includes(newCategoryName)) {
      // This is a new top-level category, add it
      try {
        const { error } = await supabase
          .from('categories')
          .insert({ name: newCategoryName.trim(), parent_category_id: null })
        
        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error adding new category:', error)
        }
      } catch (error) {
        console.error('Error adding new category:', error)
      }
    }
  }
  
  // Don't delete or modify existing categories - preserve subcategory structure
}

// Add a new category (top-level)
export async function addCategory(category: string): Promise<void> {
  if (!category.trim()) return

  ensureSupabaseConfigured()

  const categories = await getCategories()
  if (!categories.includes(category.trim())) {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: category.trim(), parent_category_id: null })

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error adding category to Supabase:', error)
        throw new Error(`Failed to add category: ${error.message}`)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }
}

// Add a subcategory
export async function addSubcategory(parentCategoryId: number, subcategoryName: string): Promise<void> {
  if (!subcategoryName.trim()) return

  ensureSupabaseConfigured()

  // Check if parent category exists
  const { data: parentCategory, error: parentError } = await supabase
    .from('categories')
    .select('id')
    .eq('id', parentCategoryId)
    .single()

  if (parentError || !parentCategory) {
    throw new Error(`Parent category not found`)
  }

  // Check if subcategory already exists for this parent
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', subcategoryName.trim())
    .eq('parent_category_id', parentCategoryId)
    .single()

  if (existing) {
    return // Already exists
  }

  try {
    const { error } = await supabase
      .from('categories')
      .insert({ name: subcategoryName.trim(), parent_category_id: parentCategoryId })

    if (error) {
      console.error('Error adding subcategory to Supabase:', error)
      throw new Error(`Failed to add subcategory: ${error.message}`)
    }
  } catch (error) {
    console.error('Error adding subcategory:', error)
    throw error
  }
}

// Remove a category (will also delete subcategories due to CASCADE)
export async function removeCategory(category: string, deleteItems: boolean = false): Promise<{ success: boolean; deletedItemsCount: number }> {
  ensureSupabaseConfigured()

  // Get category ID
  const categoryData = await getCategoryByName(category)
  if (!categoryData) {
    return { success: false, deletedItemsCount: 0 }
  }

  const items = await getFurnitureItems()
  const itemsInCategory = items.filter(item => item.category === category)
  const itemCount = itemsInCategory.length

  if (itemCount > 0 && !deleteItems) {
    return { success: false, deletedItemsCount: 0 }
  }

  if (itemCount > 0 && deleteItems) {
    const updatedItems = items.filter(item => item.category !== category)
    await saveFurnitureItems(updatedItems)
  }

  // Remove from categories table (CASCADE will delete subcategories)
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryData.id)

    if (error) {
      console.error('Error deleting category from Supabase:', error)
      throw new Error(`Failed to delete category: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }

  return { success: true, deletedItemsCount: itemCount }
}

// Remove a subcategory
export async function removeSubcategory(subcategoryId: number, deleteItems: boolean = false): Promise<{ success: boolean; deletedItemsCount: number }> {
  ensureSupabaseConfigured()

  // Get subcategory
  const { data: subcategory, error: fetchError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', subcategoryId)
    .single()

  if (fetchError || !subcategory) {
    return { success: false, deletedItemsCount: 0 }
  }

  const items = await getFurnitureItems()
  // Find items with this subcategory (check both subcategory field and category field for backward compatibility)
  const itemsInSubcategory = items.filter(item => 
    item.subcategory === subcategory.name || 
    (item.category === subcategory.name && !item.subcategory) // backward compatibility
  )
  const itemCount = itemsInSubcategory.length

  if (itemCount > 0 && !deleteItems) {
    return { success: false, deletedItemsCount: 0 }
  }

  if (itemCount > 0 && deleteItems) {
    // Remove items that have this subcategory
    const updatedItems = items.filter(item => 
      item.subcategory !== subcategory.name && 
      !(item.category === subcategory.name && !item.subcategory) // backward compatibility
    )
    await saveFurnitureItems(updatedItems)
  }

  // Remove subcategory
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', subcategoryId)

    if (error) {
      console.error('Error deleting subcategory from Supabase:', error)
      throw new Error(`Failed to delete subcategory: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    throw error
  }

  return { success: true, deletedItemsCount: itemCount }
}

// Rename a category
export async function renameCategory(oldName: string, newName: string): Promise<void> {
  if (!newName.trim() || oldName === newName.trim()) return

  ensureSupabaseConfigured()

  const categories = await getCategories()
  if (categories.includes(newName.trim()) && newName.trim() !== oldName) {
    return // Category already exists
  }

  // Update items
  const items = await getFurnitureItems()
  const updatedItems = items.map(item =>
    item.category === oldName
      ? { ...item, category: newName.trim() }
      : item
  )
  await saveFurnitureItems(updatedItems)

  // Update categories table
  try {
    // Delete old category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('name', oldName)

    if (deleteError) {
      console.error('Error deleting old category:', deleteError)
    }

    // Insert new category
    const { error: insertError } = await supabase
      .from('categories')
      .insert({ name: newName.trim() })

    if (insertError && insertError.code !== '23505') {
      console.error('Error inserting new category:', insertError)
    }
  } catch (error) {
    console.error('Error renaming category in Supabase:', error)
    // Don't throw - items are already updated
  }

  // Update categories list
  const updatedCategories = categories.map(cat =>
    cat === oldName ? newName.trim() : cat
  ).sort()
  await saveCategories(updatedCategories)
}

// Check inventory availability
export async function checkInventoryAvailability(cartItems: Array<{ id: number; quantity: number; name?: string }>): Promise<Array<{ id: number; name: string; requestedQuantity: number; availableQuantity: number; reason: 'out_of_stock' | 'insufficient_quantity' }>> {
  const items = await getFurnitureItems()
  const unavailableItems: Array<{ id: number; name: string; requestedQuantity: number; availableQuantity: number; reason: 'out_of_stock' | 'insufficient_quantity' }> = []

  cartItems.forEach(cartItem => {
    const item = items.find(i => i.id === cartItem.id)

    if (!item) {
      unavailableItems.push({
        id: cartItem.id,
        name: cartItem.name || `Item #${cartItem.id}`,
        requestedQuantity: cartItem.quantity,
        availableQuantity: 0,
        reason: 'out_of_stock'
      })
      return
    }

    if (!item.inStock || (item.quantity ?? 0) === 0) {
      unavailableItems.push({
        id: item.id,
        name: item.name,
        requestedQuantity: cartItem.quantity,
        availableQuantity: 0,
        reason: 'out_of_stock'
      })
      return
    }

    const availableQuantity = item.quantity ?? 0
    if (availableQuantity < cartItem.quantity) {
      unavailableItems.push({
        id: item.id,
        name: item.name,
        requestedQuantity: cartItem.quantity,
        availableQuantity: availableQuantity,
        reason: 'insufficient_quantity'
      })
    }
  })

  return unavailableItems
}

// Decrement stock quantities
export async function decrementStockQuantities(cartItems: Array<{ id: number; quantity: number }>): Promise<void> {
  ensureSupabaseConfigured()

  const items = await getFurnitureItems()

  // Update each item's quantity in Supabase
  for (const cartItem of cartItems) {
    const item = items.find(i => i.id === cartItem.id)
    if (item) {
      const newQuantity = Math.max(0, (item.quantity ?? 0) - cartItem.quantity)
      const { error } = await supabase
        .from('furniture_items')
        .update({
          quantity: newQuantity,
          in_stock: newQuantity > 0
        })
        .eq('id', item.id)

      if (error) {
        console.error(`Error updating stock for item ${item.id}:`, error)
        throw new Error(`Failed to update stock for item ${item.id}: ${error.message}`)
      }
    }
  }
}
