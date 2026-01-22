'use client'

import ScoreboardChart from '@/components/scoreboard/ScoreboardChart'
import ScoreboardTable from '@/components/scoreboard/ScoreboardTable'
import ScoreboardEmptyState from '@/components/scoreboard/ScoreboardEmptyState'
import { Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'

import { getLeaderboardSummary, getTopProgressByUsernames, getFirstBloodLeaderboard } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { LeaderboardEntry } from '@/types'

export default function ScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [firstBloodMode, setFirstBloodMode] = useState(false)

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
      // If firstBloodMode, fetch aggregated first-blood leaderboard
      if (firstBloodMode) {
        const fb = await getFirstBloodLeaderboard(100, 0)
        setLeaderboard(fb)
        setLoading(false)
        return
      }

      // 1) Fetch lightweight summary (username + score)
      const summary = await getLeaderboardSummary()

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
      const progressMap = await getTopProgressByUsernames(topUsernames)

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
  }, [user, firstBloodMode])

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <TitlePage icon={<Trophy size={30} className="text-yellow-500 dark:text-yellow-300 drop-shadow" />}>Scoreboard</TitlePage>
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            onClick={() => setFirstBloodMode(false)}
            className={`w-full px-3 py-1 text-sm rounded-md ${firstBloodMode ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'bg-indigo-600 text-white'}`}
          >
            Points
          </button>
          <button
            onClick={() => setFirstBloodMode(true)}
            className={`w-full px-3 py-1 text-sm rounded-md ${firstBloodMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            First Blood
          </button>
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
