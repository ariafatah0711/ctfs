'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'
import ScoreboardTable from '@/components/scoreboard/ScoreboardTable'
import BackButton from '@/components/custom/BackButton'
import { getLeaderboardSummary } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'
import { LeaderboardEntry } from '@/types'
import Link from 'next/link'

export default function ScoreboardAllPage() {
  const { user, loading: authLoading } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      // Ambil semua data (limit besar)
      const summary = await getLeaderboardSummary(1000, 0)
      summary.sort((a: any, b: any) => b.score - a.score)

      const all = summary.map((t: any, i: number) => ({
        id: String(i + 1),
        username: t.username,
        score: t.score ?? 0,
        rank: i + 1,
        progress: [],
      }))

      setLeaderboard(all)
      setLoading(false)
    }

    fetchData()
  }, [user])

  if (authLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <BackButton href="/scoreboard" label="Back to Top 100" />
          </div>
          <span className="text-gray-500 text-sm">
            Showing {leaderboard.length} users
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader fullscreen color="text-orange-500" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ScoreboardTable
              leaderboard={leaderboard}
              currentUsername={user?.username}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
