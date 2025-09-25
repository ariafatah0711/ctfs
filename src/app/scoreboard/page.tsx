'use client'

import ScoreboardChart from '@/components/scoreboard/ScoreboardChart'
import ScoreboardTable from '@/components/scoreboard/ScoreboardTable'
import ScoreboardEmptyState from '@/components/scoreboard/ScoreboardEmptyState'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'

import { getLeaderboard } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { LeaderboardEntry } from '@/types'

export default function ScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  // 🔒 redirect kalau belum login
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
      const data = await getLeaderboard()

      data.sort((a: any, b: any) => {
        const scoreA = a.progress.at(-1)?.score ?? 0
        const scoreB = b.progress.at(-1)?.score ?? 0
        if (scoreB !== scoreA) return scoreB - scoreA
        const lastSolveA = a.progress.at(-1)
          ? new Date(a.progress.at(-1).date).getTime()
          : Infinity
        const lastSolveB = b.progress.at(-1)
          ? new Date(b.progress.at(-1).date).getTime()
          : Infinity
        return lastSolveA - lastSolveB
      })

      const transformed: LeaderboardEntry[] = data.map((d: any, i: number) => {
        const finalScore = d.progress.at(-1)?.score ?? 0
        return {
          id: String(i + 1),
          username: d.username,
          score: finalScore,
          rank: i + 1,
          progress: d.progress.map((p: any) => ({
            date: String(p.date),
            score: p.score,
          })),
        }
      })

      setLeaderboard(transformed)
      setLoading(false)
    }
    fetchData()
  }, [user])

  // tunggu authContext
  if (authLoading) return <Loader fullscreen color="text-orange-500" />
  // jangan render kalau belum login (biar redirect jalan)
  if (!user) return null

  const isEmpty =
    leaderboard.length === 0 ||
    leaderboard.every(e => (e.progress?.length ?? 0) === 0 || (e.score ?? 0) === 0)

  // detect dark mode dari context agar re-render saat theme berubah
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
