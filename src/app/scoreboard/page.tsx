'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'

import { getLeaderboard } from '@/lib/challenges'
import { useAuth } from '@/contexts/AuthContext'
import { LeaderboardEntry } from '@/types'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />
})

export default function ScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
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

  const chartData = leaderboard.slice(0, 10).map((entry) => {
    const x = entry.progress.map((p) => {
      const date = new Date(p.date)
      const offset = date.getTimezoneOffset() * 60000
      return new Date(date.getTime() - offset).toISOString().slice(0, 16)
    })
    return {
      x,
      y: entry.progress.map((p) => p.score),
      text: entry.progress.map((p) => `${entry.username} - ${p.score}`),
      hovertemplate: '%{x}<br>%{text}<extra></extra>',
      mode: 'lines+markers',
      name: entry.username,
      line: { shape: 'hv', width: 3 },
      marker: { size: 6 },
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <TitlePage>🏆 Scoreboard</TitlePage>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader fullscreen color="text-orange-500" />
          </div>
        ) : !user ? null : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"
            >
              <span className="text-4xl text-gray-400">🎯</span>
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges solved yet.</h3>
            <p className="text-gray-500">Leaderboard is empty! Be the first to solve a challenge 🚀</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-center">Top 10 Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={chartData}
                    layout={{
                      dragmode: false,
                      autosize: true,
                      xaxis: {
                        type: 'date',
                        autorange: true,
                        tickfont: { size: 10 },
                        tickformat: '%Y-%m-%d %H:%M',
                      },
                      yaxis: {
                        autorange: true,
                        rangemode: 'tozero',
                        automargin: true,
                        title: { text: 'Score', font: { size: 12 } },
                        tickfont: { size: 10 },
                      },
                      legend: {
                        orientation: 'h',
                        x: 0.5,
                        xanchor: 'center',
                        y: -0.2,
                        font: { size: 10 },
                      },
                      margin: { t: 20, r: 10, l: 30, b: 40 },
                      plot_bgcolor: "#fff",
                      paper_bgcolor: "#fff",
                    }}
                    style={{ width: '100%', height: '320px' }}
                    useResizeHandler
                    config={{ scrollZoom: false, displayModeBar: false }}
                  />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 text-center">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.slice(0, 100).map((entry, i) => {
                        const isCurrentUser = entry.username === user?.username
                        return (
                          <TableRow
                            key={entry.username}
                            className={`transition-colors hover:bg-blue-50 ${
                              isCurrentUser ? 'bg-blue-50 font-semibold' : ''
                            }`}
                          >
                            <TableCell className="text-center font-mono text-gray-600">{i + 1}</TableCell>
                            <TableCell>
                              <Link
                                href={`/user/${entry.username}`}
                                className={`hover:underline ${
                                  isCurrentUser ? 'text-blue-700' : 'hover:text-blue-600'
                                }`}
                              >
                                {entry.username}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center font-medium">{entry.score}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
