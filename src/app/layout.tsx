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
  metadataBase: new URL(APP.baseUrl),
  title: `${APP.shortName} - ${APP.fullName}`,
  description: APP.description,
  openGraph: {
    title: `${APP.shortName} - ${APP.fullName}`,
    description: APP.description,
    url: APP.baseUrl,
    siteName: APP.fullName,
    images: [
      {
        url: `${APP.baseUrl}/${APP.image_preview}`,
        width: 1200,
        height: 630,
        alt: `${APP.shortName} - ${APP.fullName}`,
        type: 'image/png',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP.shortName} - ${APP.fullName}`,
    description: APP.description,
    images: [`${APP.baseUrl}/${APP.image_icon}`],
  },
  other: {
    // Structured data biar Google bisa detect
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": APP.baseUrl,
      "name": `${APP.shortName} - ${APP.fullName}`,
      "description": APP.description,
      "image": `${APP.baseUrl}/${APP.image_icon}`,
      "publisher": {
        "@type": "Organization",
        "name": APP.fullName,
        "logo": `${APP.baseUrl}/${APP.image_icon}`
      }
    })
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="pt-14">{children}</div>
                <Toaster position="top-right" reverseOrder={false} />
              </div>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
