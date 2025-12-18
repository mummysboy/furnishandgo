'use client'

import { FurnitureItem } from '@/data/furniture'
import FurnitureCard from './FurnitureCard'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
// Icons as inline SVG components

interface CategoryCarouselProps {
  category: string
  items: FurnitureItem[]
  onItemClick?: (item: FurnitureItem) => void
  limit?: number // Number of items to show (e.g., 2.5)
  showSeeAll?: boolean // Whether to show "See Collection" button
}

export default function CategoryCarousel({ category, items, onItemClick, limit, showSeeAll = false }: CategoryCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Limit items if limit is provided
  // For 2.5, we show 3 items but clip the third one
  const itemCount = limit ? Math.ceil(limit) : items.length
  const displayedItems = limit ? items.slice(0, itemCount) : items
  const hasMoreItems = limit ? items.length > itemCount : false

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [displayedItems])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      const scrollTo = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="mb-16">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{category}</h3>
        <p className="text-gray-600">
          Explore our curated selection of {category.toLowerCase()} furniture
        </p>
      </div>

      <div className="relative">
        {/* Left scroll button - only show if not limited */}
        {canScrollLeft && !limit && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors hidden md:block"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 items-stretch"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            ...(limit && { 
              overflowX: 'hidden',
              // Calculate width to show exactly 2.5 items: (2 * 320px) + (2 * 24px gaps) + (0.5 * 320px) = 848px
              maxWidth: limit === 2.5 ? '848px' : undefined
            }),
          }}
        >
          {displayedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-80 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FurnitureCard 
                item={item} 
                onClick={() => onItemClick?.(item)}
              />
            </div>
          ))}
        </div>

        {/* Right scroll button - only show if not limited */}
        {canScrollRight && !limit && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors hidden md:block"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* See Collection button */}
      {showSeeAll && hasMoreItems && (
        <div className="mt-6 text-center">
          <Link
            href={`/collection?category=${encodeURIComponent(category)}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1"
          >
            See Collection
          </Link>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

