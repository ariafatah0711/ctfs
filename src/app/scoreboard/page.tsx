'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLeaderboard } from '@/lib/challenges'
import { getCurrentUser } from '@/lib/auth'
import { User, LeaderboardEntry } from '@/types'
import Navbar from '@/components/Navbar'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function ScoreboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        window.location.href = '/login'
        return
      }
      setUser(currentUser)

      const data = await getLeaderboard()
      // Sort berdasarkan skor akhir (tertinggi ke terendah)
      data.sort((a: any, b: any) => {
        const scoreA = a.progress.length > 0 ? a.progress[a.progress.length - 1].score : 0
        const scoreB = b.progress.length > 0 ? b.progress[b.progress.length - 1].score : 0
        return scoreB - scoreA
      })
      const transformed: LeaderboardEntry[] = data.map((d: any, i: number) => ({
        id: String(i + 1),
        username: d.username,
        score: d.progress.length > 0 ? d.progress[d.progress.length - 1].score : 0,
        rank: i + 1,
        progress: d.progress.map((p: any) => ({
          date: String(p.date),
          score: p.score,
        })),
      }))

      setLeaderboard(transformed)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading scoreboard...</p>
        </div>
      </div>
    )
  }
  if (!user) return null

  const chartData = leaderboard.slice(0, 10).map((entry) => ({
    x: entry.progress.map((p) => p.date),
    y: entry.progress.map((p) => p.score),
    text: entry.progress.map((p) => `${entry.username} - ${p.score}`),
    hovertemplate: '%{x}<br>%{text}<extra></extra>',
    mode: 'lines+markers',
    name: entry.username,
    line: { shape: 'hv' },
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
          🏆 Scoreboard
        </h1>
        <div className="mb-6 sm:mb-8">
          {loading ? (
            <div className="w-full h-40 sm:h-64 bg-gray-200 animate-pulse rounded-lg mb-4 sm:mb-6"></div>
          ) : (
            <Plot
              data={chartData}
              layout={{
                dragmode: false,
                title: { text: 'Top 10 Users', x: 0.5, font: { size: 16 } },
                autosize: true,
                xaxis: {
                  type: 'date',
                  autorange: true,
                  tickfont: { size: 10 },
                },
                yaxis: {
                  autorange: true,
                  rangemode: 'tozero',
                  automargin: true,
                  title: { text: 'Score', font: { size: 12 } },
                  tickfont: { size: 10 },
                },
                legend: { orientation: 'h', x: 0.5, xanchor: 'center', font: { size: 10 } },
                margin: { t: 40, r: 10, l: 30, b: 30 },
              }}
              style={{ width: '100%', height: '220px' }} // Lebih pendek di HP
              useResizeHandler
              config={{
                scrollZoom: false,
                staticPlot: false,
                displayModeBar: true,
              }}
              revision={leaderboard.length}
            />
          )}
        </div>

        {/* Ranking Table Card */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-[340px] w-full border border-gray-200 rounded-lg text-xs sm:text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="w-12 sm:w-16 px-1 sm:px-2 py-1 sm:py-2 text-center text-[10px] sm:text-xs font-medium uppercase">Rank</th>
                  <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-[10px] sm:text-xs font-medium uppercase">User</th>
                  <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-[10px] sm:text-xs font-medium uppercase">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 25).map((entry, i) => (
                  <tr
                    key={entry.username}
                    className={`transition-colors hover:bg-blue-50 ${
                      i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-center font-mono text-[11px] sm:text-xs text-gray-600">
                      {i + 1}
                    </td>
                    <td className="px-2 sm:px-4 py-1 sm:py-2">
                      <Link
                        href={`/user/${entry.username}`}
                        className="hover:underline hover:text-blue-600 break-all"
                      >
                        {entry.username}
                      </Link>
                    </td>
                    <td className="px-2 sm:px-4 py-1 sm:py-2 font-medium">
                      {entry.progress.length > 0
                        ? entry.progress[entry.progress.length - 1].score
                        : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
