'use client'

import { FurnitureItem } from '@/data/furniture'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

interface FurnitureCardProps {
  item: FurnitureItem
  onClick?: () => void
}

export default function FurnitureCard({ item, onClick }: FurnitureCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!item.inStock) return
    
    setIsAdding(true)
    addToCart(item)
    
    // Reset button state after animation
    setTimeout(() => {
      setIsAdding(false)
    }, 300)
  }

  return (
    <div 
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 ease-out overflow-hidden border border-gray-100 animate-fade-in cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-64 overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {item.inStock && (
          <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 group-hover:scale-110 shadow-md">
            In Stock
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide transition-colors duration-300">
            {item.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {item.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 transition-colors duration-300 flex-grow">
          <span dangerouslySetInnerHTML={{ __html: item.description }} />
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-gray-900 transition-all duration-300">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart()
            }}
            disabled={!item.inStock || isAdding}
            className={`${
              item.inStock
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 ${
              isAdding ? 'scale-95 bg-green-600 hover:bg-green-600 animate-bounce-subtle' : 'hover:scale-105'
            }`}
          >
            {isAdding ? 'Added!' : item.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}

