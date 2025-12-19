'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems, getCategoriesWithSubcategories, getCategoryToParentMap } from '@/lib/adminData'
import FurnitureModal from '@/components/FurnitureModal'
import CategorySidebar from '@/components/CategorySidebar'
import Link from 'next/link'
import FurnitureCard from '@/components/FurnitureCard'
import FurnitureLoader from '@/components/FurnitureLoader'

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params?.slug as string
  const decodedCategory = categorySlug ? decodeURIComponent(categorySlug) : null

  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([])
  const [categoryData, setCategoryData] = useState<{ id: number; name: string } | null>(null)
  const [categoryToParentMap, setCategoryToParentMap] = useState<Map<string, string>>(new Map())
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<Array<{ id: number; name: string; subcategories: Array<{ id: number; name: string }> }>>([])
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('price-asc')
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 })
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!decodedCategory) return

      try {
        setIsLoading(true)
        const [items, categoriesWithSubsData, categoryMap] = await Promise.all([
          getFurnitureItems(),
          getCategoriesWithSubcategories(),
          getCategoryToParentMap()
        ])
        
        setFurnitureItems(items)
        setCategoryToParentMap(categoryMap)
        setCategoriesWithSubs(categoriesWithSubsData)
        
        // Find the category (could be parent or subcategory)
        const category = categoriesWithSubsData.find(cat => cat.name === decodedCategory) ||
          categoriesWithSubsData.flatMap(cat => cat.subcategories).find(sub => sub.name === decodedCategory)
        
        if (category) {
          setCategoryData({
            id: category.id,
            name: category.name
          })
        } else {
          setError(`Category "${decodedCategory}" not found`)
        }
      } catch (error: any) {
        console.error('Error loading data:', error)
        setError(error.message || 'Failed to load category data.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [decodedCategory])

  // Scroll to top when category changes
  useEffect(() => {
    if (!isLoading && categoryData && typeof window !== 'undefined') {
      // Scroll to top immediately when navigating to a new category
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [decodedCategory, isLoading, categoryData])

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

  // Get available subcategories for the selected category
  const selectedCategory = categoriesWithSubs.find(cat => cat.name === categoryData?.name)
  const availableSubcategories = selectedCategory?.subcategories || []

  // Filter furniture items by category
  // If selected category is a parent category, show items from parent + all subcategories
  // If selected category is a subcategory, show only items from that subcategory
  const categoryFilteredItems = categoryData 
    ? furnitureItems.filter(item => {
        // Direct match - item's category matches selected category
        if (item.category === categoryData.name) return true
        
        // Check if selected category is a parent category
        if (selectedCategory) {
          // Selected is a parent category - include items from all its subcategories
          const subcategoryNames = selectedCategory.subcategories.map(sub => sub.name)
          if (subcategoryNames.includes(item.category)) return true
        }
        
        // Also check if item's category's parent matches the selected category
        // This handles cases where items might be stored with subcategory names
        const itemParentCategory = categoryToParentMap.get(item.category)
        if (itemParentCategory === categoryData.name) return true
        
        return false
      })
    : []

  // Apply additional filters (subcategories and price range)
  const filteredItems = categoryFilteredItems.filter(item => {
    // Subcategory filter
    if (selectedSubcategories.size > 0) {
      if (!selectedSubcategories.has(item.category)) return false
    }
    
    // Price range filter
    if (item.price < priceRange.min || item.price > priceRange.max) return false
    
    return true
  })

  // Calculate price range from filtered items
  const priceStats = categoryFilteredItems.length > 0
    ? {
        min: Math.min(...categoryFilteredItems.map(item => item.price)),
        max: Math.max(...categoryFilteredItems.map(item => item.price))
      }
    : { min: 0, max: 10000 }

  // Initialize price range when category changes
  useEffect(() => {
    if (categoryFilteredItems.length > 0) {
      const stats = {
        min: Math.min(...categoryFilteredItems.map(item => item.price)),
        max: Math.max(...categoryFilteredItems.map(item => item.price))
      }
      setPriceRange({
        min: stats.min,
        max: stats.max
      })
      // Reset subcategory filters when category changes
      setSelectedSubcategories(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryData?.name])

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

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
                  <h3 className="text-lg font-semibold text-red-800">Error Loading Category</h3>
                  <p className="text-red-700 mt-2">{error}</p>
                  <Link
                    href="/furniture"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back to Collection
                  </Link>
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

  if (!categoryData) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
        <Header />
        <section className="py-20 bg-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
              <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
              <Link
                href="/furniture"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Collection
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
      <Header />
      {/* Sidebar */}
      <CategorySidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <section className="pt-2 lg:pt-0 lg:absolute lg:top-16 lg:left-0 lg:right-0 lg:bottom-0 lg:overflow-y-auto pb-20 bg-white min-h-screen">
        <div className="flex h-full">
          {/* Sidebar spacer - Desktop only (sidebar is fixed/sticky) */}
          <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-80'}`} />

          {/* Main content area - starts immediately on desktop, aligned with sidebar top */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="px-4 sm:px-6 lg:px-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open categories menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Desktop sidebar toggle button - shown when sidebar is collapsed */}
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="hidden lg:flex mb-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Expand categories sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              {/* Header */}
              <div className="mb-1 lg:mb-0 pt-2 lg:pt-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {categoryData.name}
                  </h1>
                  <Link
                    href="/furniture"
                    className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 text-sm transition-colors ml-4"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Link>
                </div>
                <Link
                  href="/furniture"
                  className="md:hidden mt-1 inline-flex items-center text-blue-600 hover:text-blue-700 text-xs transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Collection
                </Link>
              </div>

              {/* Filters and Sort Section */}
              <div className="mb-4 space-y-3">
                {/* Filter Toggle Button */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
                      showFilters
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
                    }`}
                  >
                    <svg className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filters</span>
                    {(selectedSubcategories.size > 0 || priceRange.min !== priceStats.min || priceRange.max !== priceStats.max) && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        showFilters
                          ? 'bg-white text-blue-600'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {selectedSubcategories.size + (priceRange.min !== priceStats.min || priceRange.max !== priceStats.max ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-gray-700">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-4 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6 shadow-lg animate-fade-in">
                    {/* Subcategory Filters */}
                    {availableSubcategories.length > 0 && (
                      <div>
                        <label className="block text-base font-bold text-gray-800 mb-3">
                          Subcategories
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {availableSubcategories.map((subcategory) => {
                            const isSelected = selectedSubcategories.has(subcategory.name)
                            return (
                              <button
                                key={subcategory.id}
                                onClick={() => {
                                  const newSet = new Set(selectedSubcategories)
                                  if (isSelected) {
                                    newSet.delete(subcategory.name)
                                  } else {
                                    newSet.add(subcategory.name)
                                  }
                                  setSelectedSubcategories(newSet)
                                }}
                                className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
                                }`}
                              >
                                {subcategory.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        Price Range: <span className="text-blue-600">${priceRange.min.toFixed(0)}</span> - <span className="text-blue-600">${priceRange.max.toFixed(0)}</span>
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-semibold text-gray-700">Min: ${priceRange.min.toFixed(0)}</label>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min={priceStats.min}
                                max={priceStats.max}
                                value={priceRange.min}
                                onChange={(e) => {
                                  const newMin = parseInt(e.target.value)
                                  setPriceRange({ ...priceRange, min: Math.min(newMin, priceRange.max) })
                                }}
                                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((priceRange.min - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #e5e7eb ${((priceRange.min - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #e5e7eb 100%)`
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-semibold text-gray-700">Max: ${priceRange.max.toFixed(0)}</label>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min={priceStats.min}
                                max={priceStats.max}
                                value={priceRange.max}
                                onChange={(e) => {
                                  const newMax = parseInt(e.target.value)
                                  setPriceRange({ ...priceRange, max: Math.max(newMax, priceRange.min) })
                                }}
                                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((priceRange.max - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #3b82f6 ${((priceRange.max - priceStats.min) / (priceStats.max - priceStats.min)) * 100}%, #3b82f6 100%)`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 pt-2">
                          <span className="bg-gray-100 px-3 py-1.5 rounded-lg">${priceStats.min.toFixed(0)}</span>
                          <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                          <span className="bg-gray-100 px-3 py-1.5 rounded-lg">${priceStats.max.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(selectedSubcategories.size > 0 || priceRange.min !== priceStats.min || priceRange.max !== priceStats.max) && (
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedSubcategories(new Set())
                            setPriceRange({ min: priceStats.min, max: priceStats.max })
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Furniture Items */}
              {sortedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {sortedItems.map((item) => (
                    <FurnitureCard
                      key={item.id}
                      item={item}
                      onClick={() => handleCardClick(item)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-12">
                  No items found in this category.
                </p>
              )}
            </div>
          </div>
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

