import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fade-in">
      <Header />
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Furnish & Go
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;ve been helping people furnish their homes properly since... well, let&apos;s just say we know what we&apos;re doing.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 animate-fade-in">
            <div className="bg-blue-50 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Furnish & Go, we believe that furnishing your home shouldn&apos;t be a <em>tsuris</em>. 
                Life&apos;s too short for <em>shoddy</em> furniture, complicated delivery processes, or having to deal with 
                companies that make everything harder than it needs to be.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We started with a simple idea: quality furniture, delivered quickly, installed properly, 
                and without all the <em>meshugas</em>. No fuss, no bother—just beautiful pieces that 
                make your house feel like a home.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-700">
                  To provide quality furniture and appliances that you can actually rely on, 
                  delivered and installed with service that doesn&apos;t leave you <em>kvetching</em>.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Values</h3>
                <p className="text-gray-700">
                  Quality without compromise. Service with a smile. Fair prices. 
                  And absolutely no <em>kvetching</em> from us—we promise.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We specialise in providing complete furniture solutions for your home, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Beds and bedroom furniture</li>
                <li>Kitchen appliances and fittings</li>
                <li>Living room furniture</li>
                <li>Complete furniture packages</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                All with next-day delivery, free installation, and free assembly. 
                Because when you&apos;re furnishing a home, you shouldn&apos;t have to deal with more <em>tsuris</em> 
                than you already have.
              </p>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-lg text-gray-600">
                Have questions? Want to know more? 
                <br />
                <a href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors">
                  Get in touch with us
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

