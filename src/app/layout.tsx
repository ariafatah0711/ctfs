import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from "react-hot-toast"

import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CTFS - Capture The Flag System',
  description: 'Aplikasi CTF minimalis dengan Next.js dan Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>   {/* ✅ Bungkus seluruh app */}
          <div className="min-h-screen bg-gray-50">
            <Navbar />   {/* ✅ Navbar otomatis dapat user dari context */}
            <div className="pt-16">
              {children}
            </div>
            <Toaster position="top-right" reverseOrder={false} />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
