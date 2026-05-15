'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getFirstBloodLeaderboard,
  getLeaderboardSummary,
  getTopProgressByUsernames,
} from '@/shared/lib'
import { useAuth, useTheme } from '@/shared/contexts'
import { useEventContext } from '@/features/events/contexts/EventContext'
import type { LeaderboardEntry } from '@/shared/types'
import {
  getScoreboardEventParam,
  buildScoreboard,
  isScoreboardEmpty,
} from '../lib'
import type { LeaderboardSummaryRow } from '../types'

export function useScoreboardPageData() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [firstBloodMode, setFirstBloodMode] = useState(false)
  const [view, setView] = useState<'top' | 'all'>('top')
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()
  const [hasMounted, setHasMounted] = useState(false)
  const [stableLeaderboard, setStableLeaderboard] = useState<LeaderboardEntry[]>([])
  const leaderboardLengthRef = useRef(0)
  const fetchStateRef = useRef({ event: selectedEvent, fb: firstBloodMode, limit: 100 })

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    leaderboardLengthRef.current = leaderboard.length
    if (leaderboard.length > 0) {
      setStableLeaderboard(leaderboard)
    }
  }, [leaderboard])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      const isFirstLoad = leaderboardLengthRef.current === 0
      const targetLimit = view === 'all' ? 1000 : 100
      const lastFetch = fetchStateRef.current

      // Check if we already have sufficient data for the current context to avoid refetching
      const isSameContext = lastFetch.event === selectedEvent && lastFetch.fb === firstBloodMode
      if (isSameContext && lastFetch.limit >= targetLimit && leaderboard.length > 0) {
        return
      }

      if (isFirstLoad) setLoading(true)
      if (!user) {
        if (isFirstLoad) setLoading(false)
        return
      }

      const eventParam = getScoreboardEventParam(selectedEvent)

      if (firstBloodMode) {
        const firstBloodLeaderboard = await getFirstBloodLeaderboard(targetLimit, 0, eventParam)
        setLeaderboard(firstBloodLeaderboard)
        fetchStateRef.current = { event: selectedEvent, fb: firstBloodMode, limit: targetLimit }
        if (isFirstLoad) setLoading(false)
        return
      }

      const summary = await getLeaderboardSummary(targetLimit, 0, eventParam)
      const topUsernames = summary.slice(0, 10).map((row: LeaderboardSummaryRow) => row.username)
      const progressMap = await getTopProgressByUsernames(topUsernames, eventParam)

      const result = buildScoreboard(summary, {
        nameKey: 'username',
        scoreKey: 'score',
        limit: targetLimit,
        progressMap
      })

      setLeaderboard(result.entries)
      fetchStateRef.current = { event: selectedEvent, fb: firstBloodMode, limit: targetLimit }
      if (isFirstLoad) setLoading(false)
    }

    fetchData()
  }, [user, firstBloodMode, selectedEvent, view])

  const eventParam = getScoreboardEventParam(selectedEvent)

  const displayedLeaderboard = view === 'top' ? leaderboard.slice(0, 100) : leaderboard
  const displayedStableLeaderboard = view === 'top' ? stableLeaderboard.slice(0, 100) : stableLeaderboard

  return {
    user,
    authLoading,
    theme,
    leaderboard: displayedLeaderboard,
    loading,
    firstBloodMode,
    setFirstBloodMode,
    view,
    setView,
    startedEvents,
    selectedEvent,
    setSelectedEvent,
    hasMounted,
    stableLeaderboard: displayedStableLeaderboard,
    isEmpty: isScoreboardEmpty(displayedLeaderboard),
    isDark: theme === 'dark',
    eventParam,
  }
}
