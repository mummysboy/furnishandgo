import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Quality Furniture,{' '}
            <span className="text-blue-600">No Faff</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Beautiful pieces for your home, without all the <em>tsuris</em>.
          </p>
          <p className="text-lg text-gray-500 mb-6 max-w-2xl mx-auto">
            We&apos;ve got the furniture you need—beds, kitchen appliances, living room furniture, and complete furniture packages. 
            Next day delivery, free installation and assembly included. No <em>kvetching</em>, just quality pieces at fair prices.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm md:text-base">
            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">Next Day Delivery</span>
            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">Free Installation</span>
            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">Free Assembly</span>
          </div>
          <Link
            href="/furniture"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 ease-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 hover:scale-105"
          >
            Browse Our Collection
          </Link>
        </div>
      </div>
    </section>
  )
}

