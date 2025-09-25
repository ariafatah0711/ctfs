import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from "react-hot-toast"

import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

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
      <head>
        <title>CTFS - Capture The Flag Simple</title>
        <meta name="description" content="Aplikasi CTF minimalis dengan Next.js dan Supabase" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <div className="pt-16">
                {children}
              </div>
              <Toaster position="top-right" reverseOrder={false} />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
