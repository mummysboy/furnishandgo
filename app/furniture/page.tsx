'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems, getCategoryToParentMap, getCategories } from '@/lib/adminData'
import CategoryCarousel from '@/components/CategoryCarousel'
import FurnitureModal from '@/components/FurnitureModal'
import FurnitureLoader from '@/components/FurnitureLoader'

export default function FurniturePage() {
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([])
  const [categoryToParentMap, setCategoryToParentMap] = useState<Map<string, string>>(new Map())
  const [parentCategories, setParentCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFurniture = async () => {
      try {
        const [items, categoryMap, parentCats] = await Promise.all([
          getFurnitureItems(),
          getCategoryToParentMap(),
          getCategories()
        ])
        setFurnitureItems(items)
        setCategoryToParentMap(categoryMap)
        setParentCategories(parentCats)
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

  // Group furniture by parent category (not subcategory)
  const furnitureByParentCategory = furnitureItems.reduce((acc, item) => {
    // Get the parent category name for this item's category
    const parentCategoryName = categoryToParentMap.get(item.category) || item.category
    
    if (!acc[parentCategoryName]) {
      acc[parentCategoryName] = []
    }
    acc[parentCategoryName].push(item)
    return acc
  }, {} as Record<string, FurnitureItem[]>)

  // Only show parent categories that have items
  const categoriesToShow = parentCategories.filter(cat => 
    furnitureByParentCategory[cat] && furnitureByParentCategory[cat].length > 0
  )

  const handleCardClick = (item: FurnitureItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedItem(null)
    }, 300)
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
        <Header />
        <section className="py-20 bg-white min-h-screen">
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
        <Footer />
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
        <Header />
        <section className="py-20 bg-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FurnitureLoader />
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
      <Header />
      <section className="py-20 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-colors duration-300">
              Our Collection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto transition-colors duration-300">
              Each piece is chosen with care, because life&apos;s too short for <em>shoddy</em> furniture.
              <br />
              <span className="text-sm text-gray-500 italic mt-2 block">
                (And yes, we deliver. No <em>tsuris</em>.)
              </span>
            </p>
          </div>

          {/* Category Carousels - Only show parent categories */}
          {categoriesToShow.map((category) => {
            const items = furnitureByParentCategory[category] || []
            return (
              <CategoryCarousel
                key={category}
                category={category}
                items={items}
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
      <Footer />
    </main>
  )
}

