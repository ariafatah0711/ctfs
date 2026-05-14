import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Settings } from 'lucide-react'
import 'react-medium-image-zoom/dist/styles.css'
import './globals.css'

import { Toaster } from "react-hot-toast"
import Navbar from '@/_layouts/Navbar'
import ScrollToggle from '@/_layouts/components/ScrollToggle'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import { PAGE_BG_BASE_CLASS } from '@/shared/styles/page-background'
import APP from '@/config'

export const metadata: Metadata = {
  metadataBase: new URL(APP.baseUrl),
  title: `${APP.shortName} - ${APP.fullName}`,
  description: APP.description,
  keywords: ['CTF', 'Capture The Flag', 'Cybersecurity', 'Hacking Challenge', 'CSCV', 'InfoSec', 'ctftime', 'ctftime.org', 'CTF Platform', 'Cybersecurity Competition', 'Ethical Hacking', 'Vulnerability Assessment', 'Penetration Testing', 'Digital Forensics', 'Malware Analysis', 'Network Security', 'Web Application Security', 'Cryptography', 'Reverse Engineering', 'Security Training', 'Cyber Defense', 'Bug Bounty', 'Red Teaming', 'Blue Teaming', 'Cybersecurity Community', 'CTF Events', 'CTF Challenges', 'Cybersecurity Education', 'CTF Teams', 'Cybersecurity Awareness', 'Capture The Flag Events', 'CTF Challenges Platform', 'Cybersecurity Skills', 'CTF Competitions', 'Cybersecurity Learning', 'CTF Resources', 'Cybersecurity Tools', 'CTF Tutorials', 'Cybersecurity Labs', 'CTF Write-ups', 'Cybersecurity News', 'CTF Strategies', 'Cybersecurity Research', 'CTF Techniques', 'Cybersecurity Conferences', 'CTF Workshops', 'Cybersecurity Careers', 'CTF Training', 'Cybersecurity Certifications', 'CTF Platforms', 'Cybersecurity Innovations', 'CTF Community', 'Cybersecurity Trends', 'CTF Development', 'Cybersecurity Solutions'],
  authors: [{ name: 'ariafatah', url: APP.baseUrl }],
  creator: 'ariafatah',
  publisher: APP.fullName,
  applicationName: APP.fullName,
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
  alternates: {
    canonical: APP.baseUrl,
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isMaintenancePage = pathname === '/maintenance'

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {isMaintenancePage ? (
          // Maintenance mode: no navbar, no providers, just raw content
          children
        ) : (
          // Normal mode: with navbar and providers
          <div className={`min-h-screen ${PAGE_BG_BASE_CLASS}`}>
            <ThemeProvider>
              <AuthProvider>
                  <Navbar />
                  <div className="pt-14">{children}</div>
                  <Toaster position="top-right" reverseOrder={false} />
                  <ScrollToggle />
              </AuthProvider>
            </ThemeProvider>
          </div>
        )}
      </body>
    </html>
  )
}
