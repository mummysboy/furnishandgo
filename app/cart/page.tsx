'use client'

import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price)
  }

  const totalPrice = getTotalPrice()

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-24 h-24 mx-auto text-gray-300 mb-6 transition-all duration-500 hover:scale-110 hover:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link
              href="/#furniture"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 hover:scale-105"
            >
              Browse Furniture
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 animate-slide-in">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 border border-gray-100 flex flex-col sm:flex-row gap-6 transition-all duration-300 ease-out animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden group/image">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover/image:scale-110"
                    sizes="(max-width: 640px) 100vw, 128px"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                      <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-gray-700">
                        Quantity:
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:border-blue-500 hover:shadow-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 font-semibold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1
                            updateQuantity(item.id, newQuantity)
                          }}
                          className="w-16 text-center border-0 focus:ring-0 focus:outline-none transition-all duration-200"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 transition-all duration-300">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:text-red-700 hover:underline mt-1 transition-all duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 border border-gray-100 sticky top-24 transition-all duration-300 ease-out animate-scale-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 transition-all duration-300">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold transition-all duration-300">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600 transition-all duration-300">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900 transition-all duration-300">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 hover:scale-105 mb-4"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/#furniture"
                className="block w-full text-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

