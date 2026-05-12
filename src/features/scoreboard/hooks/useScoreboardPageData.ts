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
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()
  const [hasMounted, setHasMounted] = useState(false)
  const [stableLeaderboard, setStableLeaderboard] = useState<LeaderboardEntry[]>([])
  const leaderboardLengthRef = useRef(0)

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
      if (isFirstLoad) setLoading(true)
      if (!user) {
        if (isFirstLoad) setLoading(false)
        return
      }

      const eventParam = getScoreboardEventParam(selectedEvent)

      if (firstBloodMode) {
        const firstBloodLeaderboard = await getFirstBloodLeaderboard(100, 0, eventParam)
        setLeaderboard(firstBloodLeaderboard)
        if (isFirstLoad) setLoading(false)
        return
      }

      const summary = await getLeaderboardSummary(100, 0, eventParam)
      const topUsernames = summary.slice(0, 10).map((row: LeaderboardSummaryRow) => row.username)
      const progressMap = await getTopProgressByUsernames(topUsernames, eventParam)

      const result = buildScoreboard(summary, {
        nameKey: 'username',
        scoreKey: 'score',
        limit: 100,
        progressMap
      })

      setLeaderboard(result.entries)
      if (isFirstLoad) setLoading(false)
    }

    fetchData()
  }, [user, firstBloodMode, selectedEvent])

  const eventParam = getScoreboardEventParam(selectedEvent)

  return {
    user,
    authLoading,
    theme,
    leaderboard,
    loading,
    firstBloodMode,
    setFirstBloodMode,
    startedEvents,
    selectedEvent,
    setSelectedEvent,
    hasMounted,
    stableLeaderboard,
    isEmpty: isScoreboardEmpty(leaderboard),
    isDark: theme === 'dark',
    eventParam,
  }
}
