import { FurnitureItem } from '@/data/furniture'
import { supabase } from './supabase'

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

// Save furniture items to Supabase
export async function saveFurnitureItems(items: FurnitureItem[]): Promise<void> {
  ensureSupabaseConfigured()

  try {
    // Delete all existing items and insert new ones
    // Note: In production, you might want to do upserts instead
    const { error: deleteError } = await supabase
      .from('furniture_items')
      .delete()
      .neq('id', 0) // Delete all (this works because id > 0)

    if (deleteError) {
      console.error('Error deleting existing items:', deleteError)
      throw new Error(`Failed to delete existing items: ${deleteError.message}`)
    }

    // Insert all items
    const dbRows = items.map(item => ({
      ...furnitureItemToDbRow(item),
      id: item.id, // Preserve ID if it exists
    }))

    const { error: insertError } = await supabase
      .from('furniture_items')
      .insert(dbRows)

    if (insertError) {
      console.error('Error inserting furniture items:', insertError)
      throw new Error(`Failed to save furniture items: ${insertError.message}`)
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

// Get all categories from Supabase
export async function getCategories(): Promise<string[]> {
  ensureSupabaseConfigured()

  const { data, error } = await supabase
    .from('categories')
    .select('name')
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
  const currentCategories = await getCategories()
  const itemCategories = Array.from(new Set(items.map(item => item.category)))
  const allCategories = Array.from(new Set([...currentCategories, ...itemCategories])).sort()
  await saveCategories(allCategories)
}

// Add a new category
export async function addCategory(category: string): Promise<void> {
  if (!category.trim()) return

  ensureSupabaseConfigured()

  const categories = await getCategories()
  if (!categories.includes(category.trim())) {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: category.trim() })

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

// Remove a category
export async function removeCategory(category: string, deleteItems: boolean = false): Promise<{ success: boolean; deletedItemsCount: number }> {
  ensureSupabaseConfigured()

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

  // Remove from categories table
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', category)

    if (error) {
      console.error('Error deleting category from Supabase:', error)
      throw new Error(`Failed to delete category: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }

  const categories = await getCategories()
  const updated = categories.filter(cat => cat !== category)
  await saveCategories(updated)

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
