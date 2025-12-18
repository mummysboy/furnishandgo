'use client'

import { useState, useEffect } from 'react'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems, getCategories, addCategory, removeCategory, renameCategory } from '@/lib/adminData'

interface DeleteConfirmModalProps {
  isOpen: boolean
  category: string
  itemCount: number
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({ isOpen, category, itemCount, onConfirm, onCancel }: DeleteConfirmModalProps) {
  if (!isOpen) return null

  const funnyMessages = [
    `Oy vey! You're about to delete "${category}" and ${itemCount} item${itemCount !== 1 ? 's' : ''}. That's a lot of <em>tsuris</em>!`,
    `Bubbe would <em>kvetch</em> if she knew you're deleting "${category}" and ${itemCount} item${itemCount !== 1 ? 's' : ''}!`,
    `Are you <em>meshugge</em>? Deleting "${category}" means ${itemCount} item${itemCount !== 1 ? 's are' : ' is'} getting the boot!`,
    `This is <em>chutzpah</em>! You're deleting "${category}" and ${itemCount} item${itemCount !== 1 ? 's' : ''}? No turning back!`,
  ]

  const [randomMessage] = useState(() => funnyMessages[Math.floor(Math.random() * funnyMessages.length)])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {itemCount > 0 ? '⚠️ Hold Your Horses!' : 'Delete Category?'}
          </h3>
          <div className="text-gray-700">
            {itemCount > 0 ? (
              <div>
                <p className="mb-3" dangerouslySetInnerHTML={{ __html: randomMessage }} />
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-orange-800 font-semibold">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-orange-700 mt-1 list-disc list-inside">
                    <li>Category: <strong>"{category}"</strong></li>
                    <li>{itemCount} furniture item{itemCount !== 1 ? 's' : ''}</li>
                  </ul>
                  <p className="text-xs text-orange-600 mt-2 italic">
                    This action cannot be undone. No take-backs!
                  </p>
                </div>
              </div>
            ) : (
              <p>Are you sure you want to delete the category <strong>"{category}"</strong>?</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            {itemCount > 0 ? 'Yes, Delete Everything' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategoryManager() {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [items, cats] = await Promise.all([
          getFurnitureItems(),
          getCategories()
        ])
        setFurniture(items)
        setCategories(cats)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<{ old: string; new: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: string; itemCount: number }>({
    isOpen: false,
    category: '',
    itemCount: 0,
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Get categories with item counts
  const categoriesWithCounts = furniture.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0
    }
    acc[item.category]++
    return acc
  }, {} as Record<string, number>)

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) {
      alert('Please enter a category name')
      return
    }
    
    if (categories.includes(trimmed)) {
      alert('This category already exists.')
      return
    }
    
    await addCategory(trimmed)
    const updatedCats = await getCategories()
    setCategories(updatedCats)
    setNewCategory('')
  }

  const handleRenameCategory = async (oldCategory: string, newCategoryName: string) => {
    if (!newCategoryName.trim() || newCategoryName.trim() === oldCategory) {
      setEditingCategory(null)
      return
    }

    if (categories.includes(newCategoryName.trim()) && newCategoryName.trim() !== oldCategory) {
      alert('This category name already exists.')
      return
    }

    const itemCount = categoriesWithCounts[oldCategory] || 0
    const confirmMessage = itemCount > 0
      ? `Rename "${oldCategory}" to "${newCategoryName.trim()}"? This will update all ${itemCount} item(s) in this category.`
      : `Rename "${oldCategory}" to "${newCategoryName.trim()}"?`

    if (confirm(confirmMessage)) {
      await renameCategory(oldCategory, newCategoryName.trim())
      const [items, cats] = await Promise.all([
        getFurnitureItems(),
        getCategories()
      ])
      setFurniture(items)
      setCategories(cats)
      setEditingCategory(null)
    }
  }

  const handleDeleteClick = (category: string) => {
    const itemCount = categoriesWithCounts[category] || 0
    setDeleteModal({ isOpen: true, category, itemCount })
  }

  const handleDeleteConfirm = async () => {
    const { category, itemCount } = deleteModal
    
    const result = await removeCategory(category, itemCount > 0)
    if (result.success) {
      // Show funny success message
      let successMessages: string[]
      if (result.deletedItemsCount > 0) {
        successMessages = [
          `Poof! "${category}" and ${result.deletedItemsCount} item${result.deletedItemsCount !== 1 ? 's have' : ' has'} vanished faster than <em>challah</em> on Shabbos! 🎉`,
          `Done! "${category}" is gone, along with ${result.deletedItemsCount} item${result.deletedItemsCount !== 1 ? 's' : ''}. No <em>tsuris</em> here! ✨`,
          `Deleted! "${category}" and ${result.deletedItemsCount} item${result.deletedItemsCount !== 1 ? 's' : ''} are now in the <em>Olam Haba</em> of deleted items. 🚀`,
          `Gone! Like your <em>bubbe</em>'s secret <em>kugel</em> recipe, "${category}" and ${result.deletedItemsCount} item${result.deletedItemsCount !== 1 ? 's' : ''} are history! 🎊`,
          `Zapped! "${category}" and ${result.deletedItemsCount} item${result.deletedItemsCount !== 1 ? 's' : ''} have been <em>mensch</em>-fully removed! 💫`,
        ]
      } else {
        successMessages = [
          `Poof! "${category}" has vanished into thin air! ✨`,
          `Deleted! "${category}" is now in the <em>Olam Haba</em> of deleted categories. 🚀`,
          `Gone! "${category}" has been <em>mensch</em>-fully removed! 💫`,
          `Zapped! "${category}" is history! 🎉`,
        ]
      }
      const randomSuccess = successMessages[Math.floor(Math.random() * successMessages.length)]
      
      setSuccessMessage(randomSuccess)
      setShowSuccess(true)
      setDeleteModal({ isOpen: false, category: '', itemCount: 0 })
      
      const [items, cats] = await Promise.all([
        getFurnitureItems(),
        getCategories()
      ])
      setFurniture(items)
      setCategories(cats)
      
      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)
    } else {
      alert('Failed to delete category.')
      setDeleteModal({ isOpen: false, category: '', itemCount: 0 })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, category: '', itemCount: 0 })
  }

  const handleStartEdit = (category: string) => {
    setEditingCategory({ old: category, new: category })
  }

  return (
    <div>
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-800 font-medium" dangerouslySetInnerHTML={{ __html: successMessage }} />
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
        <p className="text-gray-600 mt-1">Manage your furniture categories ({categories.length} categories)</p>
      </div>

      {/* Add New Category */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCategory()
              }
            }}
            placeholder="Enter new category name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md"
          >
            Add Category
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Categories will only appear on the main site if they have products. You can create empty categories here to use when adding new items.
        </p>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Existing Categories</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No categories found
            </div>
          ) : (
            categories.map((category) => {
              const itemCount = categoriesWithCounts[category] || 0
              return (
                <div key={category} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  {editingCategory?.old === category ? (
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={editingCategory.new}
                        onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleRenameCategory(category, editingCategory.new)
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null)
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameCategory(category, editingCategory.new)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{category}</h4>
                          <p className="text-sm text-gray-500">
                            {itemCount === 0 
                              ? 'No items' 
                              : `${itemCount} item${itemCount !== 1 ? 's' : ''}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(category)}
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className={`px-4 py-2 font-medium transition-colors text-sm ${
                            itemCount > 0
                              ? 'text-orange-600 hover:text-orange-700'
                              : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          Delete{itemCount > 0 ? ` (${itemCount} item${itemCount !== 1 ? 's' : ''})` : ''}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        category={deleteModal.category}
        itemCount={deleteModal.itemCount}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

