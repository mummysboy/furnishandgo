import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Furnish & Go - Quality Furniture, No Faff',
  description: 'Beautiful furniture for your home—beds, kitchen appliances, living room furniture, and complete packages. Next day delivery with free installation and assembly. Quality pieces without the meshugas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}

