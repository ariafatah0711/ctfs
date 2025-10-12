"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getNotifications } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'

type NotifShape = {
  notif_type: 'new_challenge' | 'first_blood'
  notif_challenge_id: string
  notif_challenge_title: string
  notif_category: string
  notif_user_id?: string
  notif_username?: string
  notif_created_at: string
}

type NotificationsContextType = {
  unreadCount: number
  refresh: () => Promise<void>
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const SEEN_KEY_PREFIX = 'ctfs_seen_notifications_v1:'

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const storageKey = user ? `${SEEN_KEY_PREFIX}${user.id}` : `${SEEN_KEY_PREFIX}anon`

  const notifId = (n: NotifShape) => `${n.notif_type}|${n.notif_challenge_id}|${n.notif_user_id || ''}|${n.notif_created_at}`

  async function refresh() {
    try {
      const notifs = await getNotifications(100, 0) as NotifShape[]
      const ids = notifs.map(notifId)
      const seenJson = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      const seen: string[] = seenJson ? JSON.parse(seenJson) : []
      const unread = ids.filter(id => !seen.includes(id)).length
      setUnreadCount(unread)
    } catch (err) {
      console.warn('Failed to refresh notifications', err)
    }
  }

  function markAllRead() {
    try {
      // fetch current notifications to know ids
      getNotifications(100, 0).then((notifs: any) => {
        const ids = (notifs || []).map((n: NotifShape) => notifId(n))
        const seenJson = localStorage.getItem(storageKey)
        const seen: string[] = seenJson ? JSON.parse(seenJson) : []
        const merged = Array.from(new Set([...seen, ...ids]))
        localStorage.setItem(storageKey, JSON.stringify(merged))
        setUnreadCount(0)
      }).catch(err => {
        console.warn('markAllRead failed to fetch notifs', err)
      })
    } catch (err) {
      console.warn('markAllRead error', err)
    }
  }

  useEffect(() => {
    // refresh when user changes
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider')
  return ctx
}
