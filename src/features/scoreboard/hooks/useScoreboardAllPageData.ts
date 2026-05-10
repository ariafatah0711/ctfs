'use client'

import { useEffect, useRef, useState } from 'react'
import { getLeaderboardSummary } from '@/shared/lib'
import { useAuth, useEventContext } from '@/shared/contexts'
import type { LeaderboardEntry } from '@/shared/types'
import { buildLeaderboardEntries, getScoreboardEventParam } from '../lib'
import type { LeaderboardSummaryRow } from '../types'

export function useScoreboardAllPageData() {
  const { user, loading: authLoading } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()
  const leaderboardLengthRef = useRef(0)

  useEffect(() => {
    leaderboardLengthRef.current = leaderboard.length
  }, [leaderboard.length])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      if (leaderboardLengthRef.current === 0) setLoading(true)

      const eventParam = getScoreboardEventParam(selectedEvent)
      const summary = await getLeaderboardSummary(1000, 0, eventParam)
      summary.sort((a: LeaderboardSummaryRow, b: LeaderboardSummaryRow) => (b.score ?? 0) - (a.score ?? 0))

      setLeaderboard(buildLeaderboardEntries(summary))
      setLoading(false)
    }

    fetchData()
  }, [user, selectedEvent])

  return {
    user,
    authLoading,
    leaderboard,
    loading,
    startedEvents,
    selectedEvent,
    setSelectedEvent,
  }
}
