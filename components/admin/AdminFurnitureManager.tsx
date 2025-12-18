'use client'

import { useState, useEffect } from 'react'
import { FurnitureItem } from '@/data/furniture'
import { getFurnitureItems, saveFurnitureItems, getCategories, addCategory } from '@/lib/adminData'
import FurnitureForm from './FurnitureForm'

export default function AdminFurnitureManager() {
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
  
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter furniture based on search and category
  const filteredFurniture = furniture.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAdd = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: FurnitureItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updated = furniture.filter(item => item.id !== id)
      setFurniture(updated)
      await saveFurnitureItems(updated)
    }
  }

  const handleSave = async (item: FurnitureItem) => {
    // Add category if it doesn't exist
    if (!categories.includes(item.category)) {
      await addCategory(item.category)
      const updatedCats = await getCategories()
      setCategories(updatedCats)
    }
    
    let updated: FurnitureItem[]
    if (editingItem) {
      // Update existing item
      updated = furniture.map(f => f.id === item.id ? item : f)
    } else {
      // Add new item
      const newId = Math.max(...furniture.map(f => f.id), 0) + 1
      updated = [...furniture, { ...item, id: newId }]
    }
    setFurniture(updated)
    await saveFurnitureItems(updated)
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Furniture Listings</h2>
          <p className="text-gray-600 mt-1">Manage your furniture inventory ({filteredFurniture.length} items)</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md"
        >
          + Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Furniture List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFurniture.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No furniture items found
                  </td>
                </tr>
              ) : (
                filteredFurniture.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        <span dangerouslySetInnerHTML={{ __html: item.description.substring(0, 100) + '...' }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      £{item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <FurnitureForm
          item={editingItem}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

