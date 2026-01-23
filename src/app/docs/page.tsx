'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DocsPage() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
              <BookOpen size={56} className="text-blue-500" />
            </div>
          </div>
          <h1 className={`text-5xl sm:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500`}>
            Documentation
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete guide and resources for setting up and using the CTF platform
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className={`rounded-2xl backdrop-blur-sm border p-8 sm:p-16 text-center ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700 shadow-2xl' : 'bg-white/50 border-blue-200 shadow-xl'}`}>
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}">
              <div className="relative">
                <Clock size={20} className="animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <span className="font-semibold">Coming Soon</span>
            </div>
          </div>

          <h2 className={`text-3xl sm:text-4xl font-bold mb-6`}>
            We&apos;re crafting comprehensive documentation
          </h2>

          <p className={`text-lg mb-10 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Our team is preparing detailed guides and tutorials to help you get the most out of the platform.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            <div className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h3 className="font-semibold">Installation Guide</h3>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Step-by-step setup and deployment instructions
              </p>
            </div>

            <div className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <h3 className="font-semibold">Configuration</h3>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Customize settings and environment variables
              </p>
            </div>

            <div className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <h3 className="font-semibold">Database Management</h3>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Initialize, migrate, and manage your database
              </p>
            </div>

            <div className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <h3 className="font-semibold">Troubleshooting</h3>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Solutions to common issues and problems
              </p>
            </div>
          </div>

          <p className={`text-sm mb-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Stay tuned for detailed documentation and API references
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl"
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Info Section */}
        <div className={`mt-16 p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
              <BookOpen size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Need information now?</h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                While we prepare comprehensive documentation, check out these resources:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/rules"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Platform Rules <ArrowRight size={16} />
                </Link>
                <Link
                  href="/info"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Platform Info <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
