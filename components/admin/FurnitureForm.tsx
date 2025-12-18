'use client'

import { useState, useEffect, useRef } from 'react'
import { FurnitureItem } from '@/data/furniture'

interface FurnitureFormProps {
  item: FurnitureItem | null
  categories: string[]
  onSave: (item: FurnitureItem) => void
  onCancel: () => void
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Helper function to check if string is a URL
const isUrl = (str: string): boolean => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export default function FurnitureForm({ item, categories, onSave, onCancel }: FurnitureFormProps) {
  const [formData, setFormData] = useState<Omit<FurnitureItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: categories[0] || '',
    image: '',
    images: [],
    inStock: true,
  })

  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload')
  const [additionalImageInputMode, setAdditionalImageInputMode] = useState<'upload' | 'url'>('upload')
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string>('')
  
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        images: item.images || [],
        inStock: item.inStock,
      })
      
      // Determine if main image is URL or base64
      if (item.image) {
        setImageInputMode(isUrl(item.image) ? 'url' : 'upload')
      }
      
      // Separate URLs and base64 images
      const urls: string[] = []
      const base64Images: string[] = []
      item.images?.forEach(img => {
        if (isUrl(img)) {
          urls.push(img)
        } else {
          base64Images.push(img)
        }
      })
      setAdditionalImages(base64Images)
      setAdditionalImageUrls(urls.join('\n'))
      setAdditionalImageInputMode(urls.length > 0 && base64Images.length === 0 ? 'url' : 'upload')
    }
  }, [item])

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      try {
        const base64 = await fileToBase64(file)
        setFormData({ ...formData, image: base64 })
        setImageInputMode('upload')
      } catch (error) {
        alert('Error uploading image')
        console.error(error)
      }
    }
  }

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      return true
    })

    try {
      const base64Images = await Promise.all(validFiles.map(fileToBase64))
      setAdditionalImages([...additionalImages, ...base64Images])
      setAdditionalImageInputMode('upload')
    } catch (error) {
      alert('Error uploading images')
      console.error(error)
    }
  }

  const handleRemoveMainImage = () => {
    setFormData({ ...formData, image: '' })
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ''
    }
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Combine uploaded images and URL images
    const urlImages = additionalImageUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
    
    const allImages = [...additionalImages, ...urlImages]
    
    const itemToSave: FurnitureItem = {
      id: item?.id || 0,
      ...formData,
      images: allImages.length > 0 ? allImages : undefined,
    }

    onSave(itemToSave)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? 'Edit Furniture Item' : 'Add New Furniture Item'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description (HTML supported)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (£) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="New category"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const newCategory = e.currentTarget.value.trim()
                      if (newCategory && !categories.includes(newCategory)) {
                        setFormData({ ...formData, category: newCategory })
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image *
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  imageInputMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  imageInputMode === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Use URL
              </button>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
              </div>
            ) : (
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            )}

            {formData.image && (
              <div className="mt-4 relative inline-block">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-48 w-48 object-cover rounded border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAdditionalImageInputMode('upload')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  additionalImageInputMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setAdditionalImageInputMode('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  additionalImageInputMode === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Use URLs
              </button>
            </div>

            {additionalImageInputMode === 'upload' ? (
              <div>
                <input
                  ref={additionalImagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB per image</p>
                
                {/* Display uploaded images */}
                {additionalImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Additional ${index + 1}`}
                          className="h-24 w-24 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                value={additionalImageUrls}
                onChange={(e) => setAdditionalImageUrls(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">In Stock</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.image}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                formData.image
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

