export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Furnish & Go</h3>
            <p className="text-sm mb-3">
              Quality furniture without the <em>meshugas</em>. 
              We&apos;ve been helping people furnish their homes properly since... well, 
              let&apos;s just say we know what we&apos;re doing.
            </p>
            <p className="text-sm text-gray-400">
              <strong>Our Services:</strong> Next day delivery • Free installation & assembly • 
              Kitchen appliances • Beds • Living room furniture • Complete furniture packages
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#furniture" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                  Furniture
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Get in Touch</h3>
            <p className="text-sm mb-2">
              Have a question? Want to <em>kvetch</em> about something? 
              We&apos;re here to help.
            </p>
            <p className="text-sm">
              <strong>Email:</strong> hello@furnishandgo.co.uk
              <br />
              <strong>Phone:</strong> 020 7123 4567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Furnish & Go. All rights reserved.
            <br />
            <span className="text-xs text-gray-500 mt-2 block">
              Made with <em>nachas</em> in London.
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

