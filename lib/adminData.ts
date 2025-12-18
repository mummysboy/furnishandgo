import { FurnitureItem } from '@/data/furniture'
import { furnitureItems as defaultFurnitureItems } from '@/data/furniture'

const STORAGE_KEY = 'furnish-and-go-admin-data'
const CATEGORIES_KEY = 'furnish-and-go-categories'

// Get default categories from furniture items
function getDefaultCategories(): string[] {
  return Array.from(new Set(defaultFurnitureItems.map(item => item.category))).sort()
}

export function getFurnitureItems(): FurnitureItem[] {
  if (typeof window === 'undefined') {
    return defaultFurnitureItems
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading stored furniture data:', error)
  }

  return defaultFurnitureItems
}

export function saveFurnitureItems(items: FurnitureItem[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    // Update categories to include any new categories from items
    updateCategoriesFromItems(items)
  } catch (error) {
    console.error('Error saving furniture data:', error)
  }
}

export function resetFurnitureItems(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CATEGORIES_KEY)
  } catch (error) {
    console.error('Error resetting furniture data:', error)
  }
}

// Get all categories (including empty ones)
export function getCategories(): string[] {
  if (typeof window === 'undefined') {
    return getDefaultCategories()
  }

  try {
    const stored = localStorage.getItem(CATEGORIES_KEY)
    if (stored) {
      const storedCategories = JSON.parse(stored)
      // Merge with categories from items to ensure we have all
      const items = getFurnitureItems()
      const itemCategories = Array.from(new Set(items.map(item => item.category)))
      const allCategories = Array.from(new Set([...storedCategories, ...itemCategories])).sort()
      return allCategories
    }
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  // If no stored categories, get from default items
  return getDefaultCategories()
}

// Save categories list
export function saveCategories(categories: string[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  } catch (error) {
    console.error('Error saving categories:', error)
  }
}

// Update categories from items (add any new categories found in items)
function updateCategoriesFromItems(items: FurnitureItem[]): void {
  const currentCategories = getCategories()
  const itemCategories = Array.from(new Set(items.map(item => item.category)))
  const allCategories = Array.from(new Set([...currentCategories, ...itemCategories])).sort()
  saveCategories(allCategories)
}

// Add a new category
export function addCategory(category: string): void {
  if (!category.trim()) return
  
  const categories = getCategories()
  if (!categories.includes(category.trim())) {
    const updated = [...categories, category.trim()].sort()
    saveCategories(updated)
  }
}

// Remove a category (and all items in that category)
export function removeCategory(category: string, deleteItems: boolean = false): { success: boolean; deletedItemsCount: number } {
  const items = getFurnitureItems()
  const itemsInCategory = items.filter(item => item.category === category)
  const itemCount = itemsInCategory.length
  
  // If category has items and we're not deleting them, return early
  if (itemCount > 0 && !deleteItems) {
    return { success: false, deletedItemsCount: 0 }
  }
  
  // Remove items in this category if deleteItems is true
  if (itemCount > 0 && deleteItems) {
    const updatedItems = items.filter(item => item.category !== category)
    saveFurnitureItems(updatedItems)
  }
  
  // Remove category from categories list
  const categories = getCategories()
  const updated = categories.filter(cat => cat !== category)
  saveCategories(updated)
  
  return { success: true, deletedItemsCount: itemCount }
}

// Rename a category
export function renameCategory(oldName: string, newName: string): void {
  if (!newName.trim() || oldName === newName.trim()) return
  
  const categories = getCategories()
  if (categories.includes(newName.trim()) && newName.trim() !== oldName) {
    return // Category already exists
  }
  
  // Update items
  const items = getFurnitureItems()
  const updatedItems = items.map(item => 
    item.category === oldName 
      ? { ...item, category: newName.trim() }
      : item
  )
  saveFurnitureItems(updatedItems)
  
  // Update categories list
  const updatedCategories = categories.map(cat => 
    cat === oldName ? newName.trim() : cat
  ).sort()
  saveCategories(updatedCategories)
}

// Decrement stock quantities for items sold in an order
// cartItems should be an array of objects with id and quantity (cart quantity)
export function decrementStockQuantities(cartItems: Array<{ id: number; quantity: number }>): void {
  const items = getFurnitureItems()
  const updatedItems = items.map(item => {
    const cartItem = cartItems.find(ci => ci.id === item.id)
    if (cartItem) {
      const newQuantity = Math.max(0, (item.quantity ?? 0) - cartItem.quantity)
      return {
        ...item,
        quantity: newQuantity,
        inStock: newQuantity > 0 // Update inStock status based on new quantity
      }
    }
    return item
  })
  saveFurnitureItems(updatedItems)
}

