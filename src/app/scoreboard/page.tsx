'use client'

import ScoreboardChart from '@/components/scoreboard/ScoreboardChart'
import ScoreboardTable from '@/components/scoreboard/ScoreboardTable'
import ScoreboardEmptyState from '@/components/scoreboard/ScoreboardEmptyState'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'

import { getLeaderboardSummary, getTopProgressByUsernames } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { LeaderboardEntry } from '@/types'

export default function ScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  // 🔒 redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
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
        const finalScore = history.at(-1)?.score ?? topForChart[i].score ?? 0
        baseLeaderboard[i].progress = history.map((p: any) => ({ date: String(p.date), score: p.score }))
        baseLeaderboard[i].score = finalScore
      }

      // 5) Set leaderboard: table will receive top 100, chart will use first entries with progress
      setLeaderboard(baseLeaderboard)
      setLoading(false)
    }
    fetchData()
  }, [user])

  // tunggu authContext
  if (authLoading) return <Loader fullscreen color="text-orange-500" />
  // do not render if not logged in (so redirect can happen)
  if (!user) return null

  const isEmpty =
    leaderboard.length === 0 ||
    leaderboard.every(e => (e.progress?.length ?? 0) === 0 || (e.score ?? 0) === 0)

  // detect dark mode from context to re-render when theme changes
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <TitlePage>🏆 Scoreboard</TitlePage>
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
              <ScoreboardTable leaderboard={leaderboard} currentUsername={user?.username} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
