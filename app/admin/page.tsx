'use client'

import { useState } from 'react'
import AdminFurnitureManager from '@/components/admin/AdminFurnitureManager'
import AdminCategoryManager from '@/components/admin/AdminCategoryManager'
import { resetFurnitureItems } from '@/lib/adminData'

type AdminTab = 'furniture' | 'categories'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('furniture')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to default? This will delete all your changes.')) {
      resetFurnitureItems()
      setRefreshKey(prev => prev + 1)
      alert('Data reset to default. Please refresh the page to see changes.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your furniture inventory and categories</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 font-medium transition-colors rounded-lg"
              >
                Reset to Default
              </button>
              <a
                href="/"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ← Back to Store
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('furniture')
                setRefreshKey(prev => prev + 1)
              }}
              className={`${
                activeTab === 'furniture'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Furniture Listings
            </button>
            <button
              onClick={() => {
                setActiveTab('categories')
                setRefreshKey(prev => prev + 1)
              }}
              className={`${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Categories
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'furniture' && <AdminFurnitureManager key={refreshKey} />}
        {activeTab === 'categories' && <AdminCategoryManager key={refreshKey} />}
      </div>
    </div>
  )
}

