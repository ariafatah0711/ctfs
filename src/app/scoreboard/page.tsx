'use client'

import ScoreboardChart from '@/components/scoreboard/ScoreboardChart'
import ScoreboardTable from '@/components/scoreboard/ScoreboardTable'
import ScoreboardEmptyState from '@/components/scoreboard/ScoreboardEmptyState'
import { Coins, Droplet, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'
import { Button } from '@/components/ui/button'

import { getLeaderboardSummary, getTopProgressByUsernames, getFirstBloodLeaderboard } from '@/lib/challenges'
import APP from '@/config'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { LeaderboardEntry } from '@/types'
import EventSelect from '@/components/custom/EventSelect'
import { useEventContext } from '@/contexts/EventContext'

export default function ScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [firstBloodMode, setFirstBloodMode] = useState(false)
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()
  const [menuOpen, setMenuOpen] = useState(false)

  // 🔒 redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if (!user) {
        setLoading(false)
        return
      }
      // Map selectedEvent string to parameter accepted by helpers
      const eventParam = selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent
      // If firstBloodMode, fetch aggregated first-blood leaderboard (respecting selected event)
      if (firstBloodMode) {
        const fb = await getFirstBloodLeaderboard(100, 0, eventParam)
        setLeaderboard(fb)
        setLoading(false)
        return
      }

      // 1) Fetch lightweight summary (username + score)
      const summary = await getLeaderboardSummary(100, 0, eventParam)

      // 2) Sort by score desc. We want to show top 100 in the table
      summary.sort((a: any, b: any) => b.score - a.score)
      const top100 = summary.slice(0, 100)

      // Build base leaderboard entries for table (no progress history yet)
      const baseLeaderboard: LeaderboardEntry[] = top100.map((t: any, i: number) => ({
        id: String(i + 1),
        username: t.username,
        score: t.score ?? 0,
        rank: i + 1,
        progress: [],
      }))

      // 3) For the chart we still only need detailed progress for top 10 — fetch those
      const topForChart = top100.slice(0, 10)
      const topUsernames = topForChart.map((t: any) => t.username)
      const progressMap = await getTopProgressByUsernames(topUsernames, eventParam)

      // 4) Merge detailed progress for the top 10 into the base leaderboard
      for (let i = 0; i < topForChart.length; i++) {
        const uname = topForChart[i].username
        const history = progressMap[uname]?.history ?? []
        baseLeaderboard[i].progress = history.map((p: any) => ({ date: String(p.date), score: p.score }))
        // Keep summary score as source of truth to avoid mismatches with progress queries
        if (history.length > 0) {
          const historyScore = history.at(-1)?.score ?? 0
          baseLeaderboard[i].score = Math.max(baseLeaderboard[i].score ?? 0, historyScore)
        }
      }

      // 5) Set leaderboard: table will receive top 100, chart will use first entries with progress
      setLeaderboard(baseLeaderboard)
      setLoading(false)
    }
    fetchData()
  }, [user, firstBloodMode, selectedEvent])

  // tunggu authContext
  if (authLoading) return <Loader fullscreen color="text-orange-500" />
  // do not render if not logged in (so redirect can happen)
  if (!user) return null

  const isEmpty = (() => {
    if (leaderboard.length === 0) return true
    // Consider non-empty when any entry has progress or a score
    const hasProgress = leaderboard.some(e => (e.progress?.length ?? 0) > 0)
    const hasScore = leaderboard.some(e => (e.score ?? 0) > 0)
    return !(hasProgress || hasScore)
  })()

  // detect dark mode from context to re-render when theme changes
  const isDark = theme === 'dark'
  // Map selectedEvent string to parameter accepted by helpers for links
  const eventParam = selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* <TitlePage icon={<Trophy size={30} className="text-yellow-500 dark:text-yellow-300 drop-shadow" />}>Scoreboard</TitlePage> */}

        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            {/* Event selector */}
            <div className="inline-block">
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={startedEvents}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
              />
            </div>
          </div>

          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFirstBloodMode(false)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                !firstBloodMode
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Points"
              >
                <Coins size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  Points
                </span>
              </span>
            </button>
            <button
              onClick={() => setFirstBloodMode(true)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                firstBloodMode
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Points"
              >
                <Droplet size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  First Blood
                </span>
              </span>
            </button>
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader fullscreen color="text-orange-500" />
          </div>
        ) : !user ? null : isEmpty ? (
          <ScoreboardEmptyState />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ScoreboardChart leaderboard={leaderboard} isDark={isDark} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ScoreboardTable
                leaderboard={leaderboard}
                currentUsername={user?.username}
                eventId={eventParam}
                // When in First Blood mode we reuse `score` as the FB count and relabel the column
                scoreColumnLabel={firstBloodMode ? 'First Blood' : undefined}
                scoreColumnRenderer={entry => entry.score}
                showAllLink={!firstBloodMode}
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
