'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getFirstBloodLeaderboard,
  getLeaderboardSummary,
  getTopProgressByUsernames,
} from '@/shared/lib'
import { useAuth, useEventContext, useTheme } from '@/shared/contexts'
import type { LeaderboardEntry } from '@/shared/types'
import {
  applyProgressHistory,
  buildLeaderboardEntries,
  getScoreboardEventParam,
  isLeaderboardEmpty,
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
      summary.sort((a: LeaderboardSummaryRow, b: LeaderboardSummaryRow) => (b.score ?? 0) - (a.score ?? 0))
      const top100 = summary.slice(0, 100)
      const baseLeaderboard = buildLeaderboardEntries(top100)
      const topForChart = top100.slice(0, 10)
      const topUsernames = topForChart.map((entry: LeaderboardSummaryRow) => entry.username)
      const progressMap = await getTopProgressByUsernames(topUsernames, eventParam)

      applyProgressHistory(baseLeaderboard, topForChart, progressMap)
      setLeaderboard(baseLeaderboard)
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
    isEmpty: isLeaderboardEmpty(leaderboard),
    isDark: theme === 'dark',
    eventParam,
  }
}
