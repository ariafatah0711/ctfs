import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from "react-hot-toast"

import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import APP from '@/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${APP.shortName} - ${APP.fullName}`,
  description: APP.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>{APP.fullName}</title>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="pt-14">
                  {children}
                </div>
                <Toaster position="top-right" reverseOrder={false} />
              </div>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
