import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, BarChart2, Shield, Send, Phone, Lock } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-6">
          <nav className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-semibold">Quantum Hub</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700">Login</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-[1200px]">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-8">
                <h1 className="text-6xl font-bold tracking-tight">
                  Powerful SMS Management Platform
                </h1>
                <p className="text-xl text-gray-600">
                  Send, track, and manage SMS messages with our intuitive platform. Perfect for businesses of all sizes.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/login">
                    <Button size="lg" className="h-12 px-8">Login</Button>
                  </Link>
                  <a href="https://wa.me/525613096593" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                      <Phone className="mr-2 h-5 w-5" />
                      WhatsApp
                    </Button>
                  </a>
                  <a href="https://t.me/quantumhubsms" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                      <Send className="mr-2 h-5 w-5" />
                      Telegram
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="w-full aspect-square bg-gray-100 rounded-lg shadow-lg overflow-hidden">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Dashboard Preview"
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="container mx-auto max-w-[1200px]">
            <h2 className="text-3xl font-bold mb-16">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Bulk SMS Feature */}
              <div className="bg-white p-6 rounded-lg">
                <div className="mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bulk SMS</h3>
                <p className="text-gray-600">
                  Send messages to thousands of recipients at once with our powerful bulk SMS feature.
                </p>
              </div>

              {/* Analytics */}
              <div className="bg-white p-6 rounded-lg">
                <div className="mb-4">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-gray-600">
                  Track delivery rates, engagement, and other key metrics with our comprehensive analytics.
                </p>
              </div>

              {/* Campaign Management */}
              <div className="bg-white p-6 rounded-lg">
                <div className="mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
                <p className="text-gray-600">
                  Create, schedule, and manage multiple SMS campaigns from a single dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-[1200px] text-center">
            <h2 className="text-3xl font-bold mb-8">Interested in Our Services?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Contact us via WhatsApp or Telegram to get started with your account setup.
            </p>
            <div className="flex justify-center gap-4">
              <a href="https://wa.me/525613096593" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-8">
                  <Phone className="mr-2 h-5 w-5" />
                  WhatsApp: +52 56 1309 6593
                </Button>
              </a>
              <a href="https://t.me/quantumhubsms" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-8">
                  <Send className="mr-2 h-5 w-5" />
                  Telegram: @quantumhubsms
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm">
              © 2024 Quantum Hub. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
