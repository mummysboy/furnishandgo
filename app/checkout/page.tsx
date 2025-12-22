'use client'

import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState, useEffect } from 'react'
import { decrementStockQuantities, checkInventoryAvailability } from '@/lib/adminData'
import { calculateTax, getTaxLabel } from '@/lib/tax'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Payment Form Component using Stripe Elements
function CheckoutForm({ 
  formData, 
  handleInputChange, 
  onPaymentSuccess 
}: { 
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onPaymentSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart, getTotalPrice } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const subtotal = getTotalPrice()
  const tax = calculateTax(subtotal, formData.country)
  const totalWithTax = subtotal + tax

  // Create payment intent when component mounts or when total changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalWithTax,
            currency: 'gbp',
            metadata: {
              cart: JSON.stringify(cart.map(item => ({ id: item.id, quantity: item.quantity, name: item.name }))),
              subtotal: subtotal.toString(),
              tax: tax.toString(),
              country: formData.country,
            },
          }),
        })

        const data = await response.json()
        if (data.error) {
          setPaymentError(data.error)
          return
        }
        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error('Error creating payment intent:', error)
        setPaymentError('Failed to initialize payment. Please try again.')
      }
    }

    if (cart.length > 0) {
      createPaymentIntent()
    }
  }, [cart, totalWithTax, subtotal, tax, formData.country])

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate delivery information
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || 
        !formData.postcode || !formData.country) {
      setPaymentError('Please fill in all delivery information fields.')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setPaymentError('Please enter a valid email address.')
      return
    }

    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system is not ready. Please wait a moment and try again.')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setPaymentError('Card element not found. Please refresh the page.')
      setIsProcessing(false)
      return
    }

    try {
      const { error: submitError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postcode,
              country: formData.country === 'United Kingdom' ? 'GB' : 
                       formData.country === 'United States' ? 'US' :
                       formData.country === 'Canada' ? 'CA' : 'AU',
            },
          },
        },
      })

      if (submitError) {
        setPaymentError(submitError.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
      } else {
        // Payment succeeded
        onPaymentSuccess()
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setPaymentError(error.message || 'An unexpected error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit}>
      {/* Payment Error Display */}
      {paymentError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-red-700 text-sm">{paymentError}</p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">
            Secure payment powered by Stripe. Your card information is encrypted and never stored on our servers.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details *
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-300">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Test cards: 4242 4242 4242 4242 (Visa) | Use any future expiry date and any 3-digit CVC
            </p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isProcessing || !stripe || !clientSecret}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 mt-6"
      >
        {isProcessing ? 'Processing Payment...' : `Pay ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalWithTax)} +VAT`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart, removeFromCart } = useCart()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [inventoryError, setInventoryError] = useState<{
    unavailableItems: Array<{ id: number; name: string; requestedQuantity: number; availableQuantity: number; reason: 'out_of_stock' | 'insufficient_quantity' }>
  } | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price)
  }

  const subtotal = getTotalPrice()
  const tax = calculateTax(subtotal, formData.country)
  const totalPrice = subtotal + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Check inventory when cart changes
  useEffect(() => {
    const checkInventory = async () => {
      if (cart.length > 0) {
        const cartItemsForCheck = cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name
        }))
        try {
          const unavailableItems = await checkInventoryAvailability(cartItemsForCheck)
          
          if (unavailableItems.length > 0) {
            setInventoryError({ unavailableItems })
            // Automatically remove unavailable items from cart
            unavailableItems.forEach(item => {
              removeFromCart(item.id)
            })
          } else {
            setInventoryError(null)
          }
        } catch (error) {
          console.error('Error checking inventory:', error)
        }
      } else {
        setInventoryError(null)
      }
    }
    checkInventory()
  }, [cart, removeFromCart])

  const handlePaymentSuccess = async () => {
    setIsSubmitting(true)

    // Check inventory before processing
    const cartItemsForCheck = cart.map(item => ({
      id: item.id,
      quantity: item.quantity,
      name: item.name
    }))
    
    try {
      const unavailableItems = await checkInventoryAvailability(cartItemsForCheck)

      if (unavailableItems.length > 0) {
        // If there are unavailable items, remove them and show error
        setInventoryError({ unavailableItems })
        unavailableItems.forEach(item => {
          removeFromCart(item.id)
        })
        setIsSubmitting(false)
        // Payment was successful but inventory check failed - this shouldn't happen in production
        // but we handle it gracefully
        alert('Payment successful, but some items are no longer available. Your payment will be refunded.')
        return
      }

      // Clear any previous errors
      setInventoryError(null)

      // Decrement stock quantities for items sold
      const cartItemsForStockUpdate = cart.map(item => ({
        id: item.id,
        quantity: item.quantity // This is the cart quantity (how many were sold)
      }))
      await decrementStockQuantities(cartItemsForStockUpdate)

      // Clear cart and show success
      clearCart()
      setOrderPlaced(true)
    } catch (error) {
      console.error('Error processing order:', error)
      alert('Payment was successful, but there was an error processing your order. Please contact support.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-slide-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
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

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mx-auto text-center animate-scale-in">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 transition-all duration-500 animate-bounce-subtle shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-12 h-12 text-green-600 transition-all duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-in">Order Placed Successfully!</h1>
            <p className="text-xl text-gray-600 mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
            <p className="text-gray-500 mb-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
              Your order will be delivered within 5-7 business days. No <em>tsuris</em>, we promise!
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 hover:scale-105 animate-slide-in"
              style={{ animationDelay: '0.3s' }}
            >
              Continue Shopping
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8 animate-slide-in">Checkout</h1>

        {/* Inventory Error Alert */}
        {inventoryError && inventoryError.unavailableItems.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-6 animate-slide-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Some items are no longer available
                </h3>
                <p className="text-red-700 mb-4">
                  The following items have been removed from your cart because they are out of stock or have insufficient inventory:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  {inventoryError.unavailableItems.map((item) => (
                    <li key={item.id} className="text-red-700">
                      <span className="font-semibold">{item.name}</span>
                      {item.reason === 'out_of_stock' ? (
                        <span> - Out of stock</span>
                      ) : (
                        <span> - Only {item.availableQuantity} available (you requested {item.requestedQuantity})</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-red-600">
                  Please review your cart and proceed with checkout when ready.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 border border-gray-100 transition-all duration-300 ease-out animate-slide-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    required
                    value={formData.postcode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-out hover:border-gray-400"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 border border-gray-100 sticky top-24 transition-all duration-300 ease-out animate-scale-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 transition-all duration-300 hover:bg-gray-50 p-2 -m-2 rounded-lg">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden group/image">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover/image:scale-110"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        {formatPrice(item.price * item.quantity)} <span className="text-xs text-gray-500 font-normal">+VAT</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="flex items-center gap-1">
                    {formatPrice(subtotal)} <span className="text-xs text-gray-500 font-normal">+VAT</span>
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{getTaxLabel(formData.country)}</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="flex items-center gap-1">
                      {formatPrice(totalPrice)} <span className="text-sm text-gray-600 font-normal">+VAT</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 ease-out shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
              >
                {isSubmitting ? 'Processing...' : `Pay ${formatPrice(totalPrice)} +VAT`}
              </button>
              <Link
                href="/cart"
                className="block w-full text-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:underline mt-4"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

