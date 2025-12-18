'use client'

import { useState, useEffect } from 'react'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems, saveFurnitureItems } from '@/lib/adminData'

export default function AdminCategoryManager() {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  
  useEffect(() => {
    setFurniture(getFurnitureItems())
  }, [])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<{ old: string; new: string } | null>(null)

  // Get categories with item counts
  const categoriesWithCounts = furniture.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0
    }
    acc[item.category]++
    return acc
  }, {} as Record<string, number>)

  const categories = Object.keys(categoriesWithCounts).sort()

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      // Category will be created when a furniture item uses it
      alert(`Category "${newCategory.trim()}" will be created when you add a furniture item with this category.`)
      setNewCategory('')
    } else if (categories.includes(newCategory.trim())) {
      alert('This category already exists.')
    }
  }

  const handleRenameCategory = (oldCategory: string, newCategoryName: string) => {
    if (!newCategoryName.trim() || newCategoryName.trim() === oldCategory) {
      setEditingCategory(null)
      return
    }

    if (categories.includes(newCategoryName.trim()) && newCategoryName.trim() !== oldCategory) {
      alert('This category name already exists.')
      return
    }

    if (confirm(`Rename "${oldCategory}" to "${newCategoryName.trim()}"? This will update all ${categoriesWithCounts[oldCategory]} item(s) in this category.`)) {
      const updated = furniture.map(item => 
        item.category === oldCategory 
          ? { ...item, category: newCategoryName.trim() }
          : item
      )
      setFurniture(updated)
      saveFurnitureItems(updated)
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = (category: string) => {
    const itemCount = categoriesWithCounts[category]
    if (itemCount > 0) {
      if (confirm(`Cannot delete "${category}" because it has ${itemCount} item(s). Please move or delete the items first.`)) {
        return
      }
    } else {
      // Category is empty, can be deleted (though it won't exist in the data)
      alert('This category is already empty.')
    }
  }

  const handleStartEdit = (category: string) => {
    setEditingCategory({ old: category, new: category })
  }

  return (
    <div>
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
          Note: Categories are created automatically when you add furniture items. Use this to plan new categories.
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
            categories.map((category) => (
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
                          {categoriesWithCounts[category]} item{categoriesWithCounts[category] !== 1 ? 's' : ''}
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
                      {categoriesWithCounts[category] === 0 ? (
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors text-sm"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="px-4 py-2 text-gray-400 text-sm cursor-not-allowed">
                          Delete (has items)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How Categories Work</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Categories are automatically created when you add furniture items with new category names</li>
          <li>You can rename categories, which will update all items in that category</li>
          <li>Categories can only be deleted if they have no items</li>
          <li>To delete a category, first move or delete all items in that category</li>
        </ul>
      </div>
    </div>
  )
}

