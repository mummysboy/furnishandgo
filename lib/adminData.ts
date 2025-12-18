import { FurnitureItem } from '@/data/furniture'
import { furnitureItems as defaultFurnitureItems } from '@/data/furniture'

const STORAGE_KEY = 'furnish-and-go-admin-data'

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
  } catch (error) {
    console.error('Error resetting furniture data:', error)
  }
}

export function getCategories(items: FurnitureItem[]): string[] {
  return Array.from(new Set(items.map(item => item.category))).sort()
}

