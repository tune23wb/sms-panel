import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, BarChart2, Shield, Send, Phone, Lock, Facebook, Zap, Globe, Users } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-6">
          <nav className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Quantum Hub</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800">Login</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
          <div className="container mx-auto max-w-[1200px] relative">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  Next-Gen SMS Platform
                </h1>
                <p className="text-xl text-gray-300">
                  Experience the future of bulk messaging with our AI-powered platform. Send, track, and optimize your SMS campaigns with unprecedented efficiency.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/login">
                    <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Get Started
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <a href="https://wa.me/525613096593" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Phone className="h-5 w-5" />
                    </a>
                    <a href="https://t.me/quantumhubsms" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Send className="h-5 w-5" />
                    </a>
                    <a href="https://www.facebook.com/share/192sMD3ASy/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="https://t.me/+92otxqebKco4MDYx" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Globe className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
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
        <section className="py-24 px-6 bg-gray-900">
          <div className="container mx-auto max-w-[1200px]">
            <h2 className="text-4xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Why Choose Quantum Hub?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Bulk SMS Feature */}
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="mb-6 p-3 rounded-full bg-blue-500/10 w-fit">
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Bulk SMS</h3>
                <p className="text-gray-300">
                  Send thousands of messages instantly with our high-performance bulk SMS system. Perfect for marketing campaigns and notifications.
                </p>
              </div>

              {/* Analytics */}
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="mb-6 p-3 rounded-full bg-purple-500/10 w-fit">
                  <BarChart2 className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Advanced Analytics</h3>
                <p className="text-gray-300">
                  Real-time insights and detailed reports to track your campaign performance and optimize your messaging strategy.
                </p>
              </div>

              {/* Campaign Management */}
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="mb-6 p-3 rounded-full bg-blue-500/10 w-fit">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Smart Campaigns</h3>
                <p className="text-gray-300">
                  AI-powered campaign management that helps you reach the right audience at the right time with personalized messages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
          <div className="container mx-auto max-w-[1200px] text-center relative">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Join Our Community</h2>
            <p className="text-xl text-gray-300 mb-12">
              Connect with us on social media to stay updated with the latest features and get exclusive offers.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="https://wa.me/525613096593" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <Phone className="h-5 w-5" />
                <span>WhatsApp</span>
              </a>
              <a href="https://t.me/quantumhubsms" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <Send className="h-5 w-5" />
                <span>Telegram</span>
              </a>
              <a href="https://www.facebook.com/share/192sMD3ASy/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </a>
              <a href="https://t.me/+92otxqebKco4MDYx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <Globe className="h-5 w-5" />
                <span>Telegram Channel</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-gray-300">© 2024 Quantum Hub. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
