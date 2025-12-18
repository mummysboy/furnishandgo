import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FurnitureGrid from '@/components/FurnitureGrid'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
      <Header />
      <Hero />
      <FurnitureGrid />
      <Footer />
    </main>
  )
}

