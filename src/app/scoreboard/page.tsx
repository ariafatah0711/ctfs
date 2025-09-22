'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getLeaderboard } from '@/lib/challenges'
import { LeaderboardEntry, User } from '@/types'
import Navbar from '@/components/Navbar'

export default function ScoreboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)
      
      const leaderboardData = await getLeaderboard()
      setLeaderboard(leaderboardData)
      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200'
    if (rank === 2) return 'bg-gray-50 border-gray-200'
    if (rank === 3) return 'bg-orange-50 border-orange-200'
    return 'bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Scoreboard</h1>
            <p className="mt-2 text-gray-600">Ranking peserta berdasarkan total score</p>
          </div>

          {/* Current User Stats */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Anda</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{user.score}</div>
                <div className="text-sm text-gray-500">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {leaderboard.find(entry => entry.id === user.id)?.rank || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Ranking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{leaderboard.length}</div>
                <div className="text-sm text-gray-500">Total Peserta</div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
            </div>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Belum ada data leaderboard</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`px-6 py-4 flex items-center justify-between ${
                      entry.id === user.id ? 'bg-primary-50' : getRankColor(entry.rank)
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          entry.rank <= 3 ? 'text-white' : 'text-gray-600'
                        } ${
                          entry.rank === 1 ? 'bg-yellow-500' :
                          entry.rank === 2 ? 'bg-gray-400' :
                          entry.rank === 3 ? 'bg-orange-500' :
                          'bg-gray-200'
                        }`}>
                          {getRankIcon(entry.rank)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/user/${entry.username}`}
                            className={`text-lg font-medium hover:underline ${
                              entry.id === user.id ? 'text-primary-700' : 'text-gray-900'
                            }`}
                          >
                            {entry.username}
                          </a>
                          {entry.id === user.id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Rank #{entry.rank}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{entry.score}</div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
