import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from "react-hot-toast"

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
        <div className="min-h-screen bg-gray-50">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </body>
    </html>
  )
}
