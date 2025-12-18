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
    quantity: 1,
  })

  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [additionalImageUrlList, setAdditionalImageUrlList] = useState<string[]>([])
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload')
  const [additionalImageInputMode, setAdditionalImageInputMode] = useState<'upload' | 'url'>('upload')
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    let completed = 0
    let total = 5 // name, description, price, category, image
    
    if (formData.name.trim()) completed++
    if (formData.description.trim()) completed++
    if (formData.price > 0) completed++
    if (formData.category) completed++
    if (formData.image) completed++
    
    return Math.round((completed / total) * 100)
  }

  // Validation
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return "A name would be helpful. Just saying."
        }
        if (value.trim().length > 100) {
          return "That's a bit much. Let's keep it under 100 characters, shall we?"
        }
        return ''
      case 'description':
        if (!value || value.trim().length === 0) {
          return "Customers like to know what they're buying. Revolutionary, I know."
        }
        if (value.trim().length < 20) {
          return "A bit sparse, no? Give us at least 20 characters of compelling prose."
        }
        if (value.trim().length > 1000) {
          return "War and Peace was a novel. This is a furniture description. Please adjust accordingly."
        }
        return ''
      case 'price':
        if (!value || value <= 0) {
          return "Free furniture? How generous. Unfortunately, that's not how capitalism works."
        }
        if (value > 100000) {
          return "Even the finest furniture shouldn't cost more than a small car. Dial it back."
        }
        return ''
      case 'image':
        if (!value) {
          return "A picture is worth a thousand words. We need one. Words are optional."
        }
        if (imageInputMode === 'url' && !isUrl(value)) {
          return "That's not a URL. We checked. Twice."
        }
        return ''
      default:
        return ''
    }
  }

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
        quantity: item.quantity ?? 1,
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
      setAdditionalImageUrlList(urls)
      setAdditionalImageUrls(urls.join('\n'))
      setAdditionalImageInputMode(urls.length > 0 && base64Images.length === 0 ? 'url' : 'upload')
    }
  }, [item])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel, isSubmitting])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError('')
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" is trying to be bigger than 5MB. That's too ambitious for a JPEG.`)
        return
      }
      if (!file.type.startsWith('image/')) {
        setUploadError(`"${file.name}" appears to not be an image. PDFs don't count, even if they're pretty.`)
        return
      }
      try {
        const base64 = await fileToBase64(file)
        setFormData({ ...formData, image: base64 })
        setImageInputMode('upload')
        setErrors({ ...errors, image: '' })
      } catch (error) {
        setUploadError('Something went wrong. The file might be cursed. Try a different one.')
        console.error(error)
      }
    }
  }

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadError('')
    if (files.length === 0) return

    const errors: string[] = []
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`"${file.name}" is too large (max 5MB)`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        errors.push(`"${file.name}" is not an image file`)
        return false
      }
      return true
    })

    if (errors.length > 0) {
      setUploadError(errors.length === 1 
        ? errors[0] 
        : `${errors.length} files had issues: ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? '...' : ''}`)
    }

    if (validFiles.length > 0) {
      try {
        const base64Images = await Promise.all(validFiles.map(fileToBase64))
        setAdditionalImages([...additionalImages, ...base64Images])
        setAdditionalImageInputMode('upload')
        // Clear the input so users can upload more if needed
        if (additionalImagesInputRef.current) {
          additionalImagesInputRef.current.value = ''
        }
      } catch (error) {
        setUploadError('Upload failed. The internet might be having feelings. Try again.')
        console.error(error)
      }
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

  const handleRemoveAdditionalImageUrl = (index: number) => {
    const newUrls = additionalImageUrlList.filter((_, i) => i !== index)
    setAdditionalImageUrlList(newUrls)
    setAdditionalImageUrls(newUrls.join('\n'))
  }

  const handleAdditionalImageUrlsChange = (value: string) => {
    setAdditionalImageUrls(value)
    const urls = value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && isUrl(url))
    setAdditionalImageUrlList(urls)
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    const error = validateField(field, value)
    if (error) {
      setErrors({ ...errors, [field]: error })
    } else {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    const nameError = validateField('name', formData.name)
    const descError = validateField('description', formData.description)
    const priceError = validateField('price', formData.price)
    const imageError = validateField('image', formData.image)
    
    if (nameError) newErrors.name = nameError
    if (descError) newErrors.description = descError
    if (priceError) newErrors.price = priceError
    if (imageError) newErrors.image = imageError
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return // Don't submit if there are errors
    }
    
    setIsSubmitting(true)
    
    // Combine uploaded images and URL images
    const allImages = [...additionalImages, ...additionalImageUrlList]
    
    const itemToSave: FurnitureItem = {
      id: item?.id || 0,
      ...formData,
      images: allImages.length > 0 ? allImages : undefined,
    }

    // Small delay for UX (feels more responsive)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    onSave(itemToSave)
    setIsSubmitting(false)
  }

  const completionPercentage = getCompletionPercentage()
  const isFormValid = Object.keys(errors).length === 0 && formData.name && formData.description && formData.price > 0 && formData.image

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {item ? 'Edit Furniture Item' : 'Add New Furniture Item'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Form completion: {completionPercentage}%</span>
              <span className={isFormValid ? 'text-green-600 font-medium' : ''}>
                {isFormValid ? 'Ready to save ✓' : 'Not quite there yet...'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
              <span className="text-gray-400 font-normal ml-2 text-xs">
                (What to call this thing)
              </span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => {
                const error = validateField('name', formData.name)
                if (error) setErrors({ ...errors, name: error })
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., The Kvetch-Free Sofa"
              maxLength={100}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.name && (
                <p className="text-xs text-red-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {formData.name.length}/100
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
              <span className="text-gray-400 font-normal ml-2 text-xs">
                (Sell it with words, but make it snappy)
              </span>
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={() => {
                const error = validateField('description', formData.description)
                if (error) setErrors({ ...errors, description: error })
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe your furniture piece with wit, charm, and perhaps a touch of Yiddish. Minimum 20 characters. We're not asking for a novel, just enough to convince someone this isn't junk."
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description && (
                <p className="text-xs text-red-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description}
                </p>
              )}
              <span className={`text-xs ml-auto ${
                formData.description.length < 20 ? 'text-gray-400' : 
                formData.description.length > 1000 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {formData.description.length}/1000
                {formData.description.length < 20 && (
                  <span className="ml-1">({20 - formData.description.length} more needed)</span>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (£) *
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  (The number that makes it valuable)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  required
                  min="0"
                  max="100000"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                    handleFieldChange('price', isNaN(value) ? 0 : value)
                  }}
                  onBlur={() => {
                    const error = validateField('price', formData.price)
                    if (error) setErrors({ ...errors, price: error })
                  }}
                  className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.price}
                </p>
              )}
              {formData.price > 0 && !errors.price && (
                <p className="text-xs text-gray-500 mt-1">
                  That's {formData.price.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}. 
                  {formData.price < 50 && ' A bargain, or possibly a typo?'}
                  {formData.price > 5000 && ' Premium pricing. Hope it comes with a warranty.'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  (Where it belongs)
                </span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Can't find the right category? We'll add it automatically. Don't worry, we've got this.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
              <span className="text-gray-400 font-normal ml-2 text-xs">
                (How many are available)
              </span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={formData.quantity || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                handleFieldChange('quantity', isNaN(value) ? 0 : value)
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              The number of items available in stock.
            </p>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image *
              <span className="text-gray-400 font-normal ml-2 text-xs">
                (A picture of the thing, preferably a good one)
              </span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setImageInputMode('upload')
                  setUploadError('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  imageInputMode === 'upload'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📤 Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageInputMode('url')
                  setUploadError('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  imageInputMode === 'url'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔗 Paste URL
              </button>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => {
                    handleFieldChange('image', e.target.value)
                    if (e.target.value && !isUrl(e.target.value)) {
                      setErrors({ ...errors, image: "That's not a URL. We checked. Twice." })
                    } else {
                      const newErrors = { ...errors }
                      delete newErrors.image
                      setErrors(newErrors)
                    }
                  }}
                  onBlur={() => {
                    const error = validateField('image', formData.image)
                    if (error) setErrors({ ...errors, image: error })
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg (Yes, the full URL. We're picky.)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make sure the URL actually works. Broken links make everyone sad.
                </p>
              </div>
            )}

            {(uploadError || errors.image) && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {uploadError || errors.image}
                </p>
              </div>
            )}

            {formData.image && !uploadError && !errors.image && (
              <div className="mt-4 relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-48 w-48 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                    onError={(e) => {
                      setErrors({ ...errors, image: "That image doesn't seem to exist. Or the internet is having a moment." })
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-all shadow-lg hover:scale-110"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Main image
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Images
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  (Optional. But more angles = fewer returns. Just saying.)
                </span>
              </label>
              {(additionalImages.length > 0 || additionalImageUrlList.length > 0) && (
                <span className="text-sm font-semibold text-blue-600">
                  {additionalImages.length + additionalImageUrlList.length} total
                </span>
              )}
            </div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setAdditionalImageInputMode('upload')
                  setUploadError('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  additionalImageInputMode === 'upload'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📤 Upload Files
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdditionalImageInputMode('url')
                  setUploadError('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  additionalImageInputMode === 'url'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔗 Paste URLs
              </button>
            </div>

            {additionalImageInputMode === 'upload' ? (
              <div>
                <label 
                  htmlFor="additional-images-upload"
                  className="block cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
                    if (files.length > 0 && additionalImagesInputRef.current) {
                      const dataTransfer = new DataTransfer()
                      files.forEach(file => dataTransfer.items.add(file))
                      additionalImagesInputRef.current.files = dataTransfer.files
                      handleAdditionalImagesUpload({ target: additionalImagesInputRef.current } as any)
                    }
                  }}
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Multiple images • PNG, JPG, GIF up to 5MB each</p>
                    {additionalImages.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        Click again to add more photos ({additionalImages.length} already added)
                      </p>
                    )}
                  </div>
                  <input
                    id="additional-images-upload"
                    ref={additionalImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                  />
                </label>

                {uploadError && additionalImageInputMode === 'upload' && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {uploadError}
                    </p>
                  </div>
                )}
                
                {/* Display uploaded images */}
                {(additionalImages.length > 0 || additionalImageUrlList.length > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-3">
                      Total additional images: <span className="font-semibold text-gray-900">{additionalImages.length + additionalImageUrlList.length}</span>
                      {additionalImages.length + additionalImageUrlList.length > 20 && ' — That\'s quite the gallery!'}
                    </p>
                  </div>
                )}

                {additionalImages.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        {additionalImages.length} uploaded photo{additionalImages.length !== 1 ? 's' : ''}
                        {additionalImages.length > 15 && ' — Impressive dedication to documentation.'}
                        {additionalImages.length > 30 && ' — Are you sure you need this many?'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (additionalImagesInputRef.current) {
                            additionalImagesInputRef.current.click()
                          }
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add More
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square">
                            <img
                              src={img}
                              alt={`Additional ${index + 1}`}
                              className="h-full w-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            title="Remove image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  rows={5}
                  value={additionalImageUrls}
                  onChange={(e) => handleAdditionalImageUrlsChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg&#10;&#10;(One URL per line. Paste as many as you want. We'll sort it out.)"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    One URL per line. Valid URLs are automatically detected.
                  </p>
                  {additionalImageUrlList.length > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      {additionalImageUrlList.length} valid URL{additionalImageUrlList.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                {/* Display URL images preview */}
                {additionalImageUrlList.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        {additionalImageUrlList.length} URL image{additionalImageUrlList.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {additionalImageUrlList.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square">
                            <img
                              src={url}
                              alt={`URL image ${index + 1}`}
                              className="h-full w-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EBroken%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImageUrl(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            title="Remove image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                            <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => handleFieldChange('inStock', e.target.checked)}
                className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 block">In Stock</span>
                <span className="text-xs text-gray-500">
                  {formData.inStock 
                    ? "Customers can buy this. Great for business."
                    : "Mark as out of stock if it's been sold, discontinued, or is just having a moment."
                  }
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <div className="flex items-center gap-4">
              {!isFormValid && (
                <span className="text-xs text-gray-500 hidden sm:block">
                  {Object.keys(errors).length > 0 
                    ? `${Object.keys(errors).length} error${Object.keys(errors).length !== 1 ? 's' : ''} to fix`
                    : 'Fill in all required fields to continue'
                  }
                </span>
              )}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`px-8 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  item ? 'Update Item ✓' : 'Add Item ✓'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

