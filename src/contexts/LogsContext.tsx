"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getLogs, getChallenges } from '@/lib/challenges'
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
  // markAllRead optionally accepts an eventId filter (null | 'all' | eventId)
  markAllRead: (eventId?: string | null | 'all') => void
  // Return a set of challenge ids for a given event (cached)
  getEventChallengeIds: (eventId: string | null | 'all') => Promise<Set<string> | null>
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

const SEEN_KEY_PREFIX = 'ctfs_seen_logs_v1:'

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)

  // In-memory cache for event -> challenge id list (persist across renders)
  const eventChallengeCacheRef = useRef<Record<string, string[]>>({})

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

  // Return a Set of challenge ids for the given eventId.
  // Caches results in-memory and in sessionStorage to avoid repeated RPCs.
  async function getEventChallengeIds(eventId: string | null | 'all') {
    if (!eventId || eventId === 'all') return null
    const key = `ctfs_event_challenge_ids_v1:${eventId}`
    // check in-memory
    if (eventChallengeCacheRef.current[eventId]) return new Set(eventChallengeCacheRef.current[eventId])
    // check sessionStorage
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null
      if (stored) {
        const arr: string[] = JSON.parse(stored)
        eventChallengeCacheRef.current[eventId] = arr
        return new Set(arr)
      }
    } catch (err) {
      // ignore
    }

    // fetch from server
    try {
      const challenges = await getChallenges(undefined, true, eventId as any)
      const ids = (challenges || []).map((c: any) => String(c.id))
      eventChallengeCacheRef.current[eventId] = ids
      try {
        if (typeof window !== 'undefined') sessionStorage.setItem(key, JSON.stringify(ids))
      } catch (err) {}
      return new Set(ids)
    } catch (err) {
      console.warn('getEventChallengeIds failed', err)
      return null
    }
  }

  function markAllRead(eventId?: string | null | 'all') {
    try {
      if (!user) {
        setUnreadCount(0)
        return
      }
      // fetch current logs to know ids
      // If an eventId filter is provided (and not 'all'), fetch challenges for that event
      if (eventId !== undefined && eventId !== 'all') {
        // need to mark only logs whose challenge id belongs to that event
        Promise.all([getLogs(100, 0), getEventChallengeIds(eventId as any)])
          .then(([logs, allowedSet]: [any[], Set<string> | null]) => {
            const allowed = allowedSet || new Set<string>()
            const ids = (logs || [])
              .filter((n: LogShape) => allowed.has(String(n.log_challenge_id)))
              .map((n: LogShape) => logId(n))
            const seenJson = localStorage.getItem(storageKey)
            const seen: string[] = seenJson ? JSON.parse(seenJson) : []
            const merged = Array.from(new Set([...seen, ...ids]))
            localStorage.setItem(storageKey, JSON.stringify(merged))
            // recompute unread by subtracting newly seen ids from current logs
            const remaining = (logs || []).map(logId).filter(id => !merged.includes(id)).length
            setUnreadCount(remaining)
          }).catch(err => {
            console.warn('markAllRead failed to fetch logs/challenges', err)
          })
      } else {
        // No event filter or eventId === 'all' -> mark all logs as read
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
      }
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
    <LogsContext.Provider value={{ unreadCount, refresh, markAllRead, getEventChallengeIds }}>
      {children}
    </LogsContext.Provider>
  )
}

export function useLogs() {
  const ctx = useContext(LogsContext)
  if (!ctx) throw new Error('useLogs must be used inside LogsProvider')
  return ctx
}
