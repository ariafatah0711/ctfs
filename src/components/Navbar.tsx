'use client'

import Link from 'next/link'
import { Info, BookOpen, Flag, Trophy, Shield, FileText, Bell, Users, Hammer } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import ImageWithFallback from './ImageWithFallback'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { signOut, isAdmin } from '@/lib/auth'
import { useLogs } from '@/contexts/LogsContext'
import { Switch } from '@/components/ui/switch'
import APP from '@/config'
import { subscribeToSolves, getNotifications, createNotification, deleteNotification, subscribeToNotifications } from '@/lib/challenges'
import { formatRelativeDate } from '@/lib/utils'

export default function Navbar() {
  const router = useRouter()
  const { user, setUser, loading } = useAuth()
  const { unreadCount: logsUnreadCount } = useLogs()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminStatus, setAdminStatus] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifUnreadCount, setNotifUnreadCount] = useState(0)
  const [notifItems, setNotifItems] = useState<Array<{ id: string; title: string; message: string; level: string; created_at: string }>>([])
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifLevel, setNotifLevel] = useState<'info' | 'info_platform' | 'info_challenges'>('info')
  // State for real-time solve notification
  const [solveNotif, setSolveNotif] = useState<{ username: string; challenge: string } | null>(null)
  const [notifToast, setNotifToast] = useState<{ title: string; message: string } | null>(null)
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notifToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notifPanelRef = useRef<HTMLDivElement | null>(null)
  const notifButtonRef = useRef<HTMLButtonElement | null>(null)
  const [scoreboardOpen, setScoreboardOpen] = useState(false)
  const scoreboardMenuRef = useRef<HTMLDivElement | null>(null)
  const [docsOpen, setDocsOpen] = useState(false)
  const docsMenuRef = useRef<HTMLDivElement | null>(null)
  const { theme, toggleTheme } = useTheme()
  const avatarSrc =  user?.profile_picture_url || user?.picture || null
  const [solveSoundEnabled, setSolveSoundEnabled] = useState(true)

  const notifSeenKey = user ? `ctfs_seen_notifications_v1:${user.id}` : `ctfs_seen_notifications_v1:anon`

  const getSeenNotifIds = () => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const seenJson = localStorage.getItem(notifSeenKey)
      const seen: string[] = seenJson ? JSON.parse(seenJson) : []
      return new Set(seen)
    } catch {
      return new Set<string>()
    }
  }

  const markNotificationsSeen = (ids: string[]) => {
    if (typeof window === 'undefined') return
    const seen = getSeenNotifIds()
    ids.forEach(id => seen.add(id))
    localStorage.setItem(notifSeenKey, JSON.stringify(Array.from(seen)))
  }

  const markAllNotificationsRead = async () => {
    const items = await getNotifications(50, 0)
    if (items && items.length > 0) {
      markNotificationsSeen(items.map((n: any) => n.id))
    }
    setNotifUnreadCount(0)
  }

  useEffect(() => {
    if (user) {
      isAdmin().then(setAdminStatus)
    } else {
      setAdminStatus(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToNotifications((payload) => {
      const id = payload.id || `realtime-${payload.created_at}-${payload.title}`
      setNotifItems(prev => ([
        {
          id,
          title: payload.title,
          message: payload.message,
          level: payload.level,
          created_at: payload.created_at,
        },
        ...prev,
      ]))

      setNotifToast({ title: payload.title, message: payload.message })
      if (notifToastTimeout.current) clearTimeout(notifToastTimeout.current)
      notifToastTimeout.current = setTimeout(() => setNotifToast(null), 8000)

      try {
        const audio = new Audio('/sounds/notif.mp3')
        audio.volume = 0.5
        audio.play()
      } catch {}

      const seen = getSeenNotifIds()
      if (!seen.has(id)) {
        setNotifUnreadCount(prev => prev + 1)
      }
    })
    return () => {
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setNotifUnreadCount(0)
      return
    }
    ;(async () => {
      const items = await getNotifications(50, 0)
      const seen = getSeenNotifIds()
      const unread = (items || []).filter((n: any) => !seen.has(n.id)).length
      setNotifUnreadCount(unread)
    })()
  }, [user])

  // Load notification sound setting
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('ctf.notif.solveSound')
      if (raw !== null) {
        setSolveSoundEnabled(raw === 'true')
      }
    } catch {}
  }, [])

  // Persist notification sound setting
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('ctf.notif.solveSound', String(solveSoundEnabled))
    } catch {}
  }, [solveSoundEnabled])

  // Real-time solves subscription (aktif hanya jika APP.notifSolves true)
  useEffect(() => {
    if (!user || !APP.notifSolves) return;
    const unsubscribe = subscribeToSolves(({ username, challenge }) => {
      setSolveNotif({ username, challenge })
      // Play sound only if the solve is NOT by the current user
      if (solveSoundEnabled && username !== user.username) {
        try {
          const audio = new Audio('/sounds/notif_solves.mp3')
          audio.volume = 0.5
          audio.play()
        } catch {}
      }
      // Auto-hide after 6s
      if (notifTimeout.current) clearTimeout(notifTimeout.current)
      notifTimeout.current = setTimeout(() => setSolveNotif(null), 12000)
    })
    return () => {
      unsubscribe()
      if (notifTimeout.current) clearTimeout(notifTimeout.current)
    }
  }, [user, solveSoundEnabled])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await signOut()
    setUser(null)
    setAdminStatus(false)
    router.push('/login')
  }

  const dismissSolveNotif = () => {
    setSolveNotif(null)
    if (notifTimeout.current) {
      clearTimeout(notifTimeout.current)
      notifTimeout.current = null
    }
  }

  const dismissNotifToast = () => {
    setNotifToast(null)
    if (notifToastTimeout.current) {
      clearTimeout(notifToastTimeout.current)
      notifToastTimeout.current = null
    }
  }

  // Marquee/Toast notification style
  const notifVisible = !!solveNotif
  const notifToastVisible = !!notifToast

  const openNotifPanel = async () => {
    setNotifOpen((v) => !v)
    if (!notifOpen && user) {
      setNotifLoading(true)
      const items = await getNotifications(30, 0)
      setNotifItems(items || [])
      setNotifLoading(false)
    }
  }

  const handleSendNotif = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) return
    try {
      await createNotification(notifTitle.trim(), notifMessage.trim(), notifLevel)
      setNotifTitle('')
      setNotifMessage('')
    } catch (err) {
      console.warn('Failed to create notification', err)
    }
  }

  const handleDeleteNotif = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifItems(prev => prev.filter(n => n.id !== id))
      const seen = getSeenNotifIds()
      if (!seen.has(id)) {
        setNotifUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.warn('Failed to delete notification', err)
    }
  }

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'info_platform':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
      case 'info_challenges':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    }
  }

  const isNotifRead = (id: string) => {
    const seen = getSeenNotifIds()
    return seen.has(id)
  }

  const showTeamScoreboard = APP.teams.enabled
  const showUserScoreboard = !showTeamScoreboard || !APP.teams.hideScoreboardIndividual
  const scoreboardOptionCount = Number(showUserScoreboard) + Number(showTeamScoreboard)

  useEffect(() => {
    if (!scoreboardOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!scoreboardMenuRef.current) return
      if (!scoreboardMenuRef.current.contains(event.target as Node)) {
        setScoreboardOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [scoreboardOpen])

  useEffect(() => {
    if (!docsOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!docsMenuRef.current) return
      if (!docsMenuRef.current.contains(event.target as Node)) {
        setDocsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [docsOpen])

  useEffect(() => {
    if (!notifOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (notifPanelRef.current?.contains(target)) return
      if (notifButtonRef.current?.contains(target)) return
      setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notifOpen])

  useEffect(() => {
    if (notifOpen) setNotifOpen(false)
  }, [pathname])

  if (loading) return null

  return (
    <>
      {/* Real-time solve notification (marquee style) */}
      {notifVisible && (
        <div className="fixed top-16 right-2 z-[5000] flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-left" style={{ minWidth: 220, maxWidth: 350 }}>
          <svg className="mr-2" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="truncate flex-1">
            <b>{solveNotif.username}</b> just solved <b>{solveNotif.challenge}</b>!
          </span>
          <button
            onClick={dismissSolveNotif}
            className="ml-1 rounded-full p-1 hover:bg-blue-500/60 transition-colors"
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}
      {/* Real-time notification toast */}
      {notifToastVisible && (
        <div className="fixed top-16 right-2 z-[5000] flex items-start gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-700 animate-slide-in-left max-w-[92vw]" style={{ minWidth: 240, maxWidth: 420 }}>
          <div className="mt-0.5">
            <Bell size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{notifToast.title}</div>
            <div className="text-xs text-gray-300 line-clamp-2 break-words">{notifToast.message}</div>
          </div>
          <button
            onClick={dismissNotifToast}
            className="ml-1 rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}
    <nav className={`shadow-sm fixed top-0 left-0 w-full z-50 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2 group" data-tour="navbar-logo">
             <ImageWithFallback
                src={APP.image_icon}
                alt={`${APP.shortName} logo`}
                size={42}
                className="rounded-full"
              />
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

              {user && scoreboardOptionCount > 0 && (
                scoreboardOptionCount === 1 ? (
                  <Link
                    href={showTeamScoreboard ? '/teams/scoreboard' : '/scoreboard'}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                    data-tour="navbar-scoreboard"
                  >
                    <Trophy size={18} className="mr-1" /> Scoreboard
                  </Link>
                ) : (
                  <div ref={scoreboardMenuRef} className="relative">
                    <button
                      type="button"
                      data-tour="navbar-scoreboard"
                      onClick={() => setScoreboardOpen((v) => !v)}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                    >
                      <Trophy size={18} className="mr-1" /> Scoreboard
                      <svg className={`ml-1 h-3 w-3 opacity-70 transition-transform ${scoreboardOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08Z" />
                      </svg>
                    </button>
                    {scoreboardOpen && (
                      <div className={`absolute left-0 mt-2 min-w-[200px] rounded-lg border shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                        {showUserScoreboard && (
                          <Link
                            href="/scoreboard"
                            onClick={() => setScoreboardOpen(false)}
                            className={`block px-3 py-2 text-sm ${showTeamScoreboard ? 'rounded-t-lg' : 'rounded-lg'} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                          >
                            User Scoreboard
                          </Link>
                        )}
                        {showTeamScoreboard && (
                          <Link
                            href="/teams/scoreboard"
                            onClick={() => setScoreboardOpen(false)}
                            className={`block px-3 py-2 text-sm ${showUserScoreboard ? 'rounded-b-lg' : 'rounded-lg'} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                          >
                            Team Scoreboard
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {user && APP.teams.enabled && (
                <Link
                  href="/teams"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                >
                  <Users size={18} className="mr-1" /> Teams
                </Link>
              )}

              {/* Info Dropdown (Rules + Info + Docs) */}
              <div ref={docsMenuRef} className="relative">
                <button
                  type="button"
                  data-tour="navbar-docs"
                  onClick={() => setDocsOpen((v) => !v)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                >
                  <BookOpen size={18} className="mr-1" /> Info
                  <svg className={`ml-1 h-3 w-3 opacity-70 transition-transform ${docsOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08Z" />
                  </svg>
                </button>
                {docsOpen && (
                  <div className={`absolute left-0 mt-2 min-w-[200px] rounded-lg border shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <Link
                      href="/info"
                      onClick={() => setDocsOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-t-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      data-tour="navbar-info"
                    >
                      Info
                    </Link>
                    <Link
                      href="/rules"
                      onClick={() => setDocsOpen(false)}
                      className={`block px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      data-tour="navbar-rules"
                    >
                      Rules
                    </Link>
                    <Link
                      href="/docs"
                      onClick={() => setDocsOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-b-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      data-tour="navbar-docs"
                    >
                      Docs
                    </Link>
                  </div>
                )}
              </div>

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
                    <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-full" />
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

            {/* Notifications Icon (realtime + history) */}
            {user && (
            <div className="relative mr-2" data-tour="navbar-notifications">
              <button
                ref={notifButtonRef}
                className={`rounded-full p-1 transition-colors duration-150 ${notifOpen ? (theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100') : ''}`}
                title="Notifications"
                aria-label="Notifications"
                onClick={openNotifPanel}
              >
                <Bell size={22} className="text-blue-500" />
              </button>

              {notifUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                  {notifUnreadCount > 99 ? '99+' : String(notifUnreadCount)}
                </span>
              )}

              {notifOpen && (
                <div
                  ref={notifPanelRef}
                  className={`fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[420px] sm:max-w-[95vw] max-w-[95vw] rounded-xl shadow-xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} z-40`}
                >
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 font-semibold flex items-center justify-between">
                    <span>Notifications</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-gray-500 hover:underline sm:hidden"
                        aria-label="Close notifications"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Solve sound</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Play sound for solve notifications</div>
                    </div>
                    <Switch
                      checked={solveSoundEnabled}
                      onCheckedChange={setSolveSoundEnabled}
                    />
                  </div>
                  {adminStatus && (
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                      <input
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="Title"
                        className={`w-full mb-2 px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      />
                      <textarea
                        value={notifMessage}
                        onChange={(e) => setNotifMessage(e.target.value)}
                        placeholder="Message"
                        className={`w-full mb-2 px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        rows={2}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={notifLevel}
                          onChange={(e) => setNotifLevel(e.target.value as any)}
                          className={`px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                          <option value="info">Info</option>
                          <option value="info_platform">Info Platform</option>
                          <option value="info_challenges">Info Challenges</option>
                        </select>
                        <button
                          onClick={handleSendNotif}
                          className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="max-h-[70vh] sm:max-h-80 overflow-auto">
                    {notifLoading ? (
                      <div className="p-3 text-sm text-gray-500">Loading...</div>
                    ) : notifItems.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifItems.map((n) => (
                        <div
                          key={n.id}
                          className={`relative px-3 py-2 border-b border-gray-200 dark:border-gray-800 ${isNotifRead(n.id) ? 'opacity-70' : ''}`}
                        >
                          <div className={`min-w-0`}>
                            <div className="text-sm font-semibold flex flex-wrap items-center gap-2 min-w-0">
                              <span className="truncate flex-1 min-w-0">{n.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${getLevelBadgeClass(n.level)}`}>
                                {n.level === 'info_platform'
                                  ? 'Info Platform'
                                  : n.level === 'info_challenges'
                                  ? 'Info Challenges'
                                  : 'Info'}
                              </span>
                              {!isNotifRead(n.id) && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                  New
                                </span>
                              )}
                            </div>
                            <MarkdownRenderer
                              content={n.message}
                              className="text-xs text-gray-600 dark:text-gray-300 leading-snug break-words [&_p]:mb-1 [&_p]:leading-snug [&_p]:break-words"
                            />
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                              {n.created_at ? formatRelativeDate(n.created_at) : ''}
                            </div>
                          </div>
                          {adminStatus && (
                            <button
                              onClick={() => handleDeleteNotif(n.id)}
                              className="absolute bottom-2 right-2 text-xs text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Logs Icon */}
            {user && (
            <div className="relative mr-2" data-tour="navbar-logs">
              <button
                className={`rounded-full p-1 transition-colors duration-150 ${pathname === '/logs' ? (theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100') : ''}`}
                title="Logs"
                aria-label="Logs"
                onClick={() => {
                  if (pathname === '/logs') {
                    if (window.history.length > 1) {
                      router.back()
                    } else {
                      router.push('/')
                    }
                  } else {
                    router.push('/logs')
                  }
                }}
              >
                <FileText size={22} className="text-blue-500" />
              </button>

              {logsUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                  {logsUnreadCount > 99 ? '99+' : String(logsUnreadCount)}
                </span>
              )}
            </div>
            )}

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
                    <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-full" />
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
                  {scoreboardOptionCount > 0 && (
                    scoreboardOptionCount === 1 ? (
                      <Link
                        href={showTeamScoreboard ? '/teams/scoreboard' : '/scoreboard'}
                        className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Trophy size={18} className="mr-1" /> Scoreboard
                      </Link>
                    ) : (
                      <details className="rounded-lg">
                        <summary className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                          <Trophy size={18} className="mr-1" /> Scoreboard
                        </summary>
                        <div className="mt-1 ml-6 flex flex-col gap-1">
                          {showUserScoreboard && (
                            <Link
                              href="/scoreboard"
                              className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              User Scoreboard
                            </Link>
                          )}
                          {showTeamScoreboard && (
                            <Link
                              href="/teams/scoreboard"
                              className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Team Scoreboard
                            </Link>
                          )}
                        </div>
                      </details>
                    )
                  )}
                  {APP.teams.enabled && (
                    <Link
                      href="/teams"
                      className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users size={18} className="mr-1" /> Teams
                    </Link>
                  )}
                </>
              )}
              {/* Info Menu (Info + Rules + Docs) - Mobile */}
              <details className="rounded-lg">
                <summary className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <BookOpen size={18} className="mr-1" /> Info
                </summary>
                <div className="mt-1 ml-6 flex flex-col gap-1">
                  <Link
                    href="/info"
                    className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-tour="navbar-info"
                  >
                    Info
                  </Link>
                  <Link
                    href="/rules"
                    className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-tour="navbar-rules"
                  >
                    Rules
                  </Link>
                  <Link
                    href="/docs"
                    className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-tour="navbar-docs"
                  >
                    Docs
                  </Link>
                </div>
              </details>
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
