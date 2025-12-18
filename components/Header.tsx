'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Furnish & Go Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="text-sm text-gray-500 italic hidden sm:inline">(No meshugas, just furniture)</span>
          </Link>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-8">
              <Link href="/furniture" className="text-gray-700 hover:text-gray-900 transition-colors">
                Furniture
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </nav>
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-110 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 transition-transform duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 animate-scale-in hover:scale-110 shadow-lg">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

