'use client'

import { useState, useEffect } from 'react'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems, getCategoriesWithSubcategories, CategoryWithSubcategories } from '@/lib/adminData'
import CategoryCarousel from './CategoryCarousel'
import FurnitureModal from './FurnitureModal'
import FurnitureLoader from './FurnitureLoader'

export default function FurnitureGrid() {
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([])
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<CategoryWithSubcategories[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFurniture = async () => {
      try {
        const [items, categoriesData] = await Promise.all([
          getFurnitureItems(),
          getCategoriesWithSubcategories()
        ])
        setFurnitureItems(items)
        setCategoriesWithSubs(categoriesData)
        setError(null)
      } catch (error: any) {
        console.error('Error loading furniture:', error)
        setError(error.message || 'Failed to load furniture items. Please check your Supabase configuration.')
      } finally {
        setIsLoading(false)
      }
    }
    loadFurniture()
  }, [])

  // Create a map of category name (subcategory or parent) to parent category name
  const categoryToParentMap = new Map<string, string>()
  
  categoriesWithSubs.forEach(parentCategory => {
    // Map parent to itself
    categoryToParentMap.set(parentCategory.name, parentCategory.name)
    // Map each subcategory to its parent
    parentCategory.subcategories.forEach(sub => {
      categoryToParentMap.set(sub.name, parentCategory.name)
    })
  })

  // Group furniture by parent category (aggregate all subcategory products under parent)
  // IMPORTANT: Only show parent categories, never subcategories directly
  const furnitureByParentCategory = furnitureItems.reduce((acc, item) => {
    // Use item.category as the parent category (it should now always be the parent)
    // For backward compatibility, check if category is actually a subcategory
    let parentCategoryName = item.category
    
    // If item has a subcategory, category should be the parent
    // If not, check if category is actually a subcategory (backward compatibility)
    if (!item.subcategory) {
      const mappedParent = categoryToParentMap.get(item.category)
      if (mappedParent && mappedParent !== item.category) {
        // It's a subcategory stored in category field (old data)
        parentCategoryName = mappedParent
      }
    }
    
    // Only include items that have a valid parent category
    if (parentCategoryName) {
      if (!acc[parentCategoryName]) {
        acc[parentCategoryName] = []
      }
      acc[parentCategoryName].push(item)
    }
    return acc
  }, {} as Record<string, FurnitureItem[]>)

  // Filter to show ONLY parent categories that have items
  // This ensures subcategories are never displayed as separate carousels
  const categoriesToShow = categoriesWithSubs.filter(parentCategory => {
    const items = furnitureByParentCategory[parentCategory.name] || []
    return items.length > 0
  })

  const handleCardClick = (item: FurnitureItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Small delay to allow modal close animation
    setTimeout(() => {
      setSelectedItem(null)
    }, 300)
  }

  if (error) {
    return (
      <section id="furniture" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">Error Loading Furniture</h3>
                <p className="text-red-700 mt-2">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Please check your Supabase configuration. See <code className="bg-red-100 px-1 rounded">SUPABASE_SETUP.md</code> for instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section id="furniture" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FurnitureLoader />
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="furniture" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-colors duration-300">
              Our Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto transition-colors duration-300">
              Each piece is chosen with care, because life&apos;s too short for <em>shoddy</em> furniture.
              <br />
              <span className="text-sm text-gray-500 italic mt-2 block">
                (And yes, we deliver. No <em>tsuris</em>.)
              </span>
            </p>
          </div>

          {/* Category Carousels - Show only parent categories with all subcategory products aggregated */}
          {categoriesToShow.map((parentCategory) => {
            // Get all items for this parent category (aggregated from all subcategories)
            const allItems = furnitureByParentCategory[parentCategory.name] || []
            
            return (
              <CategoryCarousel
                key={parentCategory.id}
                category={parentCategory.name}
                items={allItems}
                onItemClick={handleCardClick}
                showSeeAll={true}
              />
            )
          })}
        </div>
      </section>

      <FurnitureModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

