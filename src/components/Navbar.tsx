'use client'

import Link from 'next/link'
import { Info, BookOpen, Flag, Trophy, Shield } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import ImageWithFallback from './ImageWithFallback'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { signOut, isAdmin } from '@/lib/auth'
import { useNotifications } from '@/contexts/NotificationsContext'
import APP from '@/config'
import { subscribeToSolves } from '@/lib/challenges'

export default function Navbar() {
  const router = useRouter()
  const { user, setUser, loading } = useAuth()
  const { unreadCount } = useNotifications()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminStatus, setAdminStatus] = useState(false)
  // State for real-time solve notification
  const [solveNotif, setSolveNotif] = useState<{ username: string; challenge: string } | null>(null)
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (user) {
      isAdmin().then(setAdminStatus)
    } else {
      setAdminStatus(false)
    }
  }, [user])

  // Real-time solves subscription (aktif hanya jika APP.notifSolves true)
  useEffect(() => {
    if (!user || !APP.notifSolves) return;
    const unsubscribe = subscribeToSolves(({ username, challenge }) => {
      setSolveNotif({ username, challenge })
      // Play sound only if the solve is NOT by the current user
      if (username !== user.username) {
        try {
          const audio = new Audio('/sounds/notify.mp3')
          audio.volume = 0.5
          audio.play()
        } catch {}
      }
      // Auto-hide after 6s
      if (notifTimeout.current) clearTimeout(notifTimeout.current)
      notifTimeout.current = setTimeout(() => setSolveNotif(null), 6000)
    })
    return () => {
      unsubscribe()
      if (notifTimeout.current) clearTimeout(notifTimeout.current)
    }
  }, [user])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await signOut()
    setUser(null)
    setAdminStatus(false)
    router.push('/login')
  }

  if (loading) return null

  // Marquee/Toast notification style
  const notifVisible = !!solveNotif

  return (
    <>
      {/* Real-time solve notification (marquee style) */}
      {notifVisible && (
        <div className="fixed top-2 right-2 z-[9999] flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-left" style={{ minWidth: 220, maxWidth: 350 }}>
          <svg className="mr-2" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="truncate">
            <b>{solveNotif.username}</b> just solved <b>{solveNotif.challenge}</b>!
          </span>
        </div>
      )}
    <nav className={`shadow-sm border-b fixed top-0 left-0 w-full z-50 ${theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-300'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2 group" data-tour="navbar-logo">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} transition-all duration-200`}>
                <span className="text-white font-extrabold text-lg tracking-wide">{APP.shortName.charAt(0)}</span>
              </div>
              <span className={`text-[1.35rem] font-extrabold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-all duration-200 group-hover:text-blue-500 dark:group-hover:text-blue-400`}>{APP.shortName}</span>
            </Link>

            {/* Desktop menu (show some items only when logged in) */}
            <div className="hidden md:flex space-x-2">

              {user && (
                <Link
                  href="/challenges"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                  data-tour="navbar-challenges"
                >
                  <Flag size={18} className="mr-1" /> Challenges
                </Link>
              )}

              {user && (
                <Link
                  href="/scoreboard"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                  data-tour="navbar-scoreboard"
                >
                  <Trophy size={18} className="mr-1" /> Scoreboard
                </Link>
              )}

              <Link
                href="/rules"
                className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                title="Rules"
                aria-label="Rules"
                data-tour="navbar-rules"
              >
                <BookOpen size={18} className="mr-1" /> Rules
              </Link>

              <Link
                href="/info"
                className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                title="Info"
                aria-label="Info"
                data-tour="navbar-info"
              >
                <Info size={18} className="mr-1" /> Info
              </Link>

              {adminStatus && user && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                >
                  <Shield size={18} className="mr-1" /> Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-5">
            <div className="hidden sm:flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 group" data-tour="navbar-profile">
                    <ImageWithFallback src={user.picture} alt={user.username} size={36} className="rounded-full" />
                    <span
                      className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-all duration-150 group-hover:text-blue-500 dark:group-hover:text-blue-400 truncate whitespace-nowrap max-w-[100px] md:max-w-[160px] block`}
                      title={user.username}
                    >
                      {user.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            {/* Notification Icon (toggle to /notification or back) */}
            <div className="relative mr-2" data-tour="navbar-notifications">
              <button
                className={`rounded-full p-1 transition-colors duration-150 ${pathname === '/notification' ? (theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100') : ''}`}
                title="Notifications"
                aria-label="Notifications"
                onClick={() => {
                  if (pathname === '/notification') {
                    // Go back or to home if already on /notification
                    if (window.history.length > 1) {
                      router.back()
                    } else {
                      router.push('/')
                    }
                  } else {
                    router.push('/notification')
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={pathname === '/notification' ? (theme === 'dark' ? '#60a5fa' : '#2563eb') : '#3b82f6'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-bell transition-all duration-150"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {unreadCount > 0 && (
                (() => {
                  const display = unreadCount > 99 ? '99+' : String(unreadCount)
                  return (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold bg-red-600 text-white">{display}</span>
                  )
                })()
              )}
            </div>
            {/* Theme Switcher Icon Only - moved right */}
            <button
              onClick={toggleTheme}
              className="focus:outline-none transition-colors duration-150 ml-1"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-moon transition-all duration-150">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sun transition-all duration-150">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden fixed inset-0 z-60 ${theme === 'dark' ? 'bg-gray-950/95' : 'bg-white/95'} transition-all duration-200 backdrop-blur-sm`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <span className={`text-lg font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 pt-4 pb-6 space-y-2 animate-fade-in">
              {/* Profile */}
              {user && (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200 mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ImageWithFallback src={user.picture} alt={user.username} size={36} className="rounded-full" />
                    <span
                      className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} group-hover:text-blue-500 dark:group-hover:text-blue-400 truncate whitespace-nowrap max-w-[120px] block`}
                      title={user.username}
                    >
                      {user.username}
                    </span>
                  </Link>
                </>
              )}
              {/* Tampil jika sudah login */}
              {user && (
                <>
                  <Link
                    href="/challenges"
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Flag size={18} className="mr-1" /> Challenges
                  </Link>
                  <Link
                    href="/scoreboard"
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy size={18} className="mr-1" /> Scoreboard
                  </Link>
                </>
              )}
              <Link
                href="/rules"
                className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                onClick={() => setMobileMenuOpen(false)}
                title="Rules"
                aria-label="Rules"
              >
                <BookOpen size={18} className="mr-1" /> Rules
              </Link>
              <Link
                href="/info"
                className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                onClick={() => setMobileMenuOpen(false)}
                title="Info"
                aria-label="Info"
              >
                <Info size={18} className="mr-1" /> Info
              </Link>
              {user && (
                <>
                  {adminStatus && (
                    <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield size={18} className="mr-1" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150"
                  >
                    Logout
                  </button>
                </>
              )}
              {/* Tampil jika belum login */}
              {!user && (
                <>
                  <Link
                    href="/login"
                    className={`flex px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`flex px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  </>
  )
}
