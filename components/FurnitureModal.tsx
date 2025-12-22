'use client'

import { FurnitureItem } from '@/data/furniture'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
// Icons as inline SVG components

interface FurnitureModalProps {
  item: FurnitureItem | null
  isOpen: boolean
  onClose: () => void
}

export default function FurnitureModal({ item, isOpen, onClose }: FurnitureModalProps) {
  const { addToCart } = useCart()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const images = item?.images || (item?.image ? [item.image] : [])

  useEffect(() => {
    if (isOpen && item) {
      setCurrentImageIndex(0)
    }
  }, [isOpen, item])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleAddToCart = () => {
    if (!item.inStock) return
    
    setIsAdding(true)
    addToCart(item)
    
    setTimeout(() => {
      setIsAdding(false)
    }, 300)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-slide-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Carousel Section */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
          {images.length > 0 && (
            <>
              <div className="relative w-full h-full">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${item.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
          <div className="mb-4">
            <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
              {item.category}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{item.name}</h2>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(item.price)}</span>
                <span className="text-sm text-gray-600">+VAT</span>
              </div>
              {item.inStock && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  In Stock
                  {(item.quantity ?? 0) > 0 && (
                    <span className="ml-2">({item.quantity} available)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!item.inStock || isAdding}
            className={`w-full ${
              item.inStock
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 ${
              isAdding ? 'scale-95 bg-green-600 hover:bg-green-600' : ''
            }`}
          >
            {isAdding ? 'Added to Cart!' : item.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}

