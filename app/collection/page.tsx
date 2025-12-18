'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems } from '@/lib/adminData'
import CategoryCarousel from '@/components/CategoryCarousel'
import FurnitureModal from '@/components/FurnitureModal'

export default function CollectionPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([])

  useEffect(() => {
    // Get category from URL search params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const category = params.get('category')
      setSelectedCategory(category)
      setFurnitureItems(getFurnitureItems())
    }
  }, [])

  // Group furniture by category
  const furnitureByCategory = furnitureItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, FurnitureItem[]>)

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

  // Filter categories if a specific category is selected
  const categoriesToShow = selectedCategory
    ? Object.entries(furnitureByCategory).filter(([category]) => category === selectedCategory)
    : Object.entries(furnitureByCategory)

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
      <Header />
      <section className="py-20 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-colors duration-300">
              {selectedCategory ? `${selectedCategory} Collection` : 'Full Collection'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto transition-colors duration-300">
              {selectedCategory
                ? `Browse our complete selection of ${selectedCategory.toLowerCase()} furniture`
                : 'Explore our complete range of furniture, organized by category'}
            </p>
          </div>

          {/* Category Carousels - Show all items */}
          {categoriesToShow.map(([category, items]) => (
            <CategoryCarousel
              key={category}
              category={category}
              items={items}
              onItemClick={handleCardClick}
            />
          ))}
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

