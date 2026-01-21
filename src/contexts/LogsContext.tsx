"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getLogs } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'

type LogShape = {
  log_type: 'new_challenge' | 'first_blood'
  log_challenge_id: string
  log_challenge_title: string
  log_category: string
  log_user_id?: string
  log_username?: string
  log_created_at: string
}

type LogsContextType = {
  unreadCount: number
  refresh: () => Promise<void>
  markAllRead: () => void
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

const SEEN_KEY_PREFIX = 'ctfs_seen_logs_v1:'

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const storageKey = user ? `${SEEN_KEY_PREFIX}${user.id}` : `${SEEN_KEY_PREFIX}anon`

  const logId = (n: LogShape) => `${n.log_type}|${n.log_challenge_id}|${n.log_user_id || ''}|${n.log_created_at}`

  async function refresh() {
    try {
      if (!user) {
        setUnreadCount(0)
        return
      }
      const logs = await getLogs(100, 0) as LogShape[]
      const ids = logs.map(logId)
      const seenJson = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      const seen: string[] = seenJson ? JSON.parse(seenJson) : []
      const unread = ids.filter(id => !seen.includes(id)).length
      setUnreadCount(unread)
    } catch (err) {
      console.warn('Failed to refresh logs', err)
    }
  }

  function markAllRead() {
    try {
      if (!user) {
        setUnreadCount(0)
        return
      }
      // fetch current logs to know ids
      getLogs(100, 0).then((logs: any) => {
        const ids = (logs || []).map((n: LogShape) => logId(n))
        const seenJson = localStorage.getItem(storageKey)
        const seen: string[] = seenJson ? JSON.parse(seenJson) : []
        const merged = Array.from(new Set([...seen, ...ids]))
        localStorage.setItem(storageKey, JSON.stringify(merged))
        setUnreadCount(0)
      }).catch(err => {
        console.warn('markAllRead failed to fetch logs', err)
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
    <LogsContext.Provider value={{ unreadCount, refresh, markAllRead }}>
      {children}
    </LogsContext.Provider>
  )
}

export function useLogs() {
  const ctx = useContext(LogsContext)
  if (!ctx) throw new Error('useLogs must be used inside LogsProvider')
  return ctx
}
