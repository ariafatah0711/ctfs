'use client'

import { useEffect, useRef, useState } from 'react'
import { getLeaderboardSummary } from '@/shared/lib'
import { useAuth, useEventContext } from '@/shared/contexts'
import type { LeaderboardEntry } from '@/shared/types'
import { buildScoreboard, getScoreboardEventParam } from '../lib'

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

      const result = buildScoreboard(summary, {
        nameKey: 'username',
        scoreKey: 'score',
        limit: 1000
      })

      setLeaderboard(result.entries)
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
