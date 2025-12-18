'use client'

import { useState } from 'react'
import { furnitureItems, FurnitureItem } from '@/data/furniture'
import CategoryCarousel from './CategoryCarousel'
import FurnitureModal from './FurnitureModal'

export default function FurnitureGrid() {
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    // Small delay to allow modal close animation
    setTimeout(() => {
      setSelectedItem(null)
    }, 300)
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

          {/* Category Carousels */}
          {Object.entries(furnitureByCategory).map(([category, items]) => (
            <CategoryCarousel
              key={category}
              category={category}
              items={items}
              onItemClick={handleCardClick}
              limit={2.5}
              showSeeAll={true}
            />
          ))}
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

