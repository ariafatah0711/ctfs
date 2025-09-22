'use client'

import dynamic from 'next/dynamic'
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

      // Transform supaya cocok sama LeaderboardEntry
      const transformed: LeaderboardEntry[] = data.map((d: any, i: number) => ({
        id: String(i + 1), // kalau backend ada id, pakai itu
        username: d.username,
        score: d.progress.length > 0 ? d.progress[d.progress.length - 1].score : 0,
        rank: i + 1,
        progress: d.progress.map((p: any) => ({
          date: String(p.date), // pastikan string
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
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading scoreboard...</p>
            </div>
          </div>
        </div>
      )
    }
  if (!user) return null

  // transform leaderboard jadi chartData
  const chartData = leaderboard.slice(0, 10).map((entry) => ({
    x: entry.progress.map(p => p.date),
    y: entry.progress.map(p => p.score),
    text: entry.progress.map(p => `${entry.username} - ${p.score}`), // buat isi hover
    hovertemplate: '%{x}<br>%{text}<extra></extra>',
    mode: 'lines+markers',
    name: entry.username,
    line: { shape: 'hv' }
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Scoreboard</h1>

        <div className="bg-white shadow rounded-lg p-4 mb-8">
        <Plot
          data={chartData}
          layout={{
            dragmode: false,
            title: { text: 'Top 10 Users' }, // ✅ string dibungkus object
            autosize: true,
            xaxis: {
              type: 'date',
              autorange: true,
              title: { text: 'Tanggal' }     // ✅ juga harus object
            },
            yaxis: {
              autorange: true,
              rangemode: 'tozero',
              automargin: true,
              title: { text: 'Score' }       // ✅ juga harus object
            },
            legend: { orientation: 'h' }
          }}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler
          config={{
            scrollZoom: false,
            staticPlot: false,
            displayModeBar: true
          }}
          revision={leaderboard.length}
        />
        </div>

        {/* Ranking Table */}
       <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Top 25 Ranking</h2>
        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Rank</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.slice(0, 25).map((entry, i) => (
              <tr
                key={entry.username}
                className={`border-t ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${i < 3 ? 'font-bold' : ''}`}
              >
                <td className="px-3 py-1.5">{i + 1}</td>
                <td className="px-3 py-1.5">{entry.username}</td>
                <td className="px-3 py-1.5">
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
  )
}
